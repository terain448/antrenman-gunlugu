import { motion } from "framer-motion";
import styles from "./Card.module.css";

export function Card({ children, className = "" }) {
  return (
    <motion.section whileHover={{ y: -3 }} className={`${styles.card} ${className}`}>
      {children}
    </motion.section>
  );
}
