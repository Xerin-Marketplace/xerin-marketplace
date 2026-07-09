import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.database import Base, engine
from api.config import settings
from api.routers import auth, users, sellers, products, admin

api = FastAPI(title="Ecommerce Platform API", version="1.0.0")

cors_origins = [
    origin.strip()
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
]

api.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api.include_router(auth.router)
api.include_router(users.router)
api.include_router(sellers.router)
api.include_router(products.router)
api.include_router(admin.router)


@api.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@api.get("/")
def root():
    return {"message": "Ecommerce backend is running"}