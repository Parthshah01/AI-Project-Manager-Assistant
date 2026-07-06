from typing import Optional
import datetime

from pydantic import BaseModel, ConfigDict

from models import PriorityEnum, StatusEnum


class ExtractRequest(BaseModel):
    text: str


class TaskBase(BaseModel):
    description: str
    owner: Optional[str] = None
    due_date: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.medium
    status: StatusEnum = StatusEnum.todo
    source_note: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    description: Optional[str] = None
    owner: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    status: Optional[StatusEnum] = None


class TaskOut(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
