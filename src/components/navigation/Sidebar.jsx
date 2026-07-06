import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { NAVIGATION_ITEMS } from "../../constants/navigation.js";
import styles from "./Sidebar.module.css";

export function Sidebar() {
  return (
    <motion.aside className={styles.sidebar} initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
      <div className={styles.brand}>
        <strong>Antrenman Günlüğü</strong>
      </div>
      <nav className={styles.nav}>
        {NAVIGATION_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
            title={item.label}
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <span className={styles.version}>Beta Version</span>
    </motion.aside>
  );
}
