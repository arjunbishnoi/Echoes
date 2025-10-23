import { SCREEN_WIDTH } from "@/constants/dimensions";
import { colors, spacing } from "@/theme/theme";
import type { EchoMedia } from "@/types/echo";
import { Image, Pressable, StyleSheet, View } from "react-native";
import EmptyState from "../ui/EmptyState";

const GRID_HORIZONTAL_MARGIN = spacing.lg;
const GRID_GAP = 10;
const GRID_COLUMNS = 3;
const AVAILABLE_WIDTH = SCREEN_WIDTH - (GRID_HORIZONTAL_MARGIN * 2);
const ITEM_SIZE = (AVAILABLE_WIDTH - (GRID_COLUMNS - 1) * GRID_GAP) / GRID_COLUMNS;

interface MediaGridProps {
  media?: EchoMedia[];
  onMediaPress?: (item: EchoMedia) => void;
}

export default function MediaGrid({ media = [], onMediaPress }: MediaGridProps) {
  if (media.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          icon="images-outline"
          title="No Media Yet"
          subtitle="Add photos, videos, or files to this echo"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {media.map((item, index) => {
          return (
            <Pressable 
              key={item.id || `media-${index}`} 
              style={styles.item}
              onPress={() => onMediaPress?.(item)}
            >
              <View style={styles.placeholder}>
                <Image
                  source={{ uri: item.thumbnailUri || item.uri }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    minHeight: 300,
    justifyContent: "center",
  },
  container: {
    paddingTop: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: GRID_GAP,
    rowGap: GRID_GAP,
    width: "100%",
    paddingHorizontal: GRID_HORIZONTAL_MARGIN,
  },
  item: {
    width: ITEM_SIZE,
    aspectRatio: 1,
    marginBottom: 0,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.surface,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
});


