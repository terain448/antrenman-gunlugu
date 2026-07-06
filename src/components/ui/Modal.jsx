import { motion } from "framer-motion";
import { Button } from "./Button.jsx";
import styles from "./Modal.module.css";

export function Modal({ title, children, onClose }) {
  return (
    <motion.div className={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.94, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 24 }}
      >
        <header>
          <h2>{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            Kapat
          </Button>
        </header>
        {children}
      </motion.div>
    </motion.div>
  );
}
