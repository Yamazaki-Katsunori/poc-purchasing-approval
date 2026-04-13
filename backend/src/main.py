import wireup.integration.fastapi
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.features.auth.endpoint import router as auth_router
from src.features.purchasing_approvals.confirm.endpoint import router as confirm_approval_router
from src.features.purchasing_approvals.detail.endpoint import router as detail_approval_router
from src.features.purchasing_approvals.list.endpoint import router as list_approval_router
from src.features.purchasing_approvals.new.endpoint import router as new_approval_router
from src.shared.container import container

app = FastAPI()

FRONTEND_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

# NOTE: middleware設定箇所
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# NOTE: FastAPIに各種routerを追加挿入している箇所
app.include_router(auth_router)
app.include_router(new_approval_router)
app.include_router(confirm_approval_router)
app.include_router(list_approval_router)
app.include_router(detail_approval_router)

# NOTE: WireUp DIコンテナをFastAPIで利用可能とする処理
wireup.integration.fastapi.setup(container, app)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    print("hello python!!")
