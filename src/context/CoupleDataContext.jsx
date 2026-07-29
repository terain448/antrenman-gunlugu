import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DAILY_STEP_GOAL, DAILY_WATER_GOAL_ML } from "../constants/theme.js";
import { useAuth } from "./AuthContext.jsx";
import { isSupabaseConfigured } from "../services/supabaseClient.js";
import { loadCoupleState, loadNotes, saveCoupleState, saveNote, subscribeToCoupleChanges } from "../services/coupleSync.js";
import { getCurrentMonthWeeks, getWeekDays, toDateKey } from "../utils/date.js";
import { readStorage, writeStorage } from "../utils/storage.js";

const DATA_STORAGE_KEY = "couple_private_data_v2";

const defaultData = {
  tasks: [],
  events: [],
  water: {},
  waterByUser: {},
  steps: {},
  stepsByUser: {},
  workouts: [],
  profiles: {},
  preferences: {},
};

function normalizeData(value) {
  return { ...defaultData, ...(value ?? {}) };
}

function hasData(value) {
  return value.tasks.length > 0 || value.events.length > 0 || value.workouts.length > 0
    || Object.keys(value.water).length > 0 || Object.keys(value.steps).length > 0
    || Object.keys(value.waterByUser ?? {}).length > 0 || Object.keys(value.stepsByUser ?? {}).length > 0
    || Object.keys(value.profiles ?? {}).length > 0 || Object.keys(value.preferences ?? {}).length > 0;
}

