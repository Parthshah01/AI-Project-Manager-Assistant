import datetime
import enum

from sqlalchemy import Column, Integer, String, DateTime, Enum
from database import Base


class PriorityEnum(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class StatusEnum(str, enum.Enum):
    todo = "To Do"
    in_progress = "In Progress"
    done = "Done"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    owner = Column(String, nullable=True)
    due_date = Column(String, nullable=True)  # stored as free-text/ISO string (LLM output isn't always a clean date)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.medium, nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.todo, nullable=False)
    source_note = Column(String, nullable=True)  # original snippet this task was extracted from
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
