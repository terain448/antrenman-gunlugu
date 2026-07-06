import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppLayout } from "./layouts/AppLayout.jsx";
import { ProtectedRoute } from "./router/ProtectedRoute.jsx";
import { Login } from "./pages/Login/Login.jsx";
import { Home } from "./pages/Home/Home.jsx";
import { Tasks } from "./pages/Tasks/Tasks.jsx";
import { Calendar } from "./pages/Calendar/Calendar.jsx";
import { Statistics } from "./pages/Statistics/Statistics.jsx";
import { Workout } from "./pages/Workout/Workout.jsx";
import { WaterTracker } from "./pages/WaterTracker/WaterTracker.jsx";
import { Profile } from "./pages/Profile/Profile.jsx";

export function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="workout" element={<Workout />} />
            <Route path="water" element={<WaterTracker />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
