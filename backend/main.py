import wireup.integration.fastapi
from fastapi import FastAPI

from src.features.auth.endpoint import router as auth_router
from src.shared.container import container

app = FastAPI()

app.include_router(auth_router)

wireup.integration.fastapi.setup(container, app)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    print("hello python!!")
