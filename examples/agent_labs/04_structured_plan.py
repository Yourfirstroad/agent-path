"""Run: python 04_structured_plan.py. The actual agent returns a validated StudyPlan."""
import argparse
from lab_support import StudyPlan, model_for, search_resources, show
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy

def make_plan(topic='LangGraph', live=False):
    agent = create_agent(model=model_for(live, structured=True), tools=[search_resources],
        system_prompt='先查询官方资料，再生成 60 分钟学习计划。没有来源时不要生成计划。',
        response_format=ToolStrategy(StudyPlan))
    result = agent.invoke({'messages': [{'role': 'user', 'content': f'为 {topic} 制定学习计划'}]},
                          {'recursion_limit': 12})
    plan = result.get('structured_response')
    if not isinstance(plan, StudyPlan):
        raise ValueError('没有得到有效计划，请检查主题或工具调用模型。')
    return plan

if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--live', action='store_true')
    parser.add_argument('--topic', default='LangGraph'); args = parser.parse_args()
    show(make_plan(args.topic, args.live).model_dump())
