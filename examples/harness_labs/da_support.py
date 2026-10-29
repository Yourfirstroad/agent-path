"""公共教学模型：只按脚本提出调用；真正执行工具的是 Deep Agents。"""

import json
import os
import sys
from typing import Any

os.environ["LANGSMITH_TRACING"] = "false"
os.environ["LANGCHAIN_TRACING_V2"] = "false"
os.environ["LANGGRAPH_STRICT_MSGPACK"] = "true"
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, ToolMessage, HumanMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from pydantic import Field
from langchain.tools import tool


class ScriptModel(BaseChatModel):
    steps: list[dict] = Field(default_factory=list)
    seen_system: list[str] = Field(default_factory=list, exclude=True)

    @property
    def _llm_type(self):
        return "offline-script-not-real-reasoning"

    def bind_tools(self, tools: Any, **kwargs):
        names = {
            t.name
            if hasattr(t, "name")
            else t.get("name", t.get("function", {}).get("name"))
            for t in tools
        }
        missing = {step["name"] for step in self.steps} - names
        if missing:
            raise ValueError(f"脚本引用了未提供的工具：{missing}")
        return self

    def get_num_tokens(self, text):
        # 只给框架一个保守教学估数；不用它统计实际费用或模型 token。
        return len(text)

    def _generate(self, messages, stop=None, run_manager=None, **kwargs):
        self.seen_system[:] = [str(m.content) for m in messages if m.type == "system"]
        # 仅统计当前一轮 human 之后的调用；可从已保存消息恢复，无隐藏游标。
        last_user = max(
            (i for i, m in enumerate(messages) if isinstance(m, HumanMessage)),
            default=-1,
        )
        recent = messages[last_user + 1 :]
        count = sum(len(m.tool_calls) for m in recent if isinstance(m, AIMessage))
        if count < len(self.steps):
            step = self.steps[count]
            message = AIMessage(
                content="",
                tool_calls=[
                    {
                        **step,
                        "id": f"script-{len(messages)}-{count}",
                        "type": "tool_call",
                    }
                ],
            )
        else:
            results = [str(m.content) for m in recent if isinstance(m, ToolMessage)]
            message = AIMessage(
                content="离线流程结束；工具实际返回：\n" + "\n".join(results)
            )
        return ChatResult(generations=[ChatGeneration(message=message)])


@tool
def lookup(topic: str) -> str:
    """查询随课程提供的官方资料目录；不是实时互联网搜索。"""
    catalog = {
        "Python": "https://docs.python.org/3/tutorial/",
        "Deep Agents": "https://docs.langchain.com/oss/python/deepagents/overview",
    }
    return json.dumps(
        {"topic": topic, "url": catalog.get(topic), "found": topic in catalog},
        ensure_ascii=False,
    )


def call(name, **args):
    return {"name": name, "args": args}


def tool_results(state):
    return [
        {"name": m.name, "content": str(m.content), "status": m.status}
        for m in state["messages"]
        if isinstance(m, ToolMessage)
    ]


def show(value):
    print(json.dumps(value, ensure_ascii=False, indent=2))