const CoupleDataContext = createContext(null);

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function CoupleDataProvider({ children }) {
  const { user } = useAuth();
  // Cache is used only as an offline/initial rendering cache. A successful
  // Supabase read always replaces it, making the cloud the source of truth.
  const [data, setData] = useState(() => normalizeData(readStorage(DATA_STORAGE_KEY, defaultData)));
  const [notes, setNotes] = useState([]);
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? "loading" : "local");
  const [syncError, setSyncError] = useState("");
  const pendingPatches = useRef({});
  const flushTimer = useRef(null);
  const isLoaded = useRef(false);

  const flushPatches = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const patch = pendingPatches.current;
    pendingPatches.current = {};
    if (Object.keys(patch).length === 0) return;
    setSyncStatus("syncing");
    saveCoupleState(patch)
      .then(() => setSyncStatus("synced"))
      .catch((error) => {
        // Keep unsent changes in the cache and retry them with the next action.
        pendingPatches.current = { ...patch, ...pendingPatches.current };
        setSyncStatus("error");
        setSyncError(error.message || "Veriler eşitlenemedi.");
      });
  }, []);

  const persistData = useCallback((patch) => {
    if (Object.keys(patch).length === 0) return;
    if (!isSupabaseConfigured) {
      console.error("Supabase write skipped: Supabase is not configured.", { domains: Object.keys(patch) });
      setSyncStatus("error");
      setSyncError("Supabase yapılandırması eksik.");
      return;
    }
    pendingPatches.current = { ...pendingPatches.current, ...patch };
    if (!isLoaded.current) {
      console.info("State change queued until the initial Supabase load finishes.", { domains: Object.keys(patch) });
      return;
    }
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => {
      flushTimer.current = null;
      flushPatches();
    }, 180);
  }, [flushPatches]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return undefined;
    let active = true;
    let receivedRealtimeState = false;
    isLoaded.current = false;

    Promise.all([loadCoupleState(), loadNotes()])
      .then(([remoteData, remoteNotes]) => {
        if (!active) return;
        if (remoteData && !receivedRealtimeState) {
          const nextData = normalizeData(remoteData);
          setData(nextData);
          writeStorage(DATA_STORAGE_KEY, nextData);
        } else {
          // One-time migration of pre-Supabase data. Once a cloud record
          // exists, it always wins over this cache on subsequent sessions.
          const cachedData = normalizeData(readStorage(DATA_STORAGE_KEY, defaultData));
          if (hasData(cachedData)) {
            setData(cachedData);
            saveCoupleState(cachedData).catch((error) => {
              if (active) {
                setSyncStatus("error");
                setSyncError(error.message || "Yerel veriler aktarılamadı.");
              }
            });
          } else {
            setData(defaultData);
          }
        }
        setNotes(remoteNotes);
        isLoaded.current = true;
        setSyncStatus("synced");
        if (Object.keys(pendingPatches.current).length > 0) {
          flushPatches();
        }
      })
      .catch((error) => {
        if (!active) return;
        console.error("Initial Supabase load failed:", error);
        setSyncStatus("error");
        setSyncError(error.message || "Supabase bağlantısı kurulamadı.");
      });

    const unsubscribe = subscribeToCoupleChanges({
      onState: (remoteData) => {
        if (!active) return;
        receivedRealtimeState = true;
        const nextData = normalizeData(remoteData);
        setData(nextData);
        writeStorage(DATA_STORAGE_KEY, nextData);
        setSyncStatus("synced");
      },
      onNotes: (remoteNotes) => active && setNotes(remoteNotes),
    });

    return () => {
      active = false;
      isLoaded.current = false;
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
        flushTimer.current = null;
      }
      unsubscribe();
    };
  }, [user?.id]);

  const updateData = useCallback((updater) => {
    setData((currentData) => {
      const nextData = typeof updater === "function" ? updater(currentData) : updater;
      writeStorage(DATA_STORAGE_KEY, nextData);
      const patch = Object.fromEntries(
        Object.keys(defaultData)
          .filter((key) => nextData[key] !== currentData[key])
          .map((key) => [key, nextData[key]]),
      );
      console.info("Application state changed; scheduling Supabase save.", { domains: Object.keys(patch) });
      persistData(patch);
      return nextData;
    });
  }, []);

  const addTask = useCallback(
    (title, date = toDateKey()) => {
      updateData((current) => ({
        ...current,
        tasks: [
          { id: createId("task"), title, completed: false, date, ownerId: user?.id ?? "admin" },
          ...current.tasks,
        ],
      }));
    },
    [updateData],
  );

  const updateTask = useCallback(
    (taskId, payload) => {
      updateData((current) => ({
        ...current,
        tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, ...payload } : task)),
      }));
    },
    [updateData, user?.id],
  );

  const deleteTask = useCallback(
    (taskId) => {
      updateData((current) => ({
        ...current,
        tasks: current.tasks.filter((task) => task.id !== taskId),
      }));
    },
    [updateData],
  );

  const addEvent = useCallback(
    (event) => {
      updateData((current) => ({
        ...current,
        events: [{ id: createId("event"), ownerId: user?.id ?? "admin", ...event }, ...current.events],
      }));
    },
    [updateData],
  );

  const updateEvent = useCallback(
    (eventId, payload) => {
      updateData((current) => ({
        ...current,
        events: current.events.map((event) => (event.id === eventId ? { ...event, ...payload } : event)),
      }));
    },
    [updateData],
  );

  const deleteEvent = useCallback(
    (eventId) => {
      updateData((current) => ({
        ...current,
        events: current.events.filter((event) => event.id !== eventId),
      }));
    },
    [updateData],
  );

  const addWater = useCallback(
    (amount) => {
      updateData((current) => {
        const today = toDateKey();
        return {
          ...current,
          water: {
            ...current.water,
            [today]: Math.min((current.water[today] ?? 0) + amount, DAILY_WATER_GOAL_ML),
          },
          waterByUser: {
            ...(current.waterByUser ?? {}),
            [user?.id ?? "admin"]: {
              ...((current.waterByUser ?? {})[user?.id ?? "admin"] ?? {}),
              [today]: Math.min((((current.waterByUser ?? {})[user?.id ?? "admin"] ?? {})[today] ?? current.water[today] ?? 0) + amount, DAILY_WATER_GOAL_ML),
            },
          },
        };
      });
    },
    [updateData, user?.id],
  );

  const decreaseWater = useCallback(
    (amount) => {
      updateData((current) => {
        const today = toDateKey();
        return {
          ...current,
          water: {
            ...current.water,
            [today]: Math.max((current.water[today] ?? 0) - amount, 0),
          },
          waterByUser: {
            ...(current.waterByUser ?? {}),
            [user?.id ?? "admin"]: {
              ...((current.waterByUser ?? {})[user?.id ?? "admin"] ?? {}),
              [today]: Math.max((((current.waterByUser ?? {})[user?.id ?? "admin"] ?? {})[today] ?? current.water[today] ?? 0) - amount, 0),
            },
          },
        };
      });
    },
    [updateData, user?.id],
  );

  const addSteps = useCallback(
    (amount) => {
      updateData((current) => {
        const today = toDateKey();
        return {
          ...current,
          steps: {
            ...(current.steps ?? {}),
            [today]: Math.min(((current.steps ?? {})[today] ?? 0) + amount, DAILY_STEP_GOAL),
          },
          stepsByUser: {
            ...(current.stepsByUser ?? {}),
            [user?.id ?? "admin"]: {
              ...((current.stepsByUser ?? {})[user?.id ?? "admin"] ?? {}),
              [today]: Math.min((((current.stepsByUser ?? {})[user?.id ?? "admin"] ?? {})[today] ?? (current.steps ?? {})[today] ?? 0) + amount, DAILY_STEP_GOAL),
            },
          },
        };
      });
    },
    [updateData, user?.id],
  );

  const decreaseSteps = useCallback(
    (amount) => {
      updateData((current) => {
        const today = toDateKey();
        return {
          ...current,
          steps: {
            ...(current.steps ?? {}),
            [today]: Math.max(((current.steps ?? {})[today] ?? 0) - amount, 0),
          },
          stepsByUser: {
            ...(current.stepsByUser ?? {}),
            [user?.id ?? "admin"]: {
              ...((current.stepsByUser ?? {})[user?.id ?? "admin"] ?? {}),
              [today]: Math.max((((current.stepsByUser ?? {})[user?.id ?? "admin"] ?? {})[today] ?? (current.steps ?? {})[today] ?? 0) - amount, 0),
            },
          },
        };
      });
    },
    [updateData, user?.id],
  );

  const toggleWorkout = useCallback(
    (workoutId) => {
      updateData((current) => ({
        ...current,
        workouts: current.workouts.map((workout) =>
          workout.id === workoutId ? { ...workout, completed: !workout.completed } : workout,
        ),
      }));
    },
    [updateData],
  );

  const addWorkout = useCallback(
    (workout) => {
      updateData((current) => ({
        ...current,
        workouts: [{ id: createId("workout"), ownerId: user?.id ?? "admin", completed: false, ...workout }, ...current.workouts],
      }));
    },
    [updateData],
  );

  const addDailyNote = useCallback(
    (body) => {
      const trimmedBody = body.trim().slice(0, 180);
      if (!trimmedBody || !user) return;
      const today = toDateKey();
      const existing = notes.find((note) => note.author_id === user.id && note.note_date === today);
      const note = {
        ...(existing?.id ? { id: existing.id } : {}),
        author_id: user.id,
        author_name: user.name,
        body: trimmedBody,
        note_date: today,
        created_at: existing?.created_at ?? new Date().toISOString(),
      };
      setNotes((current) => [...current.filter((item) => !(item.author_id === user.id && item.note_date === today)), note]);
      saveNote(note).catch((error) => {
        setSyncStatus("error");
        setSyncError(error.message || "Not kaydedilemedi.");
      });
    },
    [notes, user],
  );

  const updateWorkout = useCallback(
    (workoutId, payload) => {
      updateData((current) => ({
        ...current,
        workouts: current.workouts.map((workout) =>
          workout.id === workoutId ? { ...workout, ...payload } : workout,
        ),
      }));
    },
    [updateData],
  );

  const deleteWorkout = useCallback(
    (workoutId) => {
      updateData((current) => ({
        ...current,
        workouts: current.workouts.filter((workout) => workout.id !== workoutId),
      }));
    },
    [updateData],
  );

  const setProfilePhoto = useCallback(
    (userId, photoData) => {
      if (!userId) return;
      updateData((current) => ({
        ...current,
        profiles: {
          ...(current.profiles ?? {}),
          [userId]: { ...((current.profiles ?? {})[userId] ?? {}), photo: photoData, updatedAt: new Date().toISOString() },
        },
      }));
    },
    [updateData],
  );

  const setUserTheme = useCallback(
    (userId, themeId) => {
      if (!userId) return;
      updateData((current) => ({
        ...current,
        preferences: {
          ...(current.preferences ?? {}),
          [userId]: { ...((current.preferences ?? {})[userId] ?? {}), themeId, updatedAt: new Date().toISOString() },
        },
      }));
    },
    [updateData],
  );

  const statistics = useMemo(() => {
    return getWeekDays().map((day) => {
      const completedTasks = data.tasks.filter((task) => task.date === day.key && task.completed).length;
      return {
        name: day.label,
        tasks: completedTasks,
        water: Math.round((data.water[day.key] ?? 0) / 100),
        steps: Math.round(((data.steps ?? {})[day.key] ?? 0) / 100),
        workout: data.workouts.filter((workout) => workout.date === day.key && workout.completed).length,
      };
    });
  }, [data.steps, data.tasks, data.water, data.workouts]);

  const monthlyStatistics = useMemo(() => {
    return getCurrentMonthWeeks().map((week) => {
      const tasks = week.days.reduce(
        (total, dayKey) => total + data.tasks.filter((task) => task.date === dayKey && task.completed).length,
        0,
      );
      const water = week.days.reduce((total, dayKey) => total + (data.water[dayKey] ?? 0), 0);
      const steps = week.days.reduce((total, dayKey) => total + ((data.steps ?? {})[dayKey] ?? 0), 0);

      return {
        name: week.label,
        tasks,
        water: Math.round(water / 100),
        steps: Math.round(steps / 100),
      };
    });
  }, [data.steps, data.tasks, data.water]);

  const value = useMemo(
    () => ({
      ...data,
      statistics,
      monthlyStatistics,
      notes,
      addDailyNote,
      isCloudEnabled: isSupabaseConfigured,
      syncStatus,
      syncError,
      addTask,
      updateTask,
      deleteTask,
      addEvent,
      updateEvent,
      deleteEvent,
      addWater,
      decreaseWater,
      addSteps,
      decreaseSteps,
      toggleWorkout,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      setProfilePhoto,
      setUserTheme,
    }),
    [
      addEvent,
      addDailyNote,
      addTask,
      addSteps,
      addWater,
      addWorkout,
      data,
      deleteEvent,
      deleteTask,
      deleteWorkout,
      decreaseSteps,
      decreaseWater,
      monthlyStatistics,
      notes,
      syncError,
      syncStatus,
      statistics,
      toggleWorkout,
      updateEvent,
      updateWorkout,
      updateTask,
      setProfilePhoto,
      setUserTheme,
    ],
  );

  return <CoupleDataContext.Provider value={value}>{children}</CoupleDataContext.Provider>;
}

export function useCoupleData() {
  const context = useContext(CoupleDataContext);

  if (!context) {
    throw new Error("useCoupleData must be used within CoupleDataProvider");
  }

  return context;
}
