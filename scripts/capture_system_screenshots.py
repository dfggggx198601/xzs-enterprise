from pathlib import Path
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/images/ppt"
OUT.mkdir(parents=True, exist_ok=True)

BASE = "https://exam.440700.xyz"


def save(page, name):
    page.wait_for_timeout(1200)
    page.screenshot(path=str(OUT / name), full_page=True)
    print("saved", name)


def login(page, user, password, role="student"):
    if role == "admin":
        page.goto(f"{BASE}/admin/index.html", wait_until="networkidle")
    else:
        page.goto(f"{BASE}/student/index.html", wait_until="networkidle")

    page.fill('input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]', user)
    page.fill('input[type="password"]', password)
    page.click('button:has-text("登录"), button:has-text("登 录"), .el-button--primary')
    page.wait_for_timeout(2500)


def capture_student(context):
    page = context.new_page()
    login(page, "aa", "123456", role="student")

    save(page, "student_home.png")

    candidates = [
        ("错题本", "student_wrongbook.png"),
        ("考试记录", "student_record.png"),
        ("固定试卷", "student_fixed_exam.png"),
    ]
    for text, file_name in candidates:
        try:
            page.click(f'text={text}', timeout=2500)
            page.wait_for_timeout(1500)
            save(page, file_name)
        except Exception:
            pass

    page.close()


def capture_admin(context):
    page = context.new_page()
    login(page, "admin", "123456", role="admin")

    save(page, "admin_dashboard.png")

    paths = [
        ("/answer/analysis", "admin_answer_analysis.png"),
        ("/exam/question/bank", "admin_question_bank.png"),
        ("/exam/question/list", "admin_question_list.png"),
        ("/exam/paper/list", "admin_exam_paper_list.png"),
    ]

    for path, file_name in paths:
        try:
            page.goto(f"{BASE}/admin/index.html#{path}", wait_until="networkidle")
            save(page, file_name)
        except Exception:
            pass

    page.close()


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1600, "height": 900})
        capture_admin(context)
        capture_student(context)
        browser.close()
    print("screenshots done ->", OUT)


if __name__ == "__main__":
    main()
