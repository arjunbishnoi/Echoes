import { useAuth } from "@/utils/authContext";
import Avatar from "./Avatar";
import type { ImageStyle } from "react-native";

interface UserAvatarProps {
  size?: number;
  style?: ImageStyle;
  borderWidth?: number;
  borderColor?: string;
  userId?: string; // Optional: to show another user's avatar
}

export default function UserAvatar({
  size,
  style,
  borderWidth,
  borderColor,
  userId,
}: UserAvatarProps) {
  const { user } = useAuth();
  
  // If userId is provided, we'd need to fetch that user's data
  // For now, we'll just use the current user
  const targetUser = user;
  
  return (
    <Avatar
      uri={targetUser?.photoURL}
      userId={targetUser?.id}
      size={size}
      style={style}
      borderWidth={borderWidth}
      borderColor={borderColor}
    />
  );
}
