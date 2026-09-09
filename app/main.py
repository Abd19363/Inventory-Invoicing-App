import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models
from app.routers import auth, suppliers, products, invoices


def cors_origins():
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://inventory-invoicing-app.vercel.app",
    ]
    extra = os.getenv("CORS_ORIGINS", "") + "," + os.getenv("FRONTEND_URL", "")
    for part in extra.split(","):
        origin = part.strip().rstrip("/")
        if origin:
            origins.append(origin)
    return list(dict.fromkeys(origins))


app = FastAPI(
    title="Inventory Store API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# DATABASE
# ==========================================

Base.metadata.create_all(
    bind=engine
)


# ==========================================
# ROUTERS
# ==========================================

app.include_router(auth.router)
app.include_router(suppliers.router)
app.include_router(products.router)
app.include_router(invoices.router)


@app.get("/")
def root():

    return {
        "message": "Inventory Store API is running"
    }