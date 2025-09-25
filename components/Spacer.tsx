import React from "react";
import { View } from "react-native";

export default function Spacer({ size = 8 }: { size?: number }) {
  return <View style={{ height: size, width: 1, opacity: 0 }} />;
}





