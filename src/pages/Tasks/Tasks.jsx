import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Page } from "../../components/ui/Page.jsx";
import { ProgressCircle } from "../../components/ui/ProgressCircle.jsx";
import { useCoupleData } from "../../context/CoupleDataContext.jsx";
import { addDays, formatLongDate, toDateKey } from "../../utils/date.js";
import styles from "./Tasks.module.css";

export function Tasks() {
  const { tasks, addTask, updateTask, deleteTask } = useCoupleData();
  const [selectedDate, setSelectedDate] = useState(() => toDateKey());
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState("");
  const selectedTasks = useMemo(
    () => tasks.filter((task) => task.date === selectedDate),
    [selectedDate, tasks],
  );
  const completedCount = selectedTasks.filter((task) => task.completed).length;
  const progress = selectedTasks.length ? Math.round((completedCount / selectedTasks.length) * 100) : 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;

    if (editingId) {
      updateTask(editingId, { title });
      setEditingId("");
    } else {
      addTask(title, selectedDate);
    }

    setDraft("");
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setDraft(task.title);
  };

  return (
    <Page eyebrow="Günlük Akış" title="Günlük Görevler" description="Günler arasında gez, o güne özel görevleri planla.">
      <div className={styles.dateNavigator}>
        <Button
          variant="ghost"
          onClick={() => setSelectedDate((currentDate) => addDays(currentDate, -1))}
          aria-label="Önceki gün"
        >
          <FiChevronLeft />
        </Button>
        <strong>{formatLongDate(selectedDate)}</strong>
        <Button
          variant="ghost"
          onClick={() => setSelectedDate((currentDate) => addDays(currentDate, 1))}
          aria-label="Sonraki gün"
        >
          <FiChevronRight />
        </Button>
      </div>

      <section className={styles.layout}>
        <Card className={styles.progressCard}>
          <ProgressCircle value={progress} label="tamamlandı" />
          <p>
            {completedCount} / {selectedTasks.length} görev tamamlandı
          </p>
        </Card>

        <Card className={styles.manager}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Yeni görev ekle..."
            />
            <Button type="submit">
              <FiPlus />
              {editingId ? "Güncelle" : "Ekle"}
            </Button>
          </form>

          <div className={styles.list}>
            {selectedTasks.length === 0 && (
              <p className={styles.emptyState}>Bu gün için henüz görev yok. Küçük bir plan ekleyelim.</p>
            )}

            {selectedTasks.map((task) => (
              <article className={styles.task} key={task.id}>
                <label>
                  <input
                    checked={task.completed}
                    onChange={() => updateTask(task.id, { completed: !task.completed })}
                    type="checkbox"
                  />
                  <span className={task.completed ? styles.done : ""}>{task.title}</span>
                </label>
                <div className={styles.actions}>
                  <Button variant="ghost" onClick={() => startEditing(task)} aria-label="Görevi düzenle">
                    <FiEdit2 />
                  </Button>
                  <Button variant="danger" onClick={() => deleteTask(task.id)} aria-label="Görevi sil">
                    <FiTrash2 />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>
    </Page>
  );
}
