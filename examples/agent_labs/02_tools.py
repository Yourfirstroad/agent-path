"""Run: python 02_tools.py. Tools execute ordinary Python with checked inputs."""

from lab_support import search_resources, show
from langchain.tools import tool
from pydantic import BaseModel, Field, ValidationError


class MinutesInput(BaseModel):
    minutes: int = Field(ge=15, le=120, description="今天可用的学习分钟数")


@tool(args_schema=MinutesInput)
def split_study_time(minutes: int) -> dict:
    """Split a study session into reading, practice and review minutes."""
    reading = minutes // 4
    return {"reading": reading, "practice": minutes - 2 * reading, "review": reading}


def run():
    rejected = False
    try:
        split_study_time.invoke({"minutes": -5})
    except ValidationError:
        rejected = True
    return {
        "tool_name": split_study_time.name,
        "schedule": split_study_time.invoke({"minutes": 60}),
        "resources": search_resources.invoke({"topic": "LangChain"}),
        "invalid_input_rejected": rejected,
    }


if __name__ == "__main__":
    show(run())
