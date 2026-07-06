import { FiBarChart2, FiCalendar, FiDroplet, FiHome, FiUser } from "react-icons/fi";
import { BiTask } from "react-icons/bi";
import { MdFitnessCenter } from "react-icons/md";

export const NAVIGATION_ITEMS = [
  { label: "Ana Sayfa", path: "/", icon: FiHome },
  { label: "Görevler", path: "/tasks", icon: BiTask },
  { label: "Takvim", path: "/calendar", icon: FiCalendar },
  { label: "İstatistik", path: "/statistics", icon: FiBarChart2 },
  { label: "Antrenman", path: "/workout", icon: MdFitnessCenter },
  { label: "Su Takibi", path: "/water", icon: FiDroplet },
  { label: "Profil", path: "/profile", icon: FiUser },
];
