import { useDrawerProgress } from "react-native-drawer-layout";
import { useRightDrawerProgress } from "../components/RightDrawerProgress";

export default function useDrawerPair() {
  const left = useDrawerProgress();
  let right: any;
  try { right = useRightDrawerProgress(); } catch {}
  return { left, right } as const;
}


