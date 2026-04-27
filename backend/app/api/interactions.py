from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.interaction import Interaction
from app.agent.prompts import EXTRACTION_PROMPT
from app.agent.tools import search_hcp, edit_interaction, schedule_followup, recommend_next_action, log_interaction
from datetime import date
from dotenv import load_dotenv
import json
import os
from groq import Groq

load_dotenv()
router = APIRouter()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ChatRequest(BaseModel):
    message: str

class AgentRequest(BaseModel):
    message: str

class InteractionCreate(BaseModel):
    hcp_name: str
    interaction_date: str
    interaction_type: str
    products_discussed: str
    sentiment: str
    outcomes: str
    follow_up_actions: str

def clean_json(raw: str) -> str:
    if "```" in raw:
        parts = raw.split("```")
        raw = parts[1] if len(parts) > 1 else parts[0]
        if raw.startswith("json"):
            raw = raw[4:]
    return raw.strip()

@router.post("/chat")
async def chat_with_agent(req: ChatRequest):
    try:
        prompt = EXTRACTION_PROMPT.format(
            today=str(date.today()),
            user_message=req.message
        )
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        raw = clean_json(response.choices[0].message.content.strip())
        data = json.loads(raw)
        return {"status": "success", "extracted": data}
    except json.JSONDecodeError:
        return {"status": "success", "extracted": {"raw_response": raw}}
    except Exception as e:
        print(f"CHAT ERROR: {str(e)}")
        return {"status": "error", "message": str(e)}

@router.post("/agent")
async def agent_chat(req: AgentRequest):
    try:
        intent_prompt = f"""
Analyze this message and return ONLY JSON:
{{
  "intent": "search_hcp" or "edit_interaction" or "schedule_followup" or "recommend" or "other",
  "hcp_name": "doctor name or null",
  "interaction_id": number or null,
  "field": "field name or null",
  "new_value": "new value or null",
  "date": "YYYY-MM-DD or null",
  "notes": "notes or null"
}}
Message: {req.message}
Return ONLY JSON.
"""
        r = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": intent_prompt}],
            temperature=0
        )
        raw = clean_json(r.choices[0].message.content.strip())
        intent_data = json.loads(raw)
        intent = intent_data.get("intent")
        hcp_name = intent_data.get("hcp_name") or ""

        if intent == "search_hcp":
            result = search_hcp(hcp_name)
            return {"status": "success", "intent": "search_hcp", "response": result}
        elif intent == "edit_interaction":
            result = edit_interaction(
                intent_data.get("interaction_id") or 1,
                intent_data.get("field") or "",
                intent_data.get("new_value") or ""
            )
            return {"status": "success", "intent": "edit_interaction", "response": result}
        elif intent == "schedule_followup":
            result = schedule_followup(
                hcp_name,
                intent_data.get("date") or "",
                intent_data.get("notes") or ""
            )
            return {"status": "success", "intent": "schedule_followup", "response": result}
        elif intent == "recommend":
            result = recommend_next_action(hcp_name)
            return {"status": "success", "intent": "recommend", "response": result}
        else:
            return {"status": "success", "intent": "other", "response": "Please use /api/chat for logging."}
    except Exception as e:
        print(f"AGENT ERROR: {str(e)}")
        return {"status": "error", "message": str(e)}

@router.post("/interactions")
def create_interaction(data: InteractionCreate, db: Session = Depends(get_db)):
    record = Interaction(
        hcp_name=data.hcp_name,
        interaction_date=data.interaction_date,
        interaction_type=data.interaction_type,
        products_discussed=data.products_discussed,
        sentiment=data.sentiment,
        outcomes=data.outcomes,
        follow_up_actions=data.follow_up_actions,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"status": "success", "id": record.id}

@router.get("/interactions")
def get_interactions(db: Session = Depends(get_db)):
    records = db.query(Interaction).order_by(Interaction.id.desc()).limit(20).all()
    return [
        {
            "id": r.id,
            "hcp_name": r.hcp_name,
            "interaction_date": r.interaction_date,
            "interaction_type": r.interaction_type,
            "products_discussed": r.products_discussed,
            "sentiment": r.sentiment,
            "outcomes": r.outcomes,
            "follow_up_actions": r.follow_up_actions,
        }
        for r in records
    ]
