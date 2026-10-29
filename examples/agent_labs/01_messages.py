"""Run: python 01_messages.py. Offline fake output demonstrates the message interface."""

from lab_support import show
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.language_models.fake_chat_models import FakeListChatModel


def run():
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "你是编程学习助手，用简单中文解释。"),
            ("human", "请解释 {topic}，我今天有 {minutes} 分钟。"),
        ]
    )
    messages = prompt.invoke({"topic": "Python 函数", "minutes": 30}).to_messages()
    model = FakeListChatModel(responses=["函数把一段操作起个名字，之后可以重复调用。"])
    response = model.invoke(messages)
    return {
        "mode": "offline-scripted",
        "messages": [m.content for m in messages],
        "reply": response.content,
    }


if __name__ == "__main__":
    show(run())
