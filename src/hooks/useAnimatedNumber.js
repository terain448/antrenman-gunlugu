import { useEffect, useRef, useState } from "react";

export function useAnimatedNumber(value, duration = 700) {
  const [displayValue, setDisplayValue] = useState(value);
  const currentValueRef = useRef(value);

  useEffect(() => {
    const startValue = currentValueRef.current;
    const targetValue = value;
    const startedAt = performance.now();
    let frameId;

    const animate = (timestamp) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      const nextValue = startValue + (targetValue - startValue) * easedProgress;

      currentValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      currentValueRef.current = targetValue;
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [duration, value]);

  return displayValue;
}
