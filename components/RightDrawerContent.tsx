import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomGradient from "./BottomGradient";
import LibraryBottomBar from "./LibraryBottomBar";
import LibraryItem from "./LibraryItem";
import { spacing } from "../theme/theme";
import SearchBar from "./SearchBar";

type RightDrawerContentProps = {
  insetTop: number;
};

export default function RightDrawerContent({ insetTop }: RightDrawerContentProps) {
  const insets = useSafeAreaInsets();
  const top = insetTop ?? insets.top;
  const [filter, setFilter] = React.useState<"recent" | "locked" | "completed" | "all">("recent");
  const [query, setQuery] = React.useState("");
  return (
    <View style={[styles.container, { paddingTop: top }]}> 
      <View style={{ paddingHorizontal: 0 }}>
        <SearchBar placeholder="Echoes Library" value={query} onChangeText={setQuery} />
      </View>

      <View style={{ height: spacing.lg }} />
      {(() => {
        const items: React.ReactNode[] = [];
        // Common items across multiple tabs
        if (filter === "recent" || filter === "all") {
          items.push(
            <LibraryItem
              key="wc"
              title="World Cup Final 2025"
              thumbnailUri="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=300&auto=format&fit=crop"
              solidColor="#3E6F3E"
              progress={0.75}
            />
          );
        }
        if (filter === "locked" || filter === "all") {
          items.push(
            <LibraryItem
              key="hb"
              title="Happy Birthday!"
              thumbnailUri="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=300&auto=format&fit=crop"
              gradientColors={["#3DA1FF", "#7BFFCC"]}
              locked
              progress={0.3}
            />
          );
        }
        if (filter === "completed" || filter === "all") {
          items.push(
            <LibraryItem
              key="ha"
              title="Happy Anniversary <3"
              thumbnailUri="https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=300&auto=format&fit=crop"
              solidColor="#2E2E2E"
              textColor="#EAEAEA"
              progress={1}
            />
          );
        }
        // Extra items per tab
        if (filter === "recent") {
          items.push(
            <LibraryItem
              key="trip"
              title="Trip to the Mountains"
              thumbnailUri="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=300&auto=format&fit=crop"
              gradientColors={["#4ADEDE", "#5B9DFF"]}
              progress={0.15}
            />
          );
        }
        if (filter === "locked") {
          items.push(
            <LibraryItem
              key="secret"
              title="Secret Project"
              thumbnailUri="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=300&auto=format&fit=crop"
              solidColor="#343A40"
              locked
              progress={0.05}
            />
          );
        }
        if (filter === "completed") {
          items.push(
            <LibraryItem
              key="grad"
              title="Graduation Day"
              thumbnailUri="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=300&auto=format&fit=crop"
              solidColor="#2E2E2E"
              textColor="#EAEAEA"
              progress={1}
            />
          );
        }

        return items.map((node, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 ? <View style={{ height: spacing.lg }} /> : null}
            {node}
          </React.Fragment>
        ));
      })()}

      <View style={{ flex: 1 }} />

      <BottomGradient />
      <LibraryBottomBar active={filter} onChange={setFilter} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 16,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
});


