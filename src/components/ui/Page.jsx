import { motion } from "framer-motion";
import styles from "./Page.module.css";

export function Page({ eyebrow, title, description, actions, children }) {
  return (
    <motion.main
      className={styles.page}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.24 }}
    >
      <header className={styles.header}>
        <div>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      {children}
    </motion.main>
  );
}
