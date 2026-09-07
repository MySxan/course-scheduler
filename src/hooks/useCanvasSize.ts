import { useEffect, useRef, useState } from "react";

/** Shared available width, independent of which top-level tab is open. */
export function useCanvasSize() {
  const ref = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ availableWidth: 800, rootFontSize: 16 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const css = getComputedStyle(element);
      const availableWidth =
        element.clientWidth -
        parseFloat(css.paddingLeft) -
        parseFloat(css.paddingRight);
      const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      setSize((previous) =>
        previous.availableWidth === availableWidth &&
        previous.rootFontSize === rootFontSize
          ? previous
          : { availableWidth, rootFontSize },
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    observer.observe(document.documentElement);
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  return { ref, ...size };
}
