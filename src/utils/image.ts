import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "react-native";

export const COVER_IMAGE_ASPECT_RATIO: [number, number] = [5, 2];

const TARGET_RATIO = COVER_IMAGE_ASPECT_RATIO[0] / COVER_IMAGE_ASPECT_RATIO[1];
const RATIO_TOLERANCE = 0.02;

type Dimensions = {
  width?: number;
  height?: number;
};

const getImageSize = (uri: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });

export async function ensureCoverImageAspectRatio(
  uri: string,
  dimensions?: Dimensions
): Promise<string> {
  try {
    let width = dimensions?.width ?? 0;
    let height = dimensions?.height ?? 0;

    if (!width || !height) {
      const size = await getImageSize(uri);
      width = size.width;
      height = size.height;
    }

    if (!width || !height) {
      return uri;
    }

    const ratio = width / height;
    if (Math.abs(ratio - TARGET_RATIO) <= RATIO_TOLERANCE) {
      return uri;
    }

    let cropWidth = width;
    let cropHeight = height;
    let originX = 0;
    let originY = 0;

    if (ratio > TARGET_RATIO) {
      cropWidth = height * TARGET_RATIO;
      originX = (width - cropWidth) / 2;
    } else {
      cropHeight = width / TARGET_RATIO;
      originY = (height - cropHeight) / 2;
    }

    const roundedCropWidth = Math.max(1, Math.min(width, Math.round(cropWidth)));
    const roundedCropHeight = Math.max(1, Math.min(height, Math.round(cropHeight)));

    const roundedOriginX = Math.min(
      Math.max(0, Math.round(originX)),
      width - roundedCropWidth
    );
    const roundedOriginY = Math.min(
      Math.max(0, Math.round(originY)),
      height - roundedCropHeight
    );

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          crop: {
            originX: roundedOriginX,
            originY: roundedOriginY,
            width: roundedCropWidth,
            height: roundedCropHeight,
          },
        },
      ],
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri ?? uri;
  } catch (error) {
    return uri;
  }
}


