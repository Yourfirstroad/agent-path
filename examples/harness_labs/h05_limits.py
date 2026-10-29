"""第五课：执行次数、截止时间和取消。截止时间在调用间检查，不强杀正在运行的工具。"""

from dataclasses import dataclass, field
from time import monotonic


@dataclass
class Budget:
    max_calls: int = 3
    seconds: float = 5
    cancelled: bool = False
    calls: int = 0
    started: float = field(default_factory=monotonic)

    def reserve(self):
        if self.cancelled:
            raise RuntimeError("cancelled")
        if monotonic() - self.started >= self.seconds:
            raise TimeoutError("deadline")
        if self.calls >= self.max_calls:
            raise RuntimeError("call_limit")
        self.calls += 1  # 失败调用也计数，不能靠重试绕过预算。


def retry_read(operation, budget, attempts=2):
    if attempts < 1:
        raise ValueError("attempts 至少为 1")
    for attempt in range(attempts):
        budget.reserve()
        try:
            return operation()
        except TimeoutError:
            if attempt + 1 == attempts:
                raise
    # 只重试本课无副作用的读取；支付、邮件等不能直接照搬。


if __name__ == "__main__":
    calls = []

    def flaky():
        calls.append(1)
        if len(calls) == 1:
            raise TimeoutError("教学模拟：第一次读取超时")
        return "第二次读取成功"

    budget = Budget(max_calls=2)
    print(retry_read(flaky, budget), "calls=", budget.calls)
    for item in [budget, Budget(seconds=0), Budget(cancelled=True)]:
        try:
            item.reserve()
        except (RuntimeError, TimeoutError) as error:
            print("停止：", error)
