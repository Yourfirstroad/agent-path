def completion(done: int, total: int) -> float:
    if total < 0 or done < 0 or done > total:
        raise ValueError("数量不合法")
    return done / total if total else 0.0


if __name__ == "__main__":
    for done, total in [(2, 5), (0, 0), (3, 3)]:
        print(f"{done}/{total} → {completion(done, total):.0%}")
    try:
        completion(3, 2)
    except ValueError as error:
        print(error)
