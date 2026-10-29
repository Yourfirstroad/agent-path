import asyncio


async def slow_read(delay):
    await asyncio.sleep(delay)
    return {"ok": True}


async def fetch_with_retry(delay, attempts=3):
    for attempt in range(1, attempts + 1):
        try:
            result = await asyncio.wait_for(slow_read(delay), timeout=0.05)
            print("成功：", result)
            return result
        except TimeoutError:
            print(f"第 {attempt} 次超时")
            if attempt < attempts:
                await asyncio.sleep(0.01 * attempt)
    print("已停止，请稍后重试")
    return None


async def main():
    await fetch_with_retry(0.001)
    await fetch_with_retry(0.2)


if __name__ == "__main__":
    asyncio.run(main())
