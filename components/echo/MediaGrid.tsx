import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MEDIA_GRID_GAP, MEDIA_ITEM_SIZE } from "../../constants/dimensions";
import { FILE_TYPE_LABELS } from "../../constants/mediaTypes";
import { colors } from "../../theme/theme";
import type { EchoMedia } from "../../types/echo";
import EmptyState from "../ui/EmptyState";

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
          const fileType = FILE_TYPE_LABELS[item.type] || "FILE";

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
                <View style={styles.label}>
                  <Text style={styles.labelText}>{fileType}</Text>
                </View>
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
    paddingTop: 0,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: MEDIA_GRID_GAP,
    rowGap: MEDIA_GRID_GAP,
    width: "100%",
    paddingHorizontal: 0,
  },
  item: {
    width: MEDIA_ITEM_SIZE,
    aspectRatio: 1,
    marginBottom: 0,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  label: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labelText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "600",
  },
});


