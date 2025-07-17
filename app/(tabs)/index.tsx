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
import { useSharedValue, useDerivedValue } from "react-native-reanimated";

export default function HomeScreen() {
  const gridOffsetX = useSharedValue(0);
  const gridOffsetY = useSharedValue(0);

  const images = [
    {
      id: 1,
      x: useSharedValue(100),
      y: useSharedValue(100),
      width: 50,
      height: 50,
    },
    {
      id: 2,
      x: useSharedValue(200),
      y: useSharedValue(150),
      width: 50,
      height: 50,
    },
    {
      id: 3,
      x: useSharedValue(300),
      y: useSharedValue(200),
      width: 50,
      height: 50,
    },
  ];

  const draggingImageId = useSharedValue<number | null>(null);

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
