import { NavLink } from "react-router-dom";
import { NAVIGATION_ITEMS } from "../../constants/navigation.js";
import styles from "./BottomNavigation.module.css";

export function BottomNavigation() {
  return (
    <nav className={styles.bottomNav}>
      <div className={styles.scroller}>
      {NAVIGATION_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
          aria-label={item.label}
        >
          <item.icon />
          <span>{item.label}</span>
        </NavLink>
      ))}
      </div>
    </nav>
  );
}
