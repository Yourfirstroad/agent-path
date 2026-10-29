from pydantic import BaseModel, Field, ValidationError


class SearchInput(BaseModel):
    query: str = Field(min_length=1, max_length=40)


def search_notes(query):
    notes = ["Python 函数", "HTTP 请求", "Agent 工具"]
    return [n for n in notes if query.lower() in n.lower()]


def dispatch(call):
    if not isinstance(call, dict) or call.get("name") != "search_notes":
        return {"ok": False, "error": "unknown_tool"}
    try:
        args = SearchInput.model_validate(call.get("arguments"), strict=True)
        if not args.query.strip():
            raise ValueError("空查询")
    except (ValidationError, ValueError):
        return {"ok": False, "error": "invalid_input"}
    return {"ok": True, "data": search_notes(args.query)}


if __name__ == "__main__":
    for call in [
        {"name": "search_notes", "arguments": {"query": "Python"}},
        {"name": "delete_file", "arguments": {}},
        {"name": "search_notes", "arguments": {"query": 7}},
    ]:
        print(dispatch(call))
