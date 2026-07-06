import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Page } from "../../components/ui/Page.jsx";
import { useCoupleData } from "../../context/CoupleDataContext.jsx";
import { addMonths, formatDisplayDate, formatMonthYear, getMonthDays, toDateKey } from "../../utils/date.js";
import styles from "./Calendar.module.css";

export function Calendar() {
  const { events, addEvent, updateEvent, deleteEvent } = useCoupleData();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [form, setForm] = useState({ title: "", date: toDateKey(), note: "" });
  const [editingId, setEditingId] = useState("");
  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;

    if (editingId) {
      updateEvent(editingId, form);
      setEditingId("");
    } else {
      addEvent(form);
    }

    setForm({ title: "", date: toDateKey(), note: "" });
  };

  const startEditing = (event) => {
    setEditingId(event.id);
    setForm({ title: event.title, date: event.date, note: event.note });
  };

  return (
    <Page eyebrow="Planlar" title="Takvim" description="Özel günler, buluşmalar ve mini planlar ay görünümünde.">
      <section className={styles.layout}>
        <div className={styles.monthNavigator}>
          <Button
            variant="ghost"
            onClick={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, -1))}
            aria-label="Önceki ay"
          >
            <FiChevronLeft />
          </Button>
          <strong>{formatMonthYear(visibleMonth)}</strong>
          <Button
            variant="ghost"
            onClick={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, 1))}
            aria-label="Sonraki ay"
          >
            <FiChevronRight />
          </Button>
        </div>

        <Card>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Etkinlik adı"
            />
            <input
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              type="date"
            />
            <textarea
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              placeholder="Kısa not"
            />
            <Button type="submit">
              <FiPlus />
              {editingId ? "Etkinliği Güncelle" : "Etkinlik Ekle"}
            </Button>
          </form>
        </Card>

        <div className={styles.calendarGrid}>
          {monthDays.map((day) => {
            const dayEvents = events.filter((event) => event.date === day);
            return (
              <Card className={styles.dayCard} key={day}>
                <strong>{formatDisplayDate(day)}</strong>
                {dayEvents.map((event) => (
                  <article className={styles.event} key={event.id}>
                    <span>{event.title}</span>
                    {event.note && <small>{event.note}</small>}
                    <div>
                      <button onClick={() => startEditing(event)} aria-label="Etkinliği düzenle">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => deleteEvent(event.id)} aria-label="Etkinliği sil">
                        <FiTrash2 />
                      </button>
                    </div>
                  </article>
                ))}
              </Card>
            );
          })}
        </div>
      </section>
    </Page>
  );
}
