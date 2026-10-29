def completion(done: int, total: int) -> float:
    if total < 0 or done < 0 or done > total:
        raise ValueError("数量不合法")
    return done / total if total else 0.0
