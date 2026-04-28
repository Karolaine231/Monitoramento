from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv
import os

load_dotenv()

engine = create_engine(os.getenv("postgresql://monitoramento_dumw_user:NMIIDAwbUTDSP9Z4HEcC1qUhdKpPQgfG@dpg-d7f4mmhj2pic73938udg-a.oregon-postgres.render.com/monitoramento_dumw"), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
