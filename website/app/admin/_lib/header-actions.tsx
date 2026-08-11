"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface HeaderActionsContextValue {
  actions: ReactNode;
  setActions: (node: ReactNode) => void;
}

const HeaderActionsContext = createContext<
  HeaderActionsContextValue | undefined
>(undefined);

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null);

  return (
    <HeaderActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

/** Read by Topbar to render whatever the current page has registered. */
export function useHeaderActions(): ReactNode {
  const ctx = useContext(HeaderActionsContext);
  if (!ctx) {
    throw new Error(
      "useHeaderActions must be used within a HeaderActionsProvider",
    );
  }
  return ctx.actions;
}

/**
 * Call from a page to render `node` in the shared Topbar's action slot
 * (top-right, next to the page title) instead of inline in the page body.
 * Registers once on mount and clears on unmount/navigation.
 *
 * Deliberately a mount-only effect (empty deps) rather than re-syncing on
 * every render: `node` is a fresh JSX element each render, so depending on
 * it would re-fire the effect every render and could loop. This is safe as
 * long as the action's event handlers don't close over state that changes
 * after mount — if they do, wrap them in a ref or add explicit deps.
 */
export function useSetHeaderActions(node: ReactNode) {
  const ctx = useContext(HeaderActionsContext);
  if (!ctx) {
    throw new Error(
      "useSetHeaderActions must be used within a HeaderActionsProvider",
    );
  }
  const { setActions } = ctx;

  useEffect(() => {
    setActions(node);
    return () => setActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
