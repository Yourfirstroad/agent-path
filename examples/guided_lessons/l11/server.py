from http.server import BaseHTTPRequestHandler, HTTPServer
import json


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        ok = self.path == "/health"
        body = json.dumps({"ok": True} if ok else {"error": "not_found"}).encode()
        self.send_response(200 if ok else 404)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    print("打开 http://127.0.0.1:8011/health；Ctrl+C 停止", flush=True)
    HTTPServer(("127.0.0.1", 8011), Handler).serve_forever()
