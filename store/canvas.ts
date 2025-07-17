import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Sticker = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type StickerState = {
  stickers: Sticker[];
};

type CanvasState = {
  offsetX: number;
  offsetY: number;
  stickers: StickerState;
};

const initialState: CanvasState = {
  offsetX: 0,
  offsetY: 0,
  stickers: {
    stickers: [],
  },
};

export const useCanvasStore = create<
  CanvasState & {
    addSticker: (sticker: Sticker) => void;
    moveSticker: (id: string, x: number, y: number) => void;
    setOffset: (x: number, y: number) => void;
  }
>()(
  persist(
    (set) => ({
      ...initialState,
      addSticker: (sticker) =>
        set((state) => ({
          stickers: {
            stickers: [...state.stickers.stickers, sticker],
          },
        })),
      moveSticker: (id, x, y) =>
        set((state) => ({
          stickers: {
            stickers: state.stickers.stickers.map((s) =>
              s.id === id ? { ...s, x, y } : s,
            ),
          },
        })),
      setOffset: (x, y) =>
        set(() => ({
          offsetX: x,
          offsetY: y,
        })),
    }),
    {
      name: "canvas-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
