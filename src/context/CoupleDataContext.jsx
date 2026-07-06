import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DAILY_STEP_GOAL, DAILY_WATER_GOAL_ML } from "../constants/theme.js";
import { getCurrentMonthWeeks, getWeekDays, toDateKey } from "../utils/date.js";
import { readStorage, writeStorage } from "../utils/storage.js";

const DATA_STORAGE_KEY = "couple_private_data_v2";

const defaultData = {
  tasks: [],
  events: [],
  water: {},
  steps: {},
  workouts: [],
};

const CoupleDataContext = createContext(null);

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function CoupleDataProvider({ children }) {
  const [data, setData] = useState(() => readStorage(DATA_STORAGE_KEY, defaultData));

  const updateData = useCallback((updater) => {
    setData((currentData) => {
      const nextData = typeof updater === "function" ? updater(currentData) : updater;
      writeStorage(DATA_STORAGE_KEY, nextData);
      return nextData;
    });
  }, []);

  const addTask = useCallback(
    (title, date = toDateKey()) => {
      updateData((current) => ({
        ...current,
        tasks: [
          { id: createId("task"), title, completed: false, date },
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
    [updateData],
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
        events: [{ id: createId("event"), ...event }, ...current.events],
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
        };
      });
    },
    [updateData],
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
        };
      });
    },
    [updateData],
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
        };
      });
    },
    [updateData],
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
        };
      });
    },
    [updateData],
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
        workouts: [{ id: createId("workout"), completed: false, ...workout }, ...current.workouts],
      }));
    },
    [updateData],
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
    }),
    [
      addEvent,
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
      statistics,
      toggleWorkout,
      updateEvent,
      updateWorkout,
      updateTask,
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
