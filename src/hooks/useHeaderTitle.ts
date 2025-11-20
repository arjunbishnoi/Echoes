import { useRef, useState, useEffect } from "react";
import type { LayoutChangeEvent, View } from "react-native";

export function useHeaderTitle(insetTop: number) {
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);
  const titleContainerRef = useRef<View>(null);
  const titleBaselineWindowYRef = useRef<number | null>(null);
  const titleHeightRef = useRef(0);
  const hasMeasuredRef = useRef(false);

  const measureBaseline = () => {
    // Measure the title container's window position when at scroll 0
    // This gives us the absolute position from the top of the window
    titleContainerRef.current?.measureInWindow((x, y, width, height) => {
      if (!hasMeasuredRef.current) {
        titleBaselineWindowYRef.current = y;
        hasMeasuredRef.current = true;
      }
    });
  };

  const handleTitleContainerLayout = (event: LayoutChangeEvent) => {
    // Measure baseline position after layout
    setTimeout(measureBaseline, 100);
  };

  const handleTitleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    titleHeightRef.current = height;
    // Re-measure baseline after title height is known
    setTimeout(measureBaseline, 100);
  };

  // Measure baseline on mount
  useEffect(() => {
    setTimeout(measureBaseline, 200);
  }, []);

  const handleScroll = (scrollY: number) => {
    // Measure baseline when scroll is at or near 0 (first render)
    if (scrollY < 10 && !hasMeasuredRef.current && titleContainerRef.current) {
      measureBaseline();
    }
    
    // Wait until we have the baseline measured
    if (titleBaselineWindowYRef.current === null || titleHeightRef.current === 0) {
      return;
    }
    
    // Calculate the title's current window Y position
    // When we scroll down, the title moves up in the window
    // baselineWindowY - scrollY = current window Y
    const titleTopWindowY = (titleBaselineWindowYRef.current || 0) - scrollY;
    const titleBottomWindowY = titleTopWindowY + titleHeightRef.current;
    
    // The header appears at insetTop from the top of the window
    // We want to show the header only after the title's bottom has passed the header position
    // Add a buffer to ensure smooth transition and avoid dual titles
    const buffer = 20;
    const headerPosition = insetTop;
    const threshold = titleBottomWindowY - headerPosition + buffer;
    
    if (threshold <= 0 && !showHeaderTitle) {
      setShowHeaderTitle(true);
    }
    if (threshold > 0 && showHeaderTitle) {
      setShowHeaderTitle(false);
    }
  };

  return {
    showHeaderTitle,
    handleTitleLayout,
    handleTitleContainerLayout,
    handleScroll,
    titleContainerRef,
  };
}


