import { useEffect, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

export function useHeaderTitle(insetTop: number) {
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);
  const titleTopRef = useRef(0);
  const titleHeightRef = useRef(0);

  const handleTitleLayout = (event: LayoutChangeEvent) => {
    titleTopRef.current = event.nativeEvent.layout.y;
    titleHeightRef.current = event.nativeEvent.layout.height;
  };

  const handleScroll = (scrollY: number) => {
    const extraOffset = insetTop + 24;
    const threshold = Math.max(0, titleTopRef.current + titleHeightRef.current + extraOffset);
    
    if (scrollY >= threshold && !showHeaderTitle) {
      setShowHeaderTitle(true);
    }
    if (scrollY < threshold && showHeaderTitle) {
      setShowHeaderTitle(false);
    }
  };

  return {
    showHeaderTitle,
    handleTitleLayout,
    handleScroll,
  };
}


