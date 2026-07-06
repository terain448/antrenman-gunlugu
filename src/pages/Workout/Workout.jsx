import { useState } from "react";
import { FiCheckCircle, FiEdit2, FiMinusCircle, FiPlus, FiTrash2, FiTrendingUp } from "react-icons/fi";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Page } from "../../components/ui/Page.jsx";
import { DAILY_STEP_GOAL, DEFAULT_STEP_AMOUNTS } from "../../constants/theme.js";
import { useCoupleData } from "../../context/CoupleDataContext.jsx";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber.js";
import { toDateKey } from "../../utils/date.js";
import styles from "./Workout.module.css";

const initialWorkoutForm = {
  date: toDateKey(),
  name: "",
  sets: 3,
  reps: 12,
};

export function Workout() {
  const { workouts, toggleWorkout, addWorkout, updateWorkout, deleteWorkout, steps, addSteps, decreaseSteps } =
    useCoupleData();
  const [customSteps, setCustomSteps] = useState(1000);
  const [selectedDate, setSelectedDate] = useState(toDateKey());
  const [form, setForm] = useState(initialWorkoutForm);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const todaySteps = (steps ?? {})[toDateKey()] ?? 0;
  const stepProgress = Math.min(Math.round((todaySteps / DAILY_STEP_GOAL) * 100), 100);
  const animatedSteps = useAnimatedNumber(todaySteps);
  const animatedStepProgress = useAnimatedNumber(stepProgress);
  const selectedWorkouts = workouts.filter((workout) => (workout.date ?? toDateKey()) === selectedDate);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    const payload = {
      date: form.date,
      day: new Date(`${form.date}T00:00:00`).toLocaleDateString("tr-TR", { weekday: "long" }),
      name: form.name.trim(),
      sets: Number(form.sets),
      reps: Number(form.reps),
    };

    if (editingWorkoutId) {
      updateWorkout(editingWorkoutId, payload);
      setEditingWorkoutId(null);
    } else {
      addWorkout(payload);
    }

    setSelectedDate(form.date);
    setForm({ ...initialWorkoutForm, date: form.date });
  };

  const startEdit = (workout) => {
    setEditingWorkoutId(workout.id);
    setForm({
      date: workout.date ?? selectedDate,
      name: workout.name,
      sets: workout.sets,
      reps: workout.reps,
    });
  };

  const cancelEdit = () => {
    setEditingWorkoutId(null);
    setForm({ ...initialWorkoutForm, date: selectedDate });
  };

  return (
    <Page eyebrow="Azimli Çalışma" title="Antrenman" description="Haftalık program, set, tekrar ve tamamlanma durumları.">
      <Card className={styles.stepTracker}>
        <div className={styles.stepVisual}>
          <div className={styles.stepRing} style={{ "--progress": `${animatedStepProgress * 3.6}deg` }}>
            <FiTrendingUp />
            <strong>{Math.round(animatedSteps).toLocaleString("tr-TR")}</strong>
            <span>{Math.round(animatedStepProgress)}%</span>
          </div>
          <div>
            <h2>Adım Sayar</h2>
            <p>Günlük hedef {DAILY_STEP_GOAL.toLocaleString("tr-TR")} adım. Su takibi gibi hızlı ekleme ve azaltma yapabilirsin.</p>
          </div>
        </div>

        <div className={styles.stepControls}>
          <div className={styles.stepAmounts}>
            {DEFAULT_STEP_AMOUNTS.map((amount) => (
              <Button key={amount} onClick={() => addSteps(amount)}>
                <FiTrendingUp />
                {amount.toLocaleString("tr-TR")}
              </Button>
            ))}
          </div>
          <label>
            Özel adım
            <input
              min="100"
              step="100"
              type="number"
              value={customSteps}
              onChange={(event) => setCustomSteps(Number(event.target.value))}
            />
          </label>
          <Button variant="secondary" onClick={() => addSteps(customSteps)}>
            Özel Adım Ekle
          </Button>
          <Button className={styles.decreaseButton} variant="ghost" onClick={() => decreaseSteps(500)}>
            <FiMinusCircle />
            500 Azalt
          </Button>
        </div>
      </Card>

      <Card className={styles.manager}>
        <div className={styles.managerHeader}>
          <div>
            <h2>Günlük Antrenman</h2>
            <p>İstediğin gün için antrenman ekle, düzenle veya sil.</p>
          </div>
          <label>
            Gün
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setForm((current) => ({ ...current, date: event.target.value }));
              }}
            />
          </label>
        </div>

        <form className={styles.workoutForm} onSubmit={handleSubmit}>
          <label>
            Tarih
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            />
          </label>
          <label>
            Antrenman
            <input
              placeholder="Örn. Full Body"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label>
            Set
            <input
              min="1"
              type="number"
              value={form.sets}
              onChange={(event) => setForm((current) => ({ ...current, sets: event.target.value }))}
            />
          </label>
          <label>
            Tekrar
            <input
              min="1"
              type="number"
              value={form.reps}
              onChange={(event) => setForm((current) => ({ ...current, reps: event.target.value }))}
            />
          </label>
          <Button type="submit">
            <FiPlus />
            {editingWorkoutId ? "Güncelle" : "Ekle"}
          </Button>
          {editingWorkoutId && (
            <Button variant="ghost" onClick={cancelEdit}>
              Vazgeç
            </Button>
          )}
        </form>
      </Card>

      <section className={styles.grid}>
        {selectedWorkouts.map((workout) => (
          <Card className={styles.workout} key={workout.id}>
            <span>{workout.day}</span>
            <h2>{workout.name}</h2>
            <div className={styles.details}>
              <strong>{workout.sets} set</strong>
              <strong>{workout.reps} tekrar</strong>
            </div>
            <Button variant={workout.completed ? "secondary" : "primary"} onClick={() => toggleWorkout(workout.id)}>
              <FiCheckCircle />
              {workout.completed ? "Tamamlandı" : "Tamamla"}
            </Button>
            <div className={styles.workoutActions}>
              <Button variant="ghost" onClick={() => startEdit(workout)}>
                <FiEdit2 />
                Düzenle
              </Button>
              <Button variant="danger" onClick={() => deleteWorkout(workout.id)}>
                <FiTrash2 />
                Sil
              </Button>
            </div>
          </Card>
        ))}
        {selectedWorkouts.length === 0 && <p className={styles.emptyState}>Bu gün için henüz antrenman yok.</p>}
      </section>
    </Page>
  );
}
