import subprocess, sys, shutil

subprocess.run([sys.executable, "-m", "unittest", "-v"], check=True)
subprocess.run([sys.executable, "-m", "compileall", "-q", "main.py"], check=True)
npm = shutil.which("npm")
if not npm:
    raise SystemExit("请安装 Node.js 和 npm")
subprocess.run([npm, "ci"], check=True)
subprocess.run([npm, "run", "build"], check=True)
print("代码检查通过；仍需浏览器验证主要用户流程")
