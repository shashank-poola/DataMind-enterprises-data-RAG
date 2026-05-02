import json
import time

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from rag_agent.chain.rag_chain import RAGChain
from rag_agent.chain.streaming import stream_rag_response
from rag_agent.db.database import get_db
from rag_agent.db.repository import QueryLogRepository
from rag_agent.schemas.query import QueryRequest, QueryResponse

router = APIRouter(prefix="/query", tags=["query"])


@router.post("", response_model=QueryResponse)
def query(request: QueryRequest, db: Session = Depends(get_db)):
    """Synchronous RAG query — returns the full answer once ready."""
    try:
        result = RAGChain(db, k=request.k).query(request.question)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    source_ids = json.dumps([s.document_id for s in result.sources if s.document_id])
    QueryLogRepository(db).create(
        query=request.question,
        response=result.answer,
        source_documents=source_ids,
        latency_ms=result.latency_ms,
    )
    return result


@router.post("/stream")
async def query_stream(
    request: QueryRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Streaming RAG query using Server-Sent Events (SSE).

    Frontend connects with:
        const source = new EventSource('/api/v1/query/stream', { method: 'POST', ... })

    Or via fetch + ReadableStream. Each event is:
        data: {"event": "thinking"|"sources"|"token"|"done"|"error", ...}
    """
    answer_buffer: list[str] = []
    sources_buffer: list[dict] = []
    start_time = time.monotonic()

    async def event_stream():
        async for sse_chunk in stream_rag_response(
            question=request.question,
            db=db,
            k=request.k,
            answer_buffer=answer_buffer,
            sources_buffer=sources_buffer,
        ):
            yield sse_chunk

    def log_to_db() -> None:
        full_answer = "".join(answer_buffer)
        if not full_answer:
            return
        latency_ms = int((time.monotonic() - start_time) * 1000)
        source_ids = json.dumps([s.get("document_id") for s in sources_buffer if s.get("document_id")])
        QueryLogRepository(db).create(
            query=request.question,
            response=full_answer,
            source_documents=source_ids,
            latency_ms=latency_ms,
        )

    background_tasks.add_task(log_to_db)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disables Nginx buffering for SSE
        },
    )


@router.get("/history")
def query_history(limit: int = 50, db: Session = Depends(get_db)):
    return QueryLogRepository(db).list_recent(limit)
