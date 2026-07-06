import { Link } from "react-router-dom";
import { FiCheckCircle, FiDroplet, FiTrendingUp } from "react-icons/fi";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card } from "../../components/ui/Card.jsx";
import { Page } from "../../components/ui/Page.jsx";
import { ProgressCircle } from "../../components/ui/ProgressCircle.jsx";
import { DAILY_WATER_GOAL_ML } from "../../constants/theme.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCoupleData } from "../../context/CoupleDataContext.jsx";
import { toDateKey } from "../../utils/date.js";
import styles from "./Home.module.css";

export function Home() {
  const { user } = useAuth();
  const { tasks, water, statistics } = useCoupleData();
  const today = toDateKey();
  const todayTasks = tasks.filter((task) => task.date === today);
  const completedTasks = todayTasks.filter((task) => task.completed).length;
  const waterProgress = Math.round(((water[today] ?? 0) / DAILY_WATER_GOAL_ML) * 100);

  return (
    <Page
      eyebrow={`Hoş geldin, ${user?.name}`}
      title="Bugünün ritmini birlikte tutalım."
      description="Küçük alışkanlıklar, tatlı planlar ve sağlıklı hedefler için özel kontrol merkezi."
    >
      <section className={styles.metrics}>
        <Link className={styles.metricLink} to="/tasks" aria-label="Görevler sayfasına git">
          <Card>
            <FiCheckCircle className={styles.icon} />
            <span>Bugünkü görevler</span>
            <strong>
              {completedTasks}/{todayTasks.length}
            </strong>
          </Card>
        </Link>
        <Link className={styles.metricLink} to="/water" aria-label="Su takibi sayfasına git">
          <Card>
            <FiDroplet className={styles.icon} />
            <span>Su hedefi</span>
            <strong>{waterProgress}%</strong>
          </Card>
        </Link>
        <Link className={styles.metricLink} to="/statistics" aria-label="İstatistik sayfasına git">
          <Card>
            <FiTrendingUp className={styles.icon} />
            <span>Haftalık tempo</span>
            <strong>Premium</strong>
          </Card>
        </Link>
      </section>

      <section className={styles.grid}>
        <Link className={styles.cardLink} to="/tasks">
          <Card className={styles.tasks}>
            <h2>Bugünkü Görevler</h2>
            {todayTasks.map((task) => (
              <div className={styles.task} key={task.id}>
                <span className={task.completed ? styles.done : ""}>{task.title}</span>
                <small>{task.completed ? "Tamamlandı" : "Bekliyor"}</small>
              </div>
            ))}
          </Card>
        </Link>

        <Link className={styles.cardLink} to="/water">
          <Card className={styles.centerCard}>
            <h2>Su Özeti</h2>
            <ProgressCircle value={waterProgress} label={`${water[today] ?? 0} ml`} />
          </Card>
        </Link>

        <Link className={`${styles.cardLink} ${styles.chartLink}`} to="/statistics">
          <Card className={styles.chartCard}>
            <h2>Haftalık İlerleme</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statistics}>
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "var(--primary-soft-glow)" }} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                <Bar dataKey="tasks" fill="var(--color-primary-soft)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Link>
      </section>
    </Page>
  );
}
