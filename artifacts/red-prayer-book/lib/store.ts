import { create } from 'zustand';

type BookState = {
  totalPages: number;
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  jumpTo: (i: number) => void;
};

export const useBookStore = create<BookState>((set, get) => ({
  totalPages: 200,
  currentIndex: 0,
  setCurrentIndex: (i) =>
    set({ currentIndex: Math.max(0, Math.min(get().totalPages - 1, i)) }),
  jumpTo: (i) =>
    set({ currentIndex: Math.max(0, Math.min(get().totalPages - 1, i)) }),
}));
