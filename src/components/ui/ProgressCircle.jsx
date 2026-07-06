import { useAnimatedNumber } from "../../hooks/useAnimatedNumber.js";
import styles from "./ProgressCircle.module.css";

export function ProgressCircle({ value, label, size = 116 }) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const displayValue = useAnimatedNumber(normalizedValue);

  return (
    <div
      className={styles.circle}
      style={{
        "--progress": `${displayValue * 3.6}deg`,
        width: size,
        height: size,
      }}
    >
      <strong>{Math.round(displayValue)}%</strong>
      {label && <span>{label}</span>}
    </div>
  );
}
