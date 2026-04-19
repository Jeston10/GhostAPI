"use client";

import { motion, type PanInfo } from "framer-motion";
import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  ArrowRight,
  Braces,
  FileUp,
  Link2,
  Radio,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface WorkflowNode {
  id: string;
  step: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  position: { x: number; y: number };
}

interface WorkflowConnection {
  from: string;
  to: string;
}

interface WorkflowStepDef {
  id: string;
  step: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

/** Card width on desktop canvas (narrower = less horizontal sprawl on laptop). */
const NODE_WIDTH = 220;

/**
 * Used for zig-zag row gap, SVG connector midpoint, canvas bounds, and drag expansion
 * (approx. half of typical rendered card — lines stay visually centered).
 */
const EST_CARD_HEIGHT = 232;

/** Same PrebuiltUI grid as hero (no extra tint layers — warmth comes from the asset). */
const FLOW_GRID_BG =
  "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/gridBackground.png";

const GAP_X = 28;
const BASE_X = 20;
/** Odd steps (1,3,5) upper row; even steps (2,4) lower row — zig-zag, no vertical overlap. */
const Y_HIGH = 16;
const Y_LOW = Y_HIGH + EST_CARD_HEIGHT + 8;

function zigZagX(index: number) {
  return BASE_X + index * (NODE_WIDTH + GAP_X);
}

function zigZagY(index: number) {
  return index % 2 === 0 ? Y_HIGH : Y_LOW;
}

const WORKFLOW_STEPS: WorkflowStepDef[] = [
  {
    id: "node-1",
    step: "Step 1",
    title: "Define your schema",
    description:
      "Describe response fields and types in JSON—strings, numbers, booleans, nested objects.",
    icon: Braces,
  },
  {
    id: "node-2",
    step: "Step 2",
    title: "Submit your format",
    description:
      "Send the structure to API Ghost so it knows what each mock response should look like.",
    icon: FileUp,
  },
  {
    id: "node-3",
    step: "Step 3",
    title: "Receive a unique URL",
    description:
      "Get a dedicated GET endpoint you can drop into apps, tests, or prototypes.",
    icon: Link2,
  },
  {
    id: "node-4",
    step: "Step 4",
    title: "Call it like a real API",
    description:
      "Your frontend issues normal GET requests—no special client or SDK required.",
    icon: Radio,
  },
  {
    id: "node-5",
    step: "Step 5",
    title: "Fresh data every time",
    description:
      "Each response is generated on the fly with realistic values (e.g. Faker-style rules).",
    icon: Sparkles,
  },
];

function buildInitialNodes(): WorkflowNode[] {
  return WORKFLOW_STEPS.map((s, index) => ({
    ...s,
    position: { x: zigZagX(index), y: zigZagY(index) },
  }));
}

const initialNodes: WorkflowNode[] = buildInitialNodes();

const initialConnections: WorkflowConnection[] = WORKFLOW_STEPS.slice(0, -1).map((_, i) => ({
  from: WORKFLOW_STEPS[i].id,
  to: WORKFLOW_STEPS[i + 1].id,
}));

const nodeCardClass =
  "border-slate-300/90 bg-white text-[#050040] shadow-sm";

const iconWrapClass =
  "border-slate-200 bg-slate-50 text-[#050040] shadow-none";

function WorkflowConnectionLine({
  from,
  to,
  nodes,
}: {
  from: string;
  to: string;
  nodes: WorkflowNode[];
}) {
  const fromNode = nodes.find((n) => n.id === from);
  const toNode = nodes.find((n) => n.id === to);
  if (!fromNode || !toNode) return null;

  const startX = fromNode.position.x + NODE_WIDTH;
  const startY = fromNode.position.y + EST_CARD_HEIGHT / 2;
  const endX = toNode.position.x;
  const endY = toNode.position.y + EST_CARD_HEIGHT / 2;

  const midX = (startX + endX) / 2;
  const path = `M${startX},${startY} C${midX},${startY} ${midX},${endY} ${endX},${endY}`;

  return (
    <path
      d={path}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeDasharray="10,7"
      strokeLinecap="round"
      className="text-slate-400"
      opacity={0.6}
    />
  );
}

export function GhostApiWorkflowBlock() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [connections] = useState<WorkflowConnection[]>(initialConnections);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [contentSize, setContentSize] = useState(() => {
    const maxX = Math.max(
      ...initialNodes.map((n) => n.position.x + NODE_WIDTH)
    );
    const maxY = Math.max(
      ...initialNodes.map((n) => n.position.y + EST_CARD_HEIGHT)
    );
    return { width: maxX + 36, height: maxY + 12 };
  });

  useLayoutEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    function measure() {
      const el = viewportRef.current;
      if (!el) return;
      const pad = 6;
      const cw = el.clientWidth - pad * 2;
      const ch = el.clientHeight - pad * 2;
      if (cw <= 0 || ch <= 0) return;
      const sx = cw / contentSize.width;
      const sy = ch / contentSize.height;
      setScale(Math.min(1, sx, sy));
    }

    const ro = new ResizeObserver(measure);
    ro.observe(vp);
    measure();
    return () => ro.disconnect();
  }, [contentSize.width, contentSize.height]);

  const handleDragStart = (nodeId: string) => {
    setDraggingNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      dragStartPosition.current = { x: node.position.x, y: node.position.y };
    }
  };

  const handleDrag = (nodeId: string, { offset }: PanInfo) => {
    if (draggingNodeId !== nodeId || !dragStartPosition.current) return;

    const newX = dragStartPosition.current.x + offset.x;
    const newY = dragStartPosition.current.y + offset.y;

    const constrainedX = Math.max(0, newX);
    const constrainedY = Math.max(0, newY);

    flushSync(() => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? { ...node, position: { x: constrainedX, y: constrainedY } }
            : node
        )
      );
    });

    setContentSize((prev) => ({
      width: Math.max(prev.width, constrainedX + NODE_WIDTH + 36),
      height: Math.max(prev.height, constrainedY + EST_CARD_HEIGHT + 12),
    }));
  };

  const handleDragEnd = () => {
    setDraggingNodeId(null);
    dragStartPosition.current = null;
  };

  return (
    <>
      {/* Mobile: full-width readable steps (canvas scales down and is hard to read on small screens). */}
      <div className="md:hidden w-full">
        <ol
          className="flex list-none flex-col gap-4"
          aria-label="GhostAPI workflow: five steps from schema to live mocks"
        >
          {WORKFLOW_STEPS.map((s, i) => {
            const Icon = s.icon;
            const isLast = i === WORKFLOW_STEPS.length - 1;
            return (
              <li key={s.id} className="flex flex-col">
                <Card
                  className={`rounded-2xl border p-4 shadow-sm ring-1 ring-black/[0.04] sm:rounded-3xl ${nodeCardClass}`}
                  role="article"
                  aria-label={`${s.step}: ${s.title}`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${iconWrapClass}`}
                      aria-hidden
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Badge
                        variant="outline"
                        className="rounded-full border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-slate-700 uppercase"
                      >
                        {s.step}
                      </Badge>
                      <h3 className="mt-2 text-lg font-bold leading-snug tracking-tight text-[#050040]">
                        {s.title}
                      </h3>
                      <p className="mt-2.5 text-[15px] font-medium leading-relaxed text-pretty text-slate-700">
                        {s.description}
                      </p>
                      {!isLast ? (
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          <span>Next</span>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-emerald-700 uppercase">
                          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          <span>Outcome</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="relative hidden w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5 md:block md:p-4">
        <div
          ref={viewportRef}
          className="relative h-[26.5rem] w-full overflow-hidden rounded-xl border border-slate-200 sm:rounded-2xl md:h-[27.5rem] lg:h-[22.5rem] xl:h-[27rem] 2xl:h-[29rem]"
          role="region"
          aria-label="GhostAPI workflow canvas"
          tabIndex={0}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-xl bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${FLOW_GRID_BG}')` }}
            aria-hidden
          />
          <div className="relative z-[1] flex h-full w-full items-center justify-center px-2 py-2 sm:px-3 sm:py-2.5 md:px-2 md:py-1.5">
            <div
              className="relative shrink-0"
              style={{
                width: contentSize.width * scale,
                height: contentSize.height * scale,
              }}
            >
              <div
                className="absolute top-0 left-0"
                style={{
                  width: contentSize.width,
                  height: contentSize.height,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <svg
                  className="pointer-events-none absolute top-0 left-0"
                  width={contentSize.width}
                  height={contentSize.height}
                  style={{ overflow: "visible" }}
                  aria-hidden
                >
                  {connections.map((c) => (
                    <WorkflowConnectionLine
                      key={`${c.from}-${c.to}`}
                      from={c.from}
                      to={c.to}
                      nodes={nodes}
                    />
                  ))}
                </svg>

                {nodes.map((node) => {
                  const Icon = node.icon;
                  const isDragging = draggingNodeId === node.id;

                  return (
                    <motion.div
                      key={node.id}
                      drag
                      dragMomentum={false}
                      dragConstraints={{
                        left: 0,
                        top: 0,
                        right: 100000,
                        bottom: 100000,
                      }}
                      onDragStart={() => handleDragStart(node.id)}
                      onDrag={(_, info) => handleDrag(node.id, info)}
                      onDragEnd={handleDragEnd}
                      style={{
                        x: node.position.x,
                        y: node.position.y,
                        width: NODE_WIDTH,
                        transformOrigin: "0 0",
                      }}
                      className="absolute h-auto cursor-grab"
                      initial={{ scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.02 }}
                      whileDrag={{ scale: 1.05, zIndex: 50, cursor: "grabbing" }}
                      aria-grabbed={isDragging}
                    >
                      <Card
                        className={`group/node w-full rounded-xl border p-3.5 transition-all hover:shadow-md sm:rounded-2xl sm:p-3.5 ${nodeCardClass} ${isDragging ? "shadow-lg ring-2 ring-[#050040]/20" : ""}`}
                        role="article"
                        aria-label={`${node.step}: ${node.title}`}
                      >
                        <div className="relative flex flex-col gap-2.5 lg:max-xl:items-center lg:max-xl:text-center">
                          <div className="flex w-full items-start gap-2.5 lg:max-xl:flex-col lg:max-xl:items-center">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${iconWrapClass}`}
                              aria-hidden
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1 lg:max-xl:flex-none lg:max-xl:shrink-0">
                              <Badge
                                variant="outline"
                                className="mb-0.5 rounded-full border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] font-bold tracking-wide text-slate-700 uppercase lg:max-xl:mx-auto"
                              >
                                {node.step}
                              </Badge>
                              <h3 className="text-sm font-bold leading-snug tracking-tight text-[#050040]">
                                {node.title}
                              </h3>
                            </div>
                          </div>
                          <p className="text-[11px] font-medium leading-relaxed text-slate-700 sm:text-xs lg:max-xl:max-w-[18.5rem] lg:max-xl:mx-auto">
                            {node.description}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-slate-600 uppercase sm:text-xs lg:max-xl:justify-center">
                            <ArrowRight className="h-3 w-3 shrink-0" aria-hidden />
                            <span>
                              {node.id === "node-5" ? "Outcome" : "Next"}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
