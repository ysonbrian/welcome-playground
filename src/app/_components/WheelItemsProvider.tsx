"use client";

import { createContext, useContext, useEffect, useState, type ReactNode, useRef } from "react";
import { supabase } from "~/lib/supabase";

export const MAX_WHEEL_ITEMS = 10;

type AddResult = "added" | "duplicate" | "full";

interface WheelRow { id: number; name: string; }

interface WheelCtxValue {
  items: string[];
  loading: boolean;
  addItem: (name: string) => AddResult;
  removeItem: (index: number) => void;
  clearItems: () => void;
}

const WheelCtx = createContext<WheelCtxValue | null>(null);

export function WheelItemsProvider({ children }: { children: ReactNode }) {
  const [rows, setRows]       = useState<WheelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const nextTempId            = useRef(-1);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    void supabase
      .from("wheel_items")
      .select("id, name")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setRows((data as WheelRow[]) ?? []);
        setLoading(false);
      });

    const channel = supabase
      .channel("wheel_items_rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wheel_items" },
        (payload) => {
          const row = payload.new as WheelRow;
          setRows((prev) => {
            // 같은 이름의 낙관적 항목이 있으면 실제 ID로 교체
            if (prev.some((r) => r.name === row.name)) {
              return prev.map((r) => (r.name === row.name ? row : r));
            }
            return [...prev, row];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "wheel_items" },
        (payload) => {
          const id = (payload.old as { id: number }).id;
          setRows((prev) => prev.filter((r) => r.id !== id));
        },
      )
      .subscribe();

    return () => { void supabase!.removeChannel(channel); };
  }, []);

  const items = rows.map((r) => r.name);

  const addItem = (name: string): AddResult => {
    const trimmed = name.trim().slice(0, 8);
    if (!trimmed || items.includes(trimmed)) return "duplicate";
    if (items.length >= MAX_WHEEL_ITEMS) return "full";

    // 낙관적 업데이트 (루프에서 동시 호출 시에도 고유 id 보장)
    const tempId = nextTempId.current--;
    setRows((prev) => [...prev, { id: tempId, name: trimmed }]);

    if (supabase) {
      void supabase
        .from("wheel_items")
        .insert({ name: trimmed })
        .select("id, name")
        .single()
        .then(({ data, error }) => {
          if (error) {
            setRows((prev) => prev.filter((r) => r.id !== tempId));
          } else if (data) {
            setRows((prev) =>
              prev.map((r) => (r.id === tempId ? (data as WheelRow) : r)),
            );
          }
        });
    }

    return "added";
  };

  const removeItem = (index: number): void => {
    const row = rows[index];
    if (!row || !supabase) return;

    // 낙관적 제거
    setRows((prev) => prev.filter((r) => r.id !== row.id));

    // id > 0: 실제 DB 행 → id로 삭제
    // id < 0: INSERT 응답 대기 중 → name으로 삭제 (다른 행 충돌 없음, UNIQUE 제약 제거됨)
    const query =
      row.id > 0
        ? supabase.from("wheel_items").delete().eq("id", row.id)
        : supabase.from("wheel_items").delete().eq("name", row.name);

    void query.then(({ error }) => {
      if (error) {
        // DB 삭제 실패 시 롤백
        console.error("[wheel] delete failed:", error.message);
        setRows((prev) =>
          prev.some((r) => r.id === row.id) ? prev : [...prev, row],
        );
      }
    });
  };

  const clearItems = (): void => {
    if (!supabase) return;

    const snapshot = [...rows];
    setRows([]);

    void supabase
      .from("wheel_items")
      .delete()
      .gt("id", 0)
      .then(({ error }) => {
        if (error) {
          console.error("[wheel] clear failed:", error.message);
          setRows(snapshot);
        }
      });
  };

  return (
    <WheelCtx.Provider value={{ items, loading, addItem, removeItem, clearItems }}>
      {children}
    </WheelCtx.Provider>
  );
}

export function useWheelItems() {
  const ctx = useContext(WheelCtx);
  if (!ctx) throw new Error("useWheelItems must be used within WheelItemsProvider");
  return ctx;
}
