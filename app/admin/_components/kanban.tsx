"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { updateInquiryStatus } from "../actions";
import {
  PIPELINE_STAGES,
  type InquiryRow,
  type StageId,
  formatRelative,
  TIER_LABEL,
} from "@/lib/concierge";

export function KanbanBoard({
  inquiries: initialInquiries,
  onCardClick,
}: {
  inquiries: InquiryRow[];
  onCardClick: (id: string) => void;
}) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState(initialInquiries);

  // Re-sync when parent prop changes (e.g., after a refresh)
  if (initialInquiries !== inquiries && initialInquiries.length !== inquiries.length) {
    setInquiries(initialInquiries);
  }

  const grouped = PIPELINE_STAGES.reduce<Record<string, InquiryRow[]>>(
    (acc, s) => {
      acc[s.id] = inquiries.filter((i) => i.status === s.id);
      return acc;
    },
    {},
  );

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    const newStage = destination.droppableId as StageId;

    // Optimistic update
    setInquiries((prev) =>
      prev.map((i) =>
        i.id === draggableId ? { ...i, status: newStage } : i,
      ),
    );

    const res = await updateInquiryStatus(draggableId, newStage);
    if (!res.ok) {
      // Roll back on error
      setInquiries(initialInquiries);
    } else {
      router.refresh();
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {PIPELINE_STAGES.map((stage) => (
          <Droppable droppableId={stage.id} key={stage.id}>
            {(provided, snapshot) => (
              <div className={`kanban-column col-${stage.id}`}>
                <div className="col-head">
                  <span className="label">{stage.label}</span>
                  <span className="count">
                    {grouped[stage.id]?.length ?? 0}
                  </span>
                </div>
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`col-body${
                    snapshot.isDraggingOver ? " dragging-over" : ""
                  }`}
                >
                  {(grouped[stage.id] ?? []).map((inquiry, idx) => (
                    <Draggable
                      key={inquiry.id}
                      draggableId={inquiry.id}
                      index={idx}
                    >
                      {(p, snap) => (
                        <div
                          ref={p.innerRef}
                          {...p.draggableProps}
                          {...p.dragHandleProps}
                          className={`kanban-card${
                            snap.isDragging ? " dragging" : ""
                          }`}
                          onClick={() => onCardClick(inquiry.id)}
                        >
                          <div className="ref">{inquiry.ref_code ?? "—"}</div>
                          <div className="name">
                            {inquiry.person_name ?? "Unknown"}
                          </div>
                          <div className="meta">
                            {inquiry.tier && TIER_LABEL[inquiry.tier]
                              ? TIER_LABEL[inquiry.tier]
                              : "—"}
                            {inquiry.group_size
                              ? ` · ${inquiry.group_size} ${
                                  inquiry.group_size === 1 ? "guest" : "guests"
                                }`
                              : ""}
                          </div>
                          {inquiry.travel_window ? (
                            <div className="meta">
                              {inquiry.travel_window}
                            </div>
                          ) : null}
                          <div className="when">
                            {formatRelative(inquiry.created_at)}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
