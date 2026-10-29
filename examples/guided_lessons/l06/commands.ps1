git init
git config user.name "学习者"
git config user.email "learner@example.invalid"
Set-Content -Encoding utf8 .gitignore ".env`n.venv/`n*.db`n*.sqlite3"
git add hello.py .gitignore
git commit -m "增加第一版问候"
Set-Content -Encoding utf8 hello.py 'print("版本二")'
git diff
git add hello.py
git commit -m "修改问候内容"
git log --oneline -2
