"""Offline teaching model and public data. This model follows rules, not LLM inference."""
import json
import os
from pathlib import Path
import sqlite3
import sys
from contextlib import closing
from typing import Any

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Examples never upload traces or deserialize arbitrary checkpoint object types.
os.environ['LANGSMITH_TRACING'] = 'false'
os.environ['LANGCHAIN_TRACING_V2'] = 'false'
os.environ['LANGGRAPH_STRICT_MSGPACK'] = 'true'

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, ToolMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from langchain.tools import tool
from pydantic import BaseModel, Field

PUBLIC_RESOURCES = {
    'Python': 'https://docs.python.org/zh-cn/3/tutorial/',
    'LangChain': 'https://docs.langchain.com/oss/python/langchain/quickstart',
    'LangGraph': 'https://docs.langchain.com/oss/python/langgraph/overview',
}

@tool
def search_resources(topic: str) -> str:
    """Look up one topic in a small local catalogue of public official documentation."""
    matches = [{'topic': name, 'url': url} for name, url in PUBLIC_RESOURCES.items()
               if name.casefold() == topic.strip().casefold()]
    return json.dumps(matches, ensure_ascii=False)

class StudyPlan(BaseModel):
    topic: str
    minutes: int = Field(ge=15, le=120)
    actions: list[str] = Field(min_length=1, max_length=5)
    sources: list[str] = Field(min_length=1, max_length=3)

class ScriptedStudyModel(BaseChatModel):
    """A deterministic test double with real tool-call messages; not a real AI model."""
    plan_output: bool = False

    @property
    def _llm_type(self) -> str:
        return 'agent-path-scripted-teaching-model'

    def bind_tools(self, tools: Any, **kwargs: Any):
        # Only our fixed tools are emitted below. A real provider uses these schemas.
        return self

    def _generate(self, messages: list[BaseMessage], stop=None, run_manager=None, **kwargs) -> ChatResult:
        if isinstance(messages[-1], ToolMessage):
            rows = json.loads(str(messages[-1].content))
            if not rows:
                message = AIMessage(content='离线资料库没有这个主题，不能编造来源。')
            elif self.plan_output:
                row = rows[0]
                message = AIMessage(content='', tool_calls=[{
                    'name': 'StudyPlan', 'args': {'topic': row['topic'], 'minutes': 60,
                    'actions': ['阅读官方入门', '运行并修改一个例子', '记录验证结果'],
                    'sources': [row['url']]}, 'id': 'plan-result', 'type': 'tool_call',
                }])
            else:
                row = rows[0]
                message = AIMessage(content=f"{row['topic']} 的官方资料：{row['url']}")
        else:
            humans = [message for message in messages if isinstance(message, HumanMessage)]
            query = str(humans[-1].content) if humans else ''
            # '继续' explicitly reuses earlier human messages in this same thread.
            candidates = list(reversed(humans)) if '继续' in query else humans[-1:]
            topic = next((name for message in candidates for name in PUBLIC_RESOURCES
                          if name.casefold() in str(message.content).casefold()), '未知主题')
            message = AIMessage(content='', tool_calls=[{
                'name': 'search_resources', 'args': {'topic': topic},
                'id': f'lookup-{len(messages)}', 'type': 'tool_call',
            }])
        return ChatResult(generations=[ChatGeneration(message=message)])

def model_for(live: bool = False, structured: bool = False):
    if not live:
        return ScriptedStudyModel(plan_output=structured)
    model_id = os.environ.get('LAB_MODEL', '')
    if not model_id:
        raise ValueError('--live 需要你明确设置 LAB_MODEL，并安装所选提供商适配包；真实调用可能收费。')
    from langchain.chat_models import init_chat_model
    return init_chat_model(model_id)

def write_once(directory: Path, task_id: str, payload: dict) -> int:
    """One business action per task, even when graph execution is retried."""
    directory.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(directory / 'actions.sqlite3')) as db, db:
        db.execute('CREATE TABLE IF NOT EXISTS actions (task_id TEXT PRIMARY KEY, payload TEXT NOT NULL)')
        db.execute('INSERT OR IGNORE INTO actions VALUES (?, ?)',
                   (task_id, json.dumps(payload, ensure_ascii=False)))
        return db.execute('SELECT count(*) FROM actions WHERE task_id=?', (task_id,)).fetchone()[0]

def action_count(directory: Path, task_id: str) -> int:
    path = directory / 'actions.sqlite3'
    if not path.exists():
        return 0
    with closing(sqlite3.connect(path)) as db:
        return db.execute('SELECT count(*) FROM actions WHERE task_id=?', (task_id,)).fetchone()[0]

def show(value: Any):
    print(json.dumps(value, ensure_ascii=False, default=str))
