from fastapi import FastAPI

from src.features.auth.endpoint import router as auth_router

app = FastAPI()


app.include_router(auth_router)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    print("hello python!!")
