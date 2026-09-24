from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return "This is the backend"