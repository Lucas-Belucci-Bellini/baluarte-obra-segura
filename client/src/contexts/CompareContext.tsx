import { createContext, useContext, useState, type ReactNode } from 'react';

export type CompareItemType = 'material' | 'tool';
export type CompareItem = { type: CompareItemType; id: number };

type CompareCtx = {
  items: CompareItem[];
  add: (item: CompareItem) => void;
  remove: (item: CompareItem) => void;
  toggle: (item: CompareItem) => void;
  has: (item: CompareItem) => boolean;
  clear: () => void;
  canAdd: (type: CompareItemType) => boolean;
};

const Ctx = createContext<CompareCtx | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);

  const has = (item: CompareItem) =>
    items.some(i => i.type === item.type && i.id === item.id);

  const canAdd = (type: CompareItemType) => {
    if (items.length >= 4) return false;
    if (items.length > 0 && items[0].type !== type) return false;
    return true;
  };

  const add = (item: CompareItem) => {
    if (has(item) || !canAdd(item.type)) return;
    setItems(prev => [...prev, item]);
  };

  const remove = (item: CompareItem) =>
    setItems(prev => prev.filter(i => !(i.type === item.type && i.id === item.id)));

  const toggle = (item: CompareItem) => (has(item) ? remove(item) : add(item));

  const clear = () => setItems([]);

  return (
    <Ctx.Provider value={{ items, add, remove, toggle, has, clear, canAdd }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider');
  return ctx;
}
