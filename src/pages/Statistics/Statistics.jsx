import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../../components/ui/Card.jsx";
import { Page } from "../../components/ui/Page.jsx";
import { DAILY_STEP_GOAL, DAILY_WATER_GOAL_ML } from "../../constants/theme.js";
import { useCoupleData } from "../../context/CoupleDataContext.jsx";
import { toDateKey } from "../../utils/date.js";
import styles from "./Statistics.module.css";

const tooltipStyle = {
  background: "var(--color-background-deep)",
  border: "1px solid var(--color-border)",
  borderRadius: "12px",
  color: "var(--color-text)",
};

export function Statistics() {
  const { statistics, monthlyStatistics, tasks, workouts, water, steps } = useCoupleData();
  const completedTasks = tasks.filter((task) => task.completed).length;
  const completedWorkouts = workouts.filter((workout) => workout.completed).length;
  const todayKey = toDateKey();
  const todayWater = water[todayKey] ?? 0;
  const todaySteps = (steps ?? {})[todayKey] ?? 0;
  const waterProgress = Math.min(Math.round((todayWater / DAILY_WATER_GOAL_ML) * 100), 100);
  const stepProgress = Math.min(Math.round((todaySteps / DAILY_STEP_GOAL) * 100), 100);
  const workoutProgress = workouts.length ? Math.round((completedWorkouts / workouts.length) * 100) : 0;

  return (
    <Page eyebrow="Analizler" title="İstatistikler" description="Haftalık görev, su, adım ve workout performansının net özeti.">
      <section className={styles.summary}>
        <Card className={`${styles.metricCard} ${styles.pinkCard}`}>
          <span>Tamamlanan görev</span>
          <strong>{completedTasks}</strong>
          <small>Bugünün ritmi</small>
        </Card>
        <Card className={`${styles.metricCard} ${styles.cyanCard}`}>
          <span>Adım hedefi</span>
          <strong>{stepProgress}%</strong>
          <small>
            {todaySteps.toLocaleString("tr-TR")} / {DAILY_STEP_GOAL.toLocaleString("tr-TR")}
          </small>
        </Card>
        <Card className={`${styles.metricCard} ${styles.blueCard}`}>
          <span>Workout</span>
          <strong>{completedWorkouts}</strong>
          <small>{workouts.length} program içinden</small>
        </Card>
        <Card className={`${styles.metricCard} ${styles.purpleCard}`}>
          <span>Su hedefi</span>
          <strong>{waterProgress}%</strong>
          <small>{todayWater.toLocaleString("tr-TR")} ml</small>
        </Card>
      </section>

      <section className={styles.dashboard}>
        <Card className={styles.mainChart}>
          <div className={styles.chartHeader}>
            <div>
              <span>Haftalık Aktivite</span>
              <h2>Görev, su ve adım dengesi</h2>
            </div>
            <div className={styles.legend}>
              <span>
                <i className={styles.taskDot} />
                Görev
              </span>
              <span>
                <i className={styles.waterDot} />
                Su
              </span>
              <span>
                <i className={styles.stepDot} />
                Adım
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={statistics}>
              <defs>
                <linearGradient id="taskGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent-warm)" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="var(--color-accent-warm)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="stepGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="steps" name="Adım x100" stroke="var(--color-accent)" fill="url(#stepGlow)" strokeWidth={3} />
              <Area type="monotone" dataKey="tasks" name="Görev" stroke="var(--color-accent-warm)" fill="url(#taskGlow)" strokeWidth={3} />
              <Line type="monotone" dataKey="water" name="Su x100ml" stroke="var(--color-primary-light)" strokeWidth={3} dot={{ fill: "var(--color-primary-light)", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <div className={styles.sideStack}>
          <Card className={styles.miniChart}>
            <h2>Adım Sayar</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={statistics}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="steps" name="Adım x100" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className={styles.miniChart}>
            <h2>Su Tüketimi</h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={statistics}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="water" name="Su x100ml" stroke="var(--color-primary-light)" strokeWidth={3} dot={{ fill: "var(--color-primary-light)" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </section>

      <section className={styles.bottomCharts}>
        <Card className={styles.miniChart}>
          <h2>Görevler</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statistics}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="tasks" name="Görev" fill="var(--color-accent-warm)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className={styles.progressPanel}>
          <h2>Bugünkü Hedefler</h2>
          <div className={styles.progressRow}>
            <span>Adım</span>
            <strong>{stepProgress}%</strong>
            <div>
              <i style={{ width: `${stepProgress}%` }} />
            </div>
          </div>
          <div className={styles.progressRow}>
            <span>Su</span>
            <strong>{waterProgress}%</strong>
            <div>
              <i style={{ width: `${waterProgress}%` }} />
            </div>
          </div>
          <div className={styles.progressRow}>
            <span>Workout</span>
            <strong>
              {completedWorkouts}/{workouts.length}
            </strong>
            <div>
              <i style={{ width: `${workoutProgress}%` }} />
            </div>
          </div>
        </Card>
      </section>

      <Card className={styles.monthlyChart}>
        <div className={styles.chartHeader}>
          <div>
            <span>Aylık Görünüm</span>
            <h2>Bu ayın hafta hafta toplamı</h2>
          </div>
          <div className={styles.legend}>
            <span>
              <i className={styles.taskDot} />
              Görev
            </span>
            <span>
              <i className={styles.waterDot} />
              Su
            </span>
            <span>
              <i className={styles.stepDot} />
              Adım
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyStatistics}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="tasks" name="Görev" fill="var(--color-accent-warm)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="water" name="Su x100ml" fill="var(--color-primary-light)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="steps" name="Adım x100" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Page>
  );
}
