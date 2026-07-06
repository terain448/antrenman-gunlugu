import { motion } from "framer-motion";
import styles from "./Button.module.css";

export function Button({ children, className = "", variant = "primary", type = "button", ...props }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`${styles.button} ${styles[variant]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </motion.button>
  );
}
