from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()  # <-- This loads variables from .env

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "livercirrhosis")

client = AsyncIOMotorClient(MONGODB_URL)
db = client[MONGODB_DB]
