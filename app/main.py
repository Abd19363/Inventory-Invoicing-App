from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models
from app.routers import auth, suppliers, products, invoices


app = FastAPI(
    title="Inventory Store API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
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