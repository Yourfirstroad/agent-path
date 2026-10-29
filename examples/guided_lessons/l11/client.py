import httpx

for path in ("/health", "/missing"):
    try:
        response = httpx.get("http://127.0.0.1:8011" + path, timeout=3, trust_env=False)
        print(
            path,
            response.status_code,
            response.headers["content-type"],
            response.json(),
        )
    except httpx.RequestError:
        print(path, "连接失败：请先启动 server.py")
