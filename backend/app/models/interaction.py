from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id                  = Column(Integer, primary_key=True, index=True)
    rep_id              = Column(Integer, nullable=True)
    hcp_name            = Column(String(255), nullable=False)
    interaction_date    = Column(String(20), nullable=False)
    interaction_type    = Column(String(50), default="meeting")
    products_discussed  = Column(Text, nullable=True)
    sentiment           = Column(String(20), default="neutral")
    outcomes            = Column(Text, nullable=True)
    follow_up_actions   = Column(Text, nullable=True)
    samples_distributed = Column(Text, nullable=True)
    raw_chat_input      = Column(Text, nullable=True)
    created_at          = Column(DateTime, server_default=func.now())
    updated_at          = Column(DateTime, onupdate=func.now())