import {
  Canvas,
  Group,
  Image as SkiaImage,
  useImage,
} from "@shopify/react-native-skia";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import {
  useSharedValue,
  useDerivedValue,
  runOnJS,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useImageStore } from "@/store/canvas";

export default function HomeScreen() {
  const {
    gridOffsetX: storedGridOffsetX,
    gridOffsetY: storedGridOffsetY,
    images: storedImages,
    setGridOffset,
    updateImagePosition,
  } = useImageStore();

  // Initialize shared values from store
  const gridOffsetX = useSharedValue(storedGridOffsetX);
  const gridOffsetY = useSharedValue(storedGridOffsetY);

  // Create images array with shared values initialized from store
  const images = storedImages.map((img) => ({
    id: img.id,
    x: useSharedValue(img.x),
    y: useSharedValue(img.y),
    width: img.width,
    height: img.height,
  }));

  const draggingImageId = useSharedValue<string | null>(null);

  // Sync shared values with store on mount
  useEffect(() => {
    gridOffsetX.value = storedGridOffsetX;
    gridOffsetY.value = storedGridOffsetY;

    images.forEach((img, index) => {
      img.x.value = storedImages[index].x;
      img.y.value = storedImages[index].y;
    });
  }, [storedGridOffsetX, storedGridOffsetY, storedImages]);

  // Functions to persist to store
  const persistGridOffset = (x: number, y: number) => {
    setGridOffset(x, y);
  };

  const persistImagePosition = (id: string, x: number, y: number) => {
    updateImagePosition(id, x, y);
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      const touchX = e.x - gridOffsetX.value;
      const touchY = e.y - gridOffsetY.value;
      for (const img of images) {
        if (
          touchX >= img.x.value &&
          touchX <= img.x.value + img.width &&
          touchY >= img.y.value &&
          touchY <= img.y.value + img.height
        ) {
          draggingImageId.value = img.id;
          return;
        }
      }
      draggingImageId.value = null;
    })
    .onChange((e) => {
      const img = images.find((img) => img.id === draggingImageId.value);
      if (img) {
        img.x.value += e.changeX;
        img.y.value += e.changeY;
      } else {
        gridOffsetX.value += e.changeX;
        gridOffsetY.value += e.changeY;
      }
    })
    .onEnd(() => {
      // Persist final positions to store
      if (draggingImageId.value) {
        const img = images.find((img) => img.id === draggingImageId.value);
        if (img) {
          runOnJS(persistImagePosition)(img.id, img.x.value, img.y.value);
        }
      } else {
        runOnJS(persistGridOffset)(gridOffsetX.value, gridOffsetY.value);
      }
      draggingImageId.value = null;
    });

  const imageTransforms = images.map((img) =>
    useDerivedValue(() => [
      { translateX: img.x.value + gridOffsetX.value },
      { translateY: img.y.value + gridOffsetY.value },
    ]),
  );

  const image = useImage(require("../../assets/images/favicon.png"));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={pan}>
        <Canvas style={{ flex: 1 }}>
          {image &&
            images.map((img, i) => (
              <Group key={img.id} transform={imageTransforms[i]}>
                <SkiaImage
                  x={0}
                  y={0}
                  image={image}
                  width={img.width}
                  height={img.height}
                />
              </Group>
            ))}
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
