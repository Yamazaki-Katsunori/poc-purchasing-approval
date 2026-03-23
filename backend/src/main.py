import wireup.integration.fastapi
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.features.auth.endpoint import router as auth_router
from src.features.purchasing_approvals.new.endpoint import router as approval_router
from src.shared.container import container

app = FastAPI()

FRONTEND_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(auth_router)
app.include_router(approval_router)

wireup.integration.fastapi.setup(container, app)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    print("hello python!!")
