import json, time, uuid


def run(budget=2):
    run_id = str(uuid.uuid4())
    spent = 0
    for index in range(3):
        if spent + 1 > budget:
            print(
                json.dumps(
                    {
                        "run_id": run_id,
                        "status": "budget_exhausted",
                        "spent_units": spent,
                    }
                )
            )
            break
        started = time.perf_counter()
        time.sleep(0.03 if index == 1 else 0.001)
        spent += 1
        print(
            json.dumps(
                {
                    "run_id": run_id,
                    "tool": "local_read",
                    "step": index + 1,
                    "elapsed_ms": round((time.perf_counter() - started) * 1000, 2),
                    "spent_units": spent,
                    "currency_cost": None,
                }
            )
        )


if __name__ == "__main__":
    run()
