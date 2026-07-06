import csv
import io
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

import models
import schemas
from database import engine, get_db
from llm_extractor import extract_tasks

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mini AI Project Manager Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Mini AI Project Manager Assistant API is running 🚀"
    }


@app.get("/health")
def health():
    return {"status": "ok"}


# -------------------------------------------------------
# AI Extraction
# -------------------------------------------------------

@app.post("/extract", response_model=list[schemas.TaskOut])
def extract(payload: schemas.ExtractRequest, db: Session = Depends(get_db)):

    if not payload.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Meeting notes cannot be empty."
        )

    try:
        extracted = extract_tasks(payload.text)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"LLM extraction failed: {e}"
        )

    # Remove old extracted tasks (optional)
    db.query(models.Task).delete()
    db.commit()

    created = []

    for item in extracted:

        priority = item.get("priority", "Medium")

        if priority not in ["Low", "Medium", "High"]:
            priority = "Medium"

        task = models.Task(
            description=item.get("description", "Untitled Task"),
            owner=item.get("owner"),
            due_date=item.get("due_date"),
            priority=priority,
            status=models.StatusEnum.todo,
            source_note=item.get("source_note"),
        )

        db.add(task)
        created.append(task)

    db.commit()

    for task in created:
        db.refresh(task)

    return created


# -------------------------------------------------------
# List Tasks
# -------------------------------------------------------

@app.get("/tasks", response_model=list[schemas.TaskOut])
def list_tasks(
    owner: Optional[str] = None,
    status: Optional[models.StatusEnum] = None,
    priority: Optional[models.PriorityEnum] = None,
    db: Session = Depends(get_db),
):

    query = db.query(models.Task)

    if owner:
        query = query.filter(models.Task.owner == owner)

    if status:
        query = query.filter(models.Task.status == status)

    if priority:
        query = query.filter(models.Task.priority == priority)

    return query.order_by(models.Task.id.desc()).all()


# -------------------------------------------------------
# Get Single Task
# -------------------------------------------------------

@app.get("/tasks/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):

    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(404, "Task not found")

    return task


# -------------------------------------------------------
# Create Task
# -------------------------------------------------------

@app.post("/tasks", response_model=schemas.TaskOut)
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)):

    task = models.Task(**payload.model_dump())

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


# -------------------------------------------------------
# Update Task
# -------------------------------------------------------

@app.put("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    payload: schemas.TaskUpdate,
    db: Session = Depends(get_db),
):

    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(404, "Task not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    return task


# -------------------------------------------------------
# Delete Task
# -------------------------------------------------------

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):

    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(404, "Task not found")

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }


# -------------------------------------------------------
# Export CSV
# -------------------------------------------------------

@app.get("/tasks/export/csv")
def export_csv(db: Session = Depends(get_db)):

    tasks = db.query(models.Task).order_by(models.Task.id.desc()).all()

    buffer = io.StringIO()

    writer = csv.writer(buffer)

    writer.writerow([
        "ID",
        "Description",
        "Owner",
        "Due Date",
        "Priority",
        "Status",
        "Source Note",
    ])

    for t in tasks:

        writer.writerow([
            t.id,
            t.description,
            t.owner or "",
            t.due_date or "",
            t.priority.value,
            t.status.value,
            t.source_note or "",
        ])

    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=tasks.csv"
        },
    )