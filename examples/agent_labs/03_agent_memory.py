"""Run: python 03_agent_memory.py. Add --live only after configuring your own model."""
import argparse
from lab_support import model_for, search_resources, show
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

def run(live=False):
    agent = create_agent(model=model_for(live), tools=[search_resources],
        system_prompt='只使用工具返回的官方来源；没有来源时明确说不知道。',
        checkpointer=InMemorySaver())
    config = {'configurable': {'thread_id': 'conversation-a'}, 'recursion_limit': 12}
    first = agent.invoke({'messages': [{'role': 'user', 'content': '查找 LangGraph 的学习资料'}]}, config)
    second = agent.invoke({'messages': [{'role': 'user', 'content': '继续刚才的主题，给我资料入口'}]}, config)
    other = agent.invoke({'messages': [{'role': 'user', 'content': '继续刚才的主题'}]},
        {'configurable': {'thread_id': 'conversation-b'}, 'recursion_limit': 12})
    return {'mode': 'live' if live else 'offline-scripted', 'first': first['messages'][-1].content,
        'same_thread': second['messages'][-1].content, 'other_thread': other['messages'][-1].content,
        'tool_messages': sum(m.type == 'tool' for m in second['messages'])}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--live', action='store_true')
    show(run(parser.parse_args().live))
