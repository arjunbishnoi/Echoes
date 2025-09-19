import React from "react";
import { View } from "react-native";
import { sizes } from "../theme/theme";

export default function ListSeparator() {
  return <View style={{ height: sizes.list.itemSpacing }} />;
}


