from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_admin
from app.database import get_db
from app.models import ChatHistory, User
from app.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Import here (not at module load) so the embedding model / vector store
    # only spin up on first real chat request, keeping API startup fast.
    from ai.agents.graph import handle_message

    db.add(ChatHistory(user_id=user.id, session_id=payload.session_id, role="user", message=payload.message))
    db.commit()

    result = handle_message(db, user, payload.message)

    db.add(
        ChatHistory(
            user_id=user.id,
            session_id=payload.session_id,
            role="assistant",
            message=result["reply"],
            agent_used=result["agent_used"],
        )
    )
    db.commit()

    return ChatResponse(
        session_id=payload.session_id,
        reply=result["reply"],
        agent_used=result["agent_used"],
        sources=result["sources"],
    )


@router.get("/history/{session_id}", response_model=List[dict])
def get_history(session_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (
        db.query(ChatHistory)
        .filter(ChatHistory.session_id == session_id, ChatHistory.user_id == user.id)
        .order_by(ChatHistory.created_at)
        .all()
    )
    return [
        {"role": r.role, "message": r.message, "agent_used": r.agent_used, "created_at": r.created_at.isoformat()}
        for r in rows
    ]


@router.get("/analytics")
def chat_analytics(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    """Lightweight aggregate for the Admin > AI Analytics page."""
    from sqlalchemy import func

    rows = (
        db.query(ChatHistory.agent_used, func.count(ChatHistory.id))
        .filter(ChatHistory.role == "assistant")
        .group_by(ChatHistory.agent_used)
        .all()
    )
    total_messages = db.query(func.count(ChatHistory.id)).filter(ChatHistory.role == "user").scalar() or 0
    total_sessions = db.query(func.count(func.distinct(ChatHistory.session_id))).scalar() or 0
    return {
        "total_user_messages": total_messages,
        "total_sessions": total_sessions,
        "agent_usage": {agent or "unknown": count for agent, count in rows},
    }
