"""
Turns raw meeting notes into structured tasks using a local Ollama model.
"""

import json
import requests

# -----------------------------
# Ollama Configuration
# -----------------------------
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2.5:7b"

SYSTEM_PROMPT = """
You are an AI Project Manager Assistant.

Your ONLY job is to extract EVERY actionable task from meeting notes.

Return ONLY valid JSON.

Output format:

{
  "tasks": [
    {
      "description": "",
      "owner": null,
      "due_date": null,
      "priority": "Medium",
      "source_note": ""
    }
  ]
}

Rules:

1. Extract EVERY actionable task.
2. Never skip any task.
3. One sentence may contain one task.
4. Never merge tasks.
5. Ignore discussions and information.
6. If owner is missing, return null.
7. If due date is missing, return null.

Due Date Rules:

- Keep the due date EXACTLY as written.
- DO NOT convert it into a calendar date.

Examples:

Friday -> Friday
Monday -> Monday
Today -> Today
Tomorrow -> Tomorrow
Next Week -> Next Week

Priority Rules:

High:
- urgent
- asap
- immediately
- critical

Medium:
- today
- tomorrow
- this week
- friday
- monday
- tuesday
- wednesday
- thursday

Low:
- everything else

Example:

Meeting Notes:

John will finish the login page by Friday.
Sarah should prepare API documentation before Monday.
Mike must fix the payment bug today.
Emily will review the contracts.

Expected Output:

{
  "tasks": [
    {
      "description": "Finish login page",
      "owner": "John",
      "due_date": "Friday",
      "priority": "Medium",
      "source_note": "John will finish the login page by Friday."
    },
    {
      "description": "Prepare API documentation",
      "owner": "Sarah",
      "due_date": "Monday",
      "priority": "Medium",
      "source_note": "Sarah should prepare API documentation before Monday."
    },
    {
      "description": "Fix payment bug",
      "owner": "Mike",
      "due_date": "Today",
      "priority": "Medium",
      "source_note": "Mike must fix the payment bug today."
    },
    {
      "description": "Review contracts",
      "owner": "Emily",
      "due_date": null,
      "priority": "Low",
      "source_note": "Emily will review the contracts."
    }
  ]
}

Return ONLY JSON.
"""


def extract_tasks(text: str) -> list[dict]:
    """
    Extract structured tasks from meeting notes using Ollama.
    """

    prompt = f"""
{SYSTEM_PROMPT}

Meeting Notes:

{text}
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0,
                "top_p": 0.9,
                "num_predict": 1024
            }
        },
        timeout=120,
    )

    response.raise_for_status()

    result = response.json()

    raw = result.get("response", "").strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Ollama returned invalid JSON.\n\n{raw}"
        ) from e

    tasks = parsed.get("tasks", [])

    if not isinstance(tasks, list):
        raise ValueError("Expected 'tasks' to be a list.")

    return tasks