import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAward, FiCheckCircle, FiCloud, FiHeart, FiSend } from "react-icons/fi";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Page } from "../../components/ui/Page.jsx";
import { DAILY_WATER_GOAL_ML } from "../../constants/theme.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCoupleData } from "../../context/CoupleDataContext.jsx";
import { addDays, formatLongDate, toDateKey } from "../../utils/date.js";
import styles from "./Couple.module.css";

const MEMBERS = [
  { id: "admin", name: "Tuna", tone: "violet" },
  { id: "partner", name: "Yağmur", tone: "rose" },
];

function getStreak(tasks, ownerId, currentUserId) {
  let streak = 0;
  let cursor = toDateKey();
  while (true) {
    const dayTasks = tasks.filter((task) => task.date === cursor && (task.ownerId ?? currentUserId) === ownerId);
    if (!dayTasks.length || dayTasks.some((task) => !task.completed)) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function getMemberProgress(member, data, currentUserId) {
  const today = toDateKey();
  const owned = (item) => (item.ownerId ?? currentUserId) === member.id;
  const tasks = data.tasks.filter((task) => task.date === today && owned(task));
  const completed = tasks.filter((task) => task.completed).length;
  const workouts = data.workouts.filter((workout) => workout.date === today && owned(workout));
  const completedWorkouts = workouts.filter((workout) => workout.completed).length;
  const water = data.waterByUser?.[member.id]?.[today] ?? (member.id === currentUserId ? data.water[today] ?? 0 : 0);
  const taskProgress = tasks.length ? completed / tasks.length : 0;
  const workoutProgress = workouts.length ? completedWorkouts / workouts.length : 0;
  const waterProgress = Math.min(water / DAILY_WATER_GOAL_ML, 1);
  const parts = [taskProgress, waterProgress];
  if (workouts.length) parts.push(workoutProgress);
  const progress = Math.round((parts.reduce((sum, value) => sum + value, 0) / parts.length) * 100);
  return { ...member, completed, remaining: Math.max(tasks.length - completed, 0), water, waterProgress: Math.round(waterProgress * 100), progress, streak: getStreak(data.tasks, member.id, currentUserId) };
}

function Celebration({ open, name }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className={styles.celebration} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
          <div className={styles.confetti} aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ "--i": index }} />)}</div>
          <FiAward /> <strong>{name}, bugün harikasın!</strong>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Couple() {
  const { user } = useAuth();
  const { tasks, workouts, water, notes, addDailyNote, isCloudEnabled, syncError, syncStatus } = useCoupleData();
  const [selectedDate, setSelectedDate] = useState(toDateKey());
  const [draft, setDraft] = useState("");
  const data = { tasks, workouts, water };
  const members = useMemo(() => MEMBERS.map((member) => getMemberProgress(member, data, user?.id)), [data, user?.id]);
  const leader = members[0].progress === members[1].progress ? null : members.reduce((best, member) => member.progress > best.progress ? member : best);
  const selectedNotes = notes.filter((note) => note.note_date === selectedDate);
  const ownNote = selectedNotes.find((note) => note.author_id === user?.id);
  const celebrating = members.find((member) => member.id === user?.id && member.progress === 100);

  const submitNote = (event) => {
    event.preventDefault();
    addDailyNote(draft || ownNote?.body || "");
    setDraft("");
  };

  return (
    <Page eyebrow="Ortak alan" title="Birlikte" description="Bugünün ritmini, hedeflerini ve küçük notlarını aynı yerde tutun.">
      <Celebration open={Boolean(celebrating)} name={celebrating?.name} />
      <section className={styles.status}>
        <FiHeart />
        <span>{leader ? `${leader.name} bugün hedeflerde önde.` : "Bugün aynı ritimdesiniz."}</span>
        <small className={syncStatus === "error" ? styles.error : ""}><FiCloud /> {isCloudEnabled ? (syncStatus === "synced" ? "Canlı senkronize" : syncStatus === "error" ? "Senkronizasyon hatası" : "Bağlanıyor…") : "Yerel mod"}</small>
      </section>
      {syncError && <p className={styles.syncError}>{syncError}</p>}

      <section className={styles.memberGrid}>
        {members.map((member, index) => (
          <motion.article key={member.id} className={`${styles.memberCard} ${styles[member.tone]}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
            <div className={styles.memberTop}><span className={styles.avatar}>{member.name.slice(0, 1)}</span><div><h2>{member.name}</h2><p>{leader?.id === member.id ? "Bugünün lideri ✨" : "Kendi ritminde ilerliyor"}</p></div><strong className={styles.percent}>{member.progress}%</strong></div>
            <div className={styles.progressTrack}><span style={{ width: `${member.progress}%` }} /></div>
            <div className={styles.statGrid}>
              <span><FiCheckCircle /> <b>{member.completed}</b> tamamlandı</span>
              <span><b>{member.remaining}</b> kaldı</span>
              <span>💧 <b>{member.water.toLocaleString("tr-TR")}</b> ml</span>
              <span>🔥 <b>{member.streak}</b> gün seri</span>
            </div>
            <small className={styles.waterLine}>Su hedefi: %{member.waterProgress}</small>
          </motion.article>
        ))}
      </section>

      <Card className={styles.notesCard}>
        <div className={styles.notesHeader}><div><span>Paylaşılan alan</span><h2>Bugünün Notları</h2></div><label><span>Tarih</span><input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></label></div>
        <AnimatePresence initial={false}>
          <div className={styles.notesList}>
            {selectedNotes.length ? selectedNotes.map((note) => <motion.article key={note.id ?? `${note.author_id}-${note.note_date}`} className={styles.note} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><span className={styles.noteAvatar}>{note.author_name.slice(0, 1)}</span><div><strong>{note.author_name}</strong><p>{note.body}</p><small>{new Date(note.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</small></div></motion.article>) : <p className={styles.empty}>Bu gün için henüz bir not yok. İlk güzel mesajı sen bırak.</p>}
          </div>
        </AnimatePresence>
        {selectedDate === toDateKey() && <form className={styles.noteForm} onSubmit={submitNote}><input maxLength="180" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={ownNote ? "Bugünkü notunu güncelle…" : "❤️ Bugüne küçük bir not bırak…"} /><Button type="submit"><FiSend /> {ownNote ? "Güncelle" : "Gönder"}</Button></form>}
        {selectedDate !== toDateKey() && <p className={styles.historyHint}>{formatLongDate(selectedDate)} tarihindeki notları görüntülüyorsun.</p>}
      </Card>
    </Page>
  );
}
