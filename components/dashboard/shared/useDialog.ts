"use client";

import { useEffect, useRef } from "react";

// Open dialogs, innermost last. Escape only reaches the top one, so closing a nested
// dialog (e.g. an event preview over the create form) never dismisses its parent.
const openDialogs: symbol[] = [];

/**
 * Shared keyboard/focus behavior for dashboard dialogs: Escape closes the topmost
 * dialog, focus moves into the dialog when it opens and returns to the previously
 * focused element when it closes. Attach the returned ref to the dialog panel.
 */
export function useDialog<T extends HTMLElement>(onEscape: () => void, active = true) {
  const panelRef = useRef<T>(null);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!active) return;
    const id = Symbol("dialog");
    openDialogs.push(id);
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || openDialogs[openDialogs.length - 1] !== id) return;
      event.preventDefault();
      onEscapeRef.current();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      openDialogs.splice(openDialogs.indexOf(id), 1);
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [active]);

  return panelRef;
}
