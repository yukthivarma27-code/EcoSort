import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

# Database path in project root
DB_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(DB_DIR, "ecosort.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    predicted_category = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    image_analysis = Column(String, nullable=True)
    guidance = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "predicted_category": self.predicted_category,
            "confidence": round(float(self.confidence), 2) if self.confidence is not None else 0.0,
            "image_analysis": self.image_analysis,
            "guidance": self.guidance,
            "created_at": self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat()
        }


def init_db():
    """Automatically creates the SQLite database and scan_history table if they do not exist."""
    Base.metadata.create_all(bind=engine)
    # Ensure image_analysis column exists in SQLite
    try:
        with engine.connect() as conn:
            from sqlalchemy import text
            conn.execute(text("ALTER TABLE scan_history ADD COLUMN image_analysis VARCHAR"))
            conn.commit()
    except Exception:
        # Column already exists or table newly created
        pass


def get_db():
    """FastAPI database session dependency with safe closing."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
