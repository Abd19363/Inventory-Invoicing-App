from fastapi import FastAPI

from app.database import Base, engine
from app import models
from app.routers import auth, suppliers, products


app = FastAPI(
    title="Inventory Store API"
)


Base.metadata.create_all(
    bind=engine
)


app.include_router(
    auth.router
)

app.include_router(suppliers.router)
app.include_router(products.router)


@app.get("/")
def root():

    return {
        "message": "Inventory Store API is running"
    }