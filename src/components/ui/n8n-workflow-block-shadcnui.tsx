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

/** Card width; height follows copy (no fixed empty area). */
const NODE_WIDTH = 256;

/**
 * Used for zig-zag row gap, SVG connector midpoint, canvas bounds, and drag expansion
 * (approx. half of typical rendered card — lines stay visually centered).
 */
const EST_CARD_HEIGHT = 248;

/** Same PrebuiltUI grid as hero (no extra tint layers — warmth comes from the asset). */
const FLOW_GRID_BG =
  "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/gridBackground.png";

const GAP_X = 36;
const BASE_X = 24;
/** Odd steps (1,3,5) upper row; even steps (2,4) lower row — zig-zag, no vertical overlap. */
const Y_HIGH = 24;
const Y_LOW = Y_HIGH + EST_CARD_HEIGHT + 16;

function zigZagX(index: number) {
  return BASE_X + index * (NODE_WIDTH + GAP_X);
}

function zigZagY(index: number) {
  return index % 2 === 0 ? Y_HIGH : Y_LOW;
}

const initialNodes: WorkflowNode[] = [
  {
    id: "node-1",
    step: "Step 1",
    title: "Define your schema",
    description:
      "Describe response fields and types in JSON—strings, numbers, booleans, nested objects.",
    icon: Braces,
    position: { x: zigZagX(0), y: zigZagY(0) },
  },
  {
    id: "node-2",
    step: "Step 2",
    title: "Submit your format",
    description:
      "Send the structure to API Ghost so it knows what each mock response should look like.",
    icon: FileUp,
    position: { x: zigZagX(1), y: zigZagY(1) },
  },
  {
    id: "node-3",
    step: "Step 3",
    title: "Receive a unique URL",
    description:
      "Get a dedicated GET endpoint you can drop into apps, tests, or prototypes.",
    icon: Link2,
    position: { x: zigZagX(2), y: zigZagY(2) },
  },
  {
    id: "node-4",
    step: "Step 4",
    title: "Call it like a real API",
    description:
      "Your frontend issues normal GET requests—no special client or SDK required.",
    icon: Radio,
    position: { x: zigZagX(3), y: zigZagY(3) },
  },
  {
    id: "node-5",
    step: "Step 5",
    title: "Fresh data every time",
    description:
      "Each response is generated on the fly with realistic values (e.g. Faker-style rules).",
    icon: Sparkles,
    position: { x: zigZagX(4), y: zigZagY(4) },
  },
];

const initialConnections: WorkflowConnection[] = [
  { from: "node-1", to: "node-2" },
  { from: "node-2", to: "node-3" },
  { from: "node-3", to: "node-4" },
  { from: "node-4", to: "node-5" },
];

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
    return { width: maxX + 56, height: maxY + 56 };
  });

  useLayoutEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    function measure() {
      const el = viewportRef.current;
      if (!el) return;
      const pad = 12;
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
      width: Math.max(prev.width, constrainedX + NODE_WIDTH + 56),
      height: Math.max(prev.height, constrainedY + EST_CARD_HEIGHT + 56),
    }));
  };

  const handleDragEnd = () => {
    setDraggingNodeId(null);
    dragStartPosition.current = null;
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div
        ref={viewportRef}
        className="relative h-[min(30rem,85vw)] w-full overflow-hidden rounded-xl border border-slate-200 sm:h-[34rem] md:h-[36rem] lg:h-[38rem]"
        role="region"
        aria-label="GhostAPI workflow canvas"
        tabIndex={0}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-xl bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${FLOW_GRID_BG}')` }}
          aria-hidden
        />
        <div className="relative z-[1] flex h-full w-full items-center justify-center p-3">
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
                      className={`group/node w-full rounded-xl border p-3.5 transition-all hover:shadow-md sm:p-4 ${nodeCardClass} ${isDragging ? "shadow-lg ring-2 ring-[#050040]/20" : ""}`}
                      role="article"
                      aria-label={`${node.step}: ${node.title}`}
                    >
                      <div className="relative flex flex-col gap-2.5">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${iconWrapClass}`}
                            aria-hidden
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Badge
                              variant="outline"
                              className="mb-0.5 rounded-full border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] font-bold tracking-wide text-slate-700 uppercase"
                            >
                              {node.step}
                            </Badge>
                            <h3 className="text-sm font-bold leading-snug tracking-tight text-[#050040]">
                              {node.title}
                            </h3>
                          </div>
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed text-slate-700 sm:text-xs">
                          {node.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-slate-600 uppercase sm:text-xs">
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
  );
}
