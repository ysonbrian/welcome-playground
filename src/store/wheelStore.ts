import { create } from "zustand";

const DEFAULT_ITEMS = ["짜장면", "피자", "치킨", "라면", "삼겹살", "초밥"];
export const MAX_WHEEL_ITEMS = 10;

interface WheelStore {
  items: string[];
  addItem: (name: string) => "added" | "duplicate" | "full";
  removeItem: (index: number) => void;
  setItems: (items: string[]) => void;
}

export const useWheelStore = create<WheelStore>((set, get) => ({
  items: DEFAULT_ITEMS,

  addItem: (name) => {
    const trimmed = name.trim().slice(0, 8);
    const { items } = get();
    if (!trimmed || items.includes(trimmed)) return "duplicate";
    if (items.length >= MAX_WHEEL_ITEMS) return "full";
    set({ items: [...items, trimmed] });
    return "added";
  },

  removeItem: (index) => {
    const { items } = get();
    if (items.length <= 2) return;
    set({ items: items.filter((_, i) => i !== index) });
  },

  setItems: (items) => set({ items }),
}));
