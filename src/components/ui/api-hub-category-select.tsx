"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import * as React from "react";

type ApiHubCategorySelectProps = {
  id: string;
  labelId: string;
  categories: string[];
  value: string;
  onValueChange: (next: string) => void;
};

/** Custom listbox with keyboard support and theme-matched styling. */
export function ApiHubCategorySelect({
  id,
  labelId,
  categories,
  value,
  onValueChange,
}: ApiHubCategorySelectProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const options = React.useMemo(() => ["", ...categories], [categories]);
  const labels = React.useMemo(
    () => ["All categories", ...categories],
    [categories]
  );

  const valueIndex = React.useMemo(
    () => Math.max(0, options.indexOf(value)),
    [options, value]
  );

  const [highlight, setHighlight] = React.useState(valueIndex);

  React.useEffect(() => {
    if (open) setHighlight(valueIndex);
  }, [open, valueIndex]);

  React.useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  const close = React.useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }, []);

  const selectIndex = React.useCallback(
    (idx: number) => {
      const v = options[idx] ?? "";
      onValueChange(v);
      close();
    },
    [close, onValueChange, options]
  );

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const n = options.length;
    if (n === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlight((h) => (h + 1) % n);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlight((h) => (h - 1 + n) % n);
        break;
      case "Home":
        e.preventDefault();
        setHighlight(0);
        break;
      case "End":
        e.preventDefault();
        setHighlight(n - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        selectIndex(highlight);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        e.preventDefault();
        close();
        break;
      default:
        break;
    }
  };

  const onButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) setOpen(true);
    }
    if (open && e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      listRef.current?.focus();
    }
  };

  React.useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => listRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const displayLabel = value === "" ? "All categories" : value;

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <button
        ref={buttonRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-labelledby={labelId}
        aria-activedescendant={open ? `${id}-opt-${highlight}` : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKeyDown}
        className={cn(
          "relative flex min-h-11 w-full cursor-pointer items-center rounded-full border border-slate-300 bg-white py-2.5 pr-12 pl-4 text-left text-sm font-medium text-[#050040] shadow-sm outline-none transition",
          "focus-visible:border-[#050040]/35 focus-visible:ring-2 focus-visible:ring-[#050040]/15",
          open && "border-[#050040]/35 ring-2 ring-[#050040]/15"
        )}
      >
        <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute top-1/2 right-6 size-[1.125rem] -translate-y-1/2 text-[#050040]/65 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
          strokeWidth={2.25}
        />
      </button>
      {open ? (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          tabIndex={0}
          aria-labelledby={labelId}
          onKeyDown={onListKeyDown}
          className={cn(
            "absolute top-full right-0 left-0 z-[60] mt-1 max-h-[min(50vh,280px)] list-none overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-lg outline-none",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            "focus-visible:ring-2 focus-visible:ring-[#050040]/20"
          )}
        >
          {options.map((opt, idx) => (
            <li
              key={opt === "" ? "__all__" : opt}
              id={`${id}-opt-${idx}`}
              role="option"
              aria-selected={value === opt}
              className={cn(
                "cursor-pointer px-4 py-2.5 text-sm text-[#050040] outline-none",
                idx === highlight ? "bg-slate-100" : "hover:bg-slate-50"
              )}
              onMouseEnter={() => setHighlight(idx)}
              onClick={() => selectIndex(idx)}
            >
              {labels[idx]}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
