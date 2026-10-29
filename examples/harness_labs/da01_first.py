"""第一课：创建真实 Deep Agents，调用一个本地资料工具。"""

import argparse
import os
from da_support import ScriptModel, call, lookup, show, tool_results
from deepagents import create_deep_agent
from langchain.chat_models import init_chat_model


def run(topic="Deep Agents", live=False, model_id=None):
    if live:
        if not model_id or ":" not in model_id:
            raise ValueError(
                "真实调用需显式设置 LAB_MODEL=提供商:模型名；费用与凭证由你确认。"
            )
        # 只有显式 --live 才使用提供商；API Key 由其适配器从本机环境读取。
        model = init_chat_model(model_id)
    else:
        model = ScriptModel(steps=[call("lookup", topic=topic)])
    agent = create_deep_agent(
        model=model,
        tools=[lookup],
        system_prompt="只根据工具返回的来源回答，不编造资料。",
    )
    return agent.invoke(
        {"messages": [("user", f"查找 {topic} 资料")]}, {"recursion_limit": 30}
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--live", action="store_true", help="显式使用真实模型，可能收费"
    )
    parser.add_argument("--topic", default="Deep Agents")
    args = parser.parse_args()
    result = run(args.topic, args.live, os.environ.get("LAB_MODEL"))
    show(tool_results(result))
    print(result["messages"][-1].content)
    if not args.live:
        show(tool_results(run("不存在的主题")))
