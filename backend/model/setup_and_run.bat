@echo off
cd /d "%~dp0"
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
if not exist .env copy .env.example .env
echo.
echo Edit .env and add your OPENAI_API_KEY, then run:  python data_analyst_ai.py
echo (No key yet? Try:  python data_analyst_ai.py --offline)
python data_analyst_ai.py --offline
pause
