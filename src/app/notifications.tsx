import NotificationsBottomBar from "@/components/NotificationsBottomBar";
import NotificationsList from "@/components/drawer/NotificationsList";
import { colors, sizes, spacing } from "@/theme/theme";
import type { NotifKey } from "@/types/notifications";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function NotificationsScreen() {
  const [active, setActive] = useState<NotifKey>("all");
  const type = useMemo<"personal" | "social" | "all">(() => {
    if (active === "friendRequests") return "social";
    if (active === "regular") return "personal";
    return "all";
  }, [active]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ height: spacing.xl }} />
        <NotificationsList type={type} />
        <View style={{ height: sizes.floatingBar.bottomOffset + sizes.floatingBar.height + 24 }} />
      </ScrollView>
      <NotificationsBottomBar active={active} onChange={setActive} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    paddingBottom: 24,
  },
});
