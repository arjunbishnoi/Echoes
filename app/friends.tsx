import React from "react";
import { View, Text, StyleSheet, Pressable, Image, SectionList, Platform, RefreshControl } from "react-native";
import { colors, spacing, sizes } from "../theme/theme";

type Friend = { id: string; name: string; avatar: string };

export default function FriendsScreen() {
  const [requests] = React.useState<Friend[]>([
    { id: "r1", name: "Ananya", avatar: "https://i.pravatar.cc/100?img=12" },
    { id: "r2", name: "Kabir", avatar: "https://i.pravatar.cc/100?img=15" },
  ]);
  const [friends, setFriends] = React.useState<Friend[]>([
    { id: "f1", name: "Arjun Bishnoi", avatar: "https://i.pravatar.cc/100?img=1" },
    { id: "f2", name: "Honey Singh", avatar: "https://i.pravatar.cc/100?img=48" },
    { id: "f3", name: "Neha", avatar: "https://i.pravatar.cc/100?img=32" },
  ]);

  const removeFriend = (id: string) => {
    setFriends(cur => cur.filter(f => f.id !== id));
  };

  const sections = React.useMemo(() => {
    const data: Array<{ title: string; data: Friend[]; key: string; type: "requests" | "friends" }> = [];
    if (requests.length > 0) data.push({ title: "Requests", data: requests, key: "requests", type: "requests" });
    data.push({ title: "Friends", data: friends, key: "friends", type: "friends" });
    return data;
  }, [requests, friends]);

  const renderItem = ({ item, section }: { item: Friend; section: { type: "requests" | "friends" } }) => (
    <View style={styles.row}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <Text style={styles.name}>{item.name}</Text>
      <View style={{ flex: 1 }} />
      {section.type === "requests" ? (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            accessibilityRole="button"
            android_ripple={Platform.OS === "android" ? { color: "rgba(255,255,255,0.15)", borderless: true } : undefined}
            style={styles.acceptBtn}
          >
            <Text style={styles.acceptText}>Accept</Text>
          </Pressable>
          <View style={{ width: spacing.sm }} />
          <Pressable
            accessibilityRole="button"
            android_ripple={Platform.OS === "android" ? { color: "rgba(255,255,255,0.15)", borderless: true } : undefined}
            style={styles.declineBtn}
          >
            <Text style={styles.declineText}>Decline</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => removeFriend(item.id)}
          accessibilityRole="button"
          android_ripple={Platform.OS === "android" ? { color: "rgba(0,0,0,0.08)", borderless: true } : undefined}
          style={styles.removeBtn}
        >
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      )}
    </View>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{section.title}</Text></View>
  );

  const ItemSeparator = () => <View style={styles.separator} />;

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={ItemSeparator}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: sizes.list.bottomPadding }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textPrimary} />}
        showsVerticalScrollIndicator
        indicatorStyle="white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  sectionHeader: { backgroundColor: colors.black, paddingVertical: spacing.sm },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: spacing.md },
  name: { color: colors.textPrimary, fontSize: 16, fontWeight: "600" },
  acceptBtn: { backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  acceptText: { color: colors.black, fontWeight: "700" },
  declineBtn: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  declineText: { color: colors.white, fontWeight: "700" },
  removeBtn: { backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  removeText: { color: colors.black, fontWeight: "700" },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: "#2B2B2B" },
});



