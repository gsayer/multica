"use client";

import { useState } from "react";
import { X, Plus, Filter, ExternalLink } from "lucide-react";
import { cn } from "@multica/ui/lib/utils";
import { TooltipHint } from "@multica/ui/components/common/tooltip-hint";
import { Checkbox } from "@multica/ui/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@multica/ui/components/ui/select";
import type {
  WebhookEventFilter,
  WebhookPayloadCondition,
} from "@multica/core/types";
import { useT } from "../../i18n";
import {
  CONDITION_OPS,
  EMPTY_CONDITION_DRAFT,
  MAX_CONDITIONS,
  buildCondition,
  formatCondition,
  type ConditionDraft,
  type ConditionOp,
} from "./webhook-payload-condition";


interface WebhookEventFilterSectionProps {
  filters: WebhookEventFilter[];
  onChange: (filters: WebhookEventFilter[]) => void;
}

export function WebhookEventFilterSection({
  filters,
  onChange,
}: WebhookEventFilterSectionProps) {
  const { t, i18n } = useT("autopilots");
  const [newEvent, setNewEvent] = useState("");
  const [newActions, setNewActions] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState<ConditionDraft>(EMPTY_CONDITION_DRAFT);
  const draftCondition = buildCondition(draft);
  const docsHref = i18n.language?.startsWith("zh")
    ? `https://multica.ai/docs/zh/autopilots#${encodeURIComponent("事件过滤")}`
    : i18n.language?.startsWith("fr")
      ? `https://multica.ai/docs/fr/autopilots#${encodeURIComponent("filtres-dévénements")}`
      : "https://multica.ai/docs/autopilots#event-filters";

  const addFilter = () => {
    const event = newEvent.trim();
    if (!event) return;
    const actions = newActions
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
    const next: WebhookEventFilter = { event };
    if (actions.length > 0) next.actions = actions;
    onChange([...filters, next]);
    setNewEvent("");
    setNewActions("");
  };

  const removeFilter = (idx: number) => {
    onChange(filters.filter((_, i) => i !== idx));
    setEditingIdx(null);
  };

  const updateConditions = (idx: number, conditions: WebhookPayloadCondition[]) => {
    onChange(
      filters.map((f, i) => {
        if (i !== idx) return f;
        const { conditions: _previous, ...rest } = f;
        return conditions.length > 0 ? { ...rest, conditions } : rest;
      }),
    );
  };

  const openEditor = (idx: number) => {
    setEditingIdx(idx);
    setDraft(EMPTY_CONDITION_DRAFT);
  };

  const addCondition = (idx: number) => {
    if (!draftCondition) return;
    updateConditions(idx, [...(filters[idx]?.conditions ?? []), draftCondition]);
    setDraft(EMPTY_CONDITION_DRAFT);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-micro font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        <Filter className="size-3" />
        {t(($) => $.dialog.event_filter_label)}
        <a
          href={docsHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t(($) => $.dialog.event_filter_docs_link_label)}
          title={t(($) => $.dialog.event_filter_docs_link_label)}
          className="ml-0.5 inline-flex items-center text-faint-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="size-3" />
        </a>
      </div>

      {filters.length > 0 && (
        <div className="space-y-1">
          {filters.map((f, idx) => {
            const conditions = f.conditions ?? [];
            const editing = editingIdx === idx;
            return (
              <div key={idx} className="rounded-md border bg-background px-2.5 py-1.5 text-caption">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-foreground">{f.event}</span>
                  {f.actions && f.actions.length > 0 && (
                    <span className="text-muted-foreground">: {f.actions.join(", ")}</span>
                  )}
                  {!editing && conditions.length < MAX_CONDITIONS && (
                    <button
                      type="button"
                      onClick={() => openEditor(idx)}
                      className="ml-auto inline-flex items-center gap-0.5 rounded-xs px-1 py-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Plus className="size-3" />
                      {t(($) => $.dialog.event_filter_condition_add)}
                    </button>
                  )}
                  <TooltipHint label={t(($) => $.dialog.event_filter_remove_label)}>
                    <button
                      type="button"
                      onClick={() => removeFilter(idx)}
                      aria-label={t(($) => $.dialog.event_filter_remove_label)}
                      className={cn(
                        "rounded-xs p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                        (editing || conditions.length >= MAX_CONDITIONS) && "ml-auto",
                      )}
                    >
                      <X className="size-3" />
                    </button>
                  </TooltipHint>
                </div>

                {conditions.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {conditions.map((c, cIdx) => (
                      <li key={cIdx} className="flex min-w-0 items-center gap-2 pl-2">
                        <span className="min-w-0 truncate font-mono text-muted-foreground">
                          {formatCondition(c)}
                        </span>
                        <TooltipHint label={t(($) => $.dialog.event_filter_condition_remove_label)}>
                          <button
                            type="button"
                            onClick={() =>
                              updateConditions(
                                idx,
                                conditions.filter((_, i) => i !== cIdx),
                              )
                            }
                            aria-label={t(($) => $.dialog.event_filter_condition_remove_label)}
                            className="ml-auto rounded-xs p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <X className="size-3" />
                          </button>
                        </TooltipHint>
                      </li>
                    ))}
                  </ul>
                )}

                {editing && (
                  <div className="mt-1.5 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={draft.path}
                        onChange={(e) => setDraft({ ...draft, path: e.target.value })}
                        aria-label={t(($) => $.dialog.event_filter_condition_path_label)}
                        placeholder={t(($) => $.dialog.event_filter_condition_path_placeholder)}
                        className="min-w-32 flex-1 rounded-md border bg-background px-2.5 py-1.5 text-caption font-mono outline-none focus:ring-1 focus:ring-ring"
                      />
                      <Select
                        items={CONDITION_OPS.map((op) => ({ value: op, label: op }))}
                        value={draft.op}
                        onValueChange={(v) => {
                          if (v) setDraft({ ...draft, op: v as ConditionOp });
                        }}
                      >
                        <SelectTrigger
                          size="sm"
                          aria-label={t(($) => $.dialog.event_filter_condition_op_label)}
                          className="w-32 font-mono"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_OPS.map((op) => (
                            <SelectItem key={op} value={op} className="font-mono">
                              {op}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {draft.op !== "exists" && (
                        <input
                          type="text"
                          value={draft.value}
                          onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCondition(idx);
                            }
                          }}
                          aria-label={t(($) => $.dialog.event_filter_condition_value_label)}
                          placeholder={
                            draft.op === "in"
                              ? t(($) => $.dialog.event_filter_condition_values_placeholder)
                              : t(($) => $.dialog.event_filter_condition_value_placeholder)
                          }
                          className="min-w-24 flex-1 rounded-md border bg-background px-2.5 py-1.5 text-caption font-mono outline-none focus:ring-1 focus:ring-ring"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {draft.op !== "exists" && (
                        <label className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Checkbox
                            checked={draft.ignoreCase}
                            onCheckedChange={(checked) =>
                              setDraft({ ...draft, ignoreCase: checked === true })
                            }
                          />
                          {t(($) => $.dialog.event_filter_condition_ignore_case)}
                        </label>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingIdx(null)}
                        className="ml-auto rounded-md px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        {t(($) => $.dialog.event_filter_condition_done)}
                      </button>
                      <button
                        type="button"
                        onClick={() => addCondition(idx)}
                        disabled={!draftCondition}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-medium transition-colors",
                          draftCondition
                            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                            : "bg-muted text-muted-foreground cursor-not-allowed",
                        )}
                      >
                        <Plus className="size-3.5" />
                        {t(($) => $.dialog.event_filter_add)}
                      </button>
                    </div>
                    <p className="text-micro text-muted-foreground">
                      {t(($) => $.dialog.event_filter_condition_hint)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addFilter();
            }
          }}
          placeholder={t(($) => $.dialog.event_filter_event_placeholder)}
          className="flex-1 min-w-0 rounded-md border bg-background px-2.5 py-1.5 text-caption font-mono outline-none focus:ring-1 focus:ring-ring"
        />
        <input
          type="text"
          value={newActions}
          onChange={(e) => setNewActions(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addFilter();
            }
          }}
          placeholder={t(($) => $.dialog.event_filter_actions_placeholder)}
          className="w-28 rounded-md border bg-background px-2.5 py-1.5 text-caption outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="button"
          onClick={addFilter}
          disabled={!newEvent.trim()}
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-1 rounded-md border px-2.5 py-1.5 text-caption font-medium transition-colors",
            newEvent.trim()
              ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          <Plus className="size-3.5" />
          {t(($) => $.dialog.event_filter_add)}
        </button>
      </div>
      <p className="text-micro text-muted-foreground">
        {t(($) => $.dialog.event_filter_hint)}
      </p>
    </div>
  );
}
