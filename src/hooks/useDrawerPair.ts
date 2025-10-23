import { useDrawerProgress } from "react-native-drawer-layout";
import { useRightDrawerProgress } from "../components/RightDrawerProgress";

export default function useDrawerPair() {
  const left = useDrawerProgress();
  const right = useRightDrawerProgress();
  return { left, right } as const;
}




