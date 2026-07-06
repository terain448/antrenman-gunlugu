import { Outlet } from "react-router-dom";
import { BottomNavigation } from "../components/navigation/BottomNavigation.jsx";
import { Sidebar } from "../components/navigation/Sidebar.jsx";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>
        <Outlet />
      </div>
      <BottomNavigation />
    </div>
  );
}
