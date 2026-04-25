from langchain.tools import tool
from sqlalchemy.orm import Session
from app.models.interaction import Interaction
from app.database import SessionLocal
from datetime import datetime

def get_db_session():
    return SessionLocal()

@tool
def log_interaction(
    hcp_name: str,
    interaction_date: str,
    interaction_type: str,
    products_discussed: str,
    sentiment: str,
    outcomes: str,
    follow_up_actions: str,
    raw_chat_input: str
) -> str:
    """Saves a new HCP interaction to the database."""
    db = get_db_session()
    try:
        record = Interaction(
            hcp_name=hcp_name,
            interaction_date=interaction_date,
            interaction_type=interaction_type,
            products_discussed=products_discussed,
            sentiment=sentiment,
            outcomes=outcomes,
            follow_up_actions=follow_up_actions,
            raw_chat_input=raw_chat_input,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return f"Success! Interaction with {hcp_name} saved. ID: {record.id}"
    except Exception as e:
        db.rollback()
        return f"Error: {str(e)}"
    finally:
        db.close()

@tool
def edit_interaction(interaction_id: int, field: str, new_value: str) -> str:
    """Updates a specific field of an existing HCP interaction."""
    db = get_db_session()
    try:
        record = db.query(Interaction).filter(
            Interaction.id == interaction_id
        ).first()
        if not record:
            return "Error: Interaction not found"
        setattr(record, field, new_value)
        db.commit()
        return f"Success! Field '{field}' updated for interaction {interaction_id}"
    except Exception as e:
        db.rollback()
        return f"Error: {str(e)}"
    finally:
        db.close()

@tool
def search_hcp(hcp_name: str) -> str:
    """Search past interactions for a doctor by name."""
    db = get_db_session()
    try:
        records = db.query(Interaction).filter(
            Interaction.hcp_name.ilike(f"%{hcp_name}%")
        ).order_by(Interaction.id.desc()).limit(5).all()
        if not records:
            return f"No interactions found for {hcp_name}"
        result = ""
        for r in records:
            result += f"ID:{r.id} | Date:{r.interaction_date} | Products:{r.products_discussed} | Sentiment:{r.sentiment}\n"
        return result
    finally:
        db.close()

@tool
def schedule_followup(hcp_name: str, follow_up_date: str, notes: str) -> str:
    """Schedule a follow-up visit with a doctor."""
    return f"Follow-up with {hcp_name} scheduled for {follow_up_date}. Notes: {notes}"

@tool
def recommend_next_action(hcp_name: str) -> str:
    """Recommend next best action based on interaction history."""
    db = get_db_session()
    try:
        records = db.query(Interaction).filter(
            Interaction.hcp_name.ilike(f"%{hcp_name}%")
        ).order_by(Interaction.id.desc()).all()
        if not records:
            return "No history found. Recommend: Initial introduction meeting."
        last = records[0]
        return f"Last visit: {last.interaction_date}. Sentiment: {last.sentiment}. Suggested next step: {last.follow_up_actions or 'Schedule follow-up visit'}"
    finally:
        db.close()