import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

interface ImagePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageStore {
  gridOffsetX: number;
  gridOffsetY: number;
  images: ImagePosition[];
  setGridOffset: (x: number, y: number) => void;
  updateImagePosition: (id: string, x: number, y: number) => void;
  initializeImages: (images: ImagePosition[]) => void;
  addImage: (x: number, y: number, width: number, height: number) => void;
}

export const useImageStore = create<ImageStore>()(
  persist(
    (set, get) => ({
      gridOffsetX: 0,
      gridOffsetY: 0,
      images: [
        {
          id: uuid.v4() as string,
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        },
        {
          id: uuid.v4() as string,
          x: 200,
          y: 150,
          width: 50,
          height: 50,
        },
        {
          id: uuid.v4() as string,
          x: 300,
          y: 200,
          width: 50,
          height: 50,
        },
      ],
      setGridOffset: (x: number, y: number) =>
        set({ gridOffsetX: x, gridOffsetY: y }),
      updateImagePosition: (id: string, x: number, y: number) =>
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id ? { ...img, x, y } : img,
          ),
        })),
      initializeImages: (images: ImagePosition[]) => set({ images }),
      addImage: (x: number, y: number, width: number, height: number) =>
        set((state) => ({
          images: [
            ...state.images,
            {
              id: uuid.v4() as string,
              x,
              y,
              width,
              height,
            },
          ],
        })),
    }),
    {
      name: "image-positions-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        gridOffsetX: state.gridOffsetX,
        gridOffsetY: state.gridOffsetY,
        images: state.images,
      }),
    },
  ),
);
