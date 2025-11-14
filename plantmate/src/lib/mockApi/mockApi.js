// src/lib/mockApi.js
// Mock DB/API that matches your collections using localStorage (no backend needed)

const KEYS = {
  USERS: "pm_users",
  PROFILES: "pm_profiles",
  SPACES: "pm_spaces",
  PLANTS: "pm_plants",
  USER_PLANTS: "pm_user_plants",
  CARE_TASKS: "pm_care_tasks",
  NOTIFICATIONS: "pm_notifications",
  ENDPOINTS: "pm_notification_endpoints",
  SEEDED: "pm_seeded_v1",
};

const iso = (d = new Date()) => new Date(d).toISOString();
const uid = (p = "id_") => p + Math.random().toString(36).slice(2) + Date.now();
const load = (k) => JSON.parse(localStorage.getItem(k) || "[]");
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

// ---- SEED DATA (mirrors your collections) ----
export function seedMock() {
  if (localStorage.getItem(KEYS.SEEDED)) return;

  const userId = "u1";

  // users
  save(KEYS.USERS, [
    {
      _id: userId,
      email: "demo@plantmate.app",
      password_hash: "",
      roles: ["user"],
      created_at: iso(),
      last_login_at: iso(),
    },
  ]);

  // profiles
  save(KEYS.PROFILES, [
    {
      user_id: userId,
      name: "Bhumi Vyas",
      timezone: "Asia/Kolkata",
      city: "Ahmedabad",
      lat: 23.0225,
      lon: 72.5714,
      preferred_units: "metric",
      experience: "beginner",
    },
  ]);

  // plants (reference catalog)
  const plants = [
    {
      slug: "basil",
      common_name: "Basil",
      scientific_name: "Ocimum basilicum",
      min_sun_hours: 5,
      max_sun_hours: 8,
      indoor_ok: true,
      watering_need: "med",
      fertilization_freq_days: 21,
      pot_size_min_liters: 3,
      soil_type: "loam",
      difficulty: "easy",
      tags: ["herb", "culinary", "fragrant"],
    },
    {
      slug: "mint",
      common_name: "Mint",
      scientific_name: "Mentha",
      min_sun_hours: 3,
      max_sun_hours: 6,
      indoor_ok: true,
      watering_need: "high",
      fertilization_freq_days: 28,
      pot_size_min_liters: 4,
      soil_type: "loam",
      difficulty: "easy",
      tags: ["herb", "shade-tolerant"],
    },
    {
      slug: "aloe-vera",
      common_name: "Aloe Vera",
      scientific_name: "Aloe barbadensis",
      min_sun_hours: 4,
      max_sun_hours: 8,
      indoor_ok: true,
      watering_need: "low",
      fertilization_freq_days: 45,
      pot_size_min_liters: 5,
      soil_type: "cactus",
      difficulty: "easy",
      tags: ["succulent", "medicinal"],
    },
    {
      slug: "chilli",
      common_name: "Chilli",
      scientific_name: "Capsicum annuum",
      min_sun_hours: 6,
      max_sun_hours: 8,
      indoor_ok: false,
      watering_need: "med",
      fertilization_freq_days: 30,
      pot_size_min_liters: 7,
      soil_type: "loam",
      difficulty: "med",
      tags: ["fruiting", "spicy"],
    },
  ];
  save(KEYS.PLANTS, plants);

  // spaces
  const spaces = [
    {
      id: "s1",
      user_id: userId,
      name: "South Balcony",
      type: "balcony",
      direction: "S",
      sunlight_hours: 6,
      area_sq_m: 1.8,
      notes: "",
    },
    {
      id: "s2",
      user_id: userId,
      name: "Kitchen Window",
      type: "windowsill",
      direction: "E",
      sunlight_hours: 3,
      area_sq_m: 0.6,
      notes: "",
    },
  ];
  save(KEYS.SPACES, spaces);

  // user_plants
  const userPlants = [
    { id: "up1", user_id: userId, space_id: "s1", plant_id: "basil", nickname: "Basil #1", acquired_at: iso(), status: "active", custom_prefs: {} },
    { id: "up2", user_id: userId, space_id: "s2", plant_id: "aloe-vera", nickname: "Aloe Sun", acquired_at: iso(), status: "active", custom_prefs: {} },
  ];
  save(KEYS.USER_PLANTS, userPlants);

  // care_tasks
  const careTasks = [
    { id: "ct1", user_plant_id: "up1", type: "water", due_at: iso(new Date(Date.now() + 60 * 60 * 1000)), status: "pending", recurrence_days: 3, notes: "Keep moist" },
    { id: "ct2", user_plant_id: "up1", type: "fertilize", due_at: iso(new Date(Date.now() + 24 * 60 * 60 * 1000)), status: "pending", recurrence_days: 21, notes: "" },
    { id: "ct3", user_plant_id: "up2", type: "water", due_at: iso(new Date(Date.now() + 2 * 60 * 60 * 1000)), status: "pending", recurrence_days: 7, notes: "Let soil dry" },
  ];
  save(KEYS.CARE_TASKS, careTasks);

  // notifications (queue + audit)
  save(KEYS.NOTIFICATIONS, [
    {
      id: "n1",
      user_id: userId,
      channel: "in_app",
      title: "Time to water 🌿",
      body: "Basil #1 is due soon.",
      deeplink: "/plants/up1",
      scheduled_at: iso(new Date(Date.now() + 30 * 60 * 1000)),
      status: "pending",
      priority: "normal",
      dedupe_key: "ct1:off:30",
      related: { type: "care_task", id: "ct1" },
      meta: { offset_min: -30, reason: "due" },
      created_at: iso(),
      updated_at: iso(),
    },
  ]);

  // notification_endpoints (empty for now)
  save(KEYS.ENDPOINTS, []);

  localStorage.setItem(KEYS.SEEDED, "1");
}

// ---- USERS / PROFILES ----
export const getCurrentUser = () => (load(KEYS.USERS)[0] || null);
export const getProfile = (user_id) => load(KEYS.PROFILES).find((p) => p.user_id === user_id) || null;

// ---- SPACES ----
export const getSpaces = (user_id) => load(KEYS.SPACES).filter((s) => s.user_id === user_id);
export function upsertSpace(space) {
  const list = load(KEYS.SPACES);
  const i = list.findIndex((s) => s.id === space.id);
  if (i >= 0) list[i] = { ...list[i], ...space };
  else list.unshift({ ...space, id: space.id || uid("s_") });
  save(KEYS.SPACES, list);
  return list;
}
export function deleteSpace(id) {
  const list = load(KEYS.SPACES).filter((s) => s.id !== id);
  save(KEYS.SPACES, list);
  return list;
}

// ---- PLANTS (catalog) ----
export const listPlants = () => load(KEYS.PLANTS);

// ---- USER_PLANTS ----
export const getUserPlants = (user_id) => load(KEYS.USER_PLANTS).filter((p) => p.user_id === user_id);
export function addUserPlant({ user_id, space_id, plant_slug, nickname }) {
  const list = load(KEYS.USER_PLANTS);
  const row = {
    id: uid("up_"),
    user_id,
    space_id,
    plant_id: plant_slug,
    nickname: nickname || plant_slug,
    acquired_at: iso(),
    status: "active",
    custom_prefs: {},
  };
  list.unshift(row);
  save(KEYS.USER_PLANTS, list);
  return row;
}

// ---- CARE_TASKS ----
export function getCareTasks({ when = "today", user_id } = {}) {
  const tasks = load(KEYS.CARE_TASKS);
  const userPlantIds = new Set(getUserPlants(user_id).map((p) => p.id));
  const filtered = tasks.filter((t) => userPlantIds.has(t.user_plant_id) && t.status === "pending");
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setHours(23, 59, 59, 999);

  if (when === "today") {
    return filtered.filter((t) => {
      const d = new Date(t.due_at);
      return d >= start && d <= end;
    });
  }
  if (when === "overdue") return filtered.filter((t) => new Date(t.due_at) < now);
  if (when === "upcoming") return filtered.filter((t) => new Date(t.due_at) > end);
  return filtered;
}

export function markTaskDone(taskId) {
  const tasks = load(KEYS.CARE_TASKS);
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx < 0) return tasks;
  const now = new Date();
  const t = tasks[idx];
  tasks[idx] = { ...t, status: "done", completed_at: iso(now) };
  // auto-create next instance
  if (t.recurrence_days && t.recurrence_days > 0) {
    const next = {
      ...t,
      id: uid("ct_"),
      due_at: iso(new Date(now.getTime() + t.recurrence_days * 24 * 60 * 60 * 1000)),
      status: "pending",
      completed_at: undefined,
    };
    tasks.push(next);
  }
  save(KEYS.CARE_TASKS, tasks);
  return tasks;
}

export function snoozeTask(taskId, minutes = 120) {
  const tasks = load(KEYS.CARE_TASKS);
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx < 0) return tasks;
  const t = tasks[idx];
  tasks[idx] = { ...t, due_at: iso(new Date(Date.now() + minutes * 60 * 1000)) };
  save(KEYS.CARE_TASKS, tasks);
  return tasks;
}

// ---- NOTIFICATIONS ----
export const getNotifications = (user_id) =>
  load(KEYS.NOTIFICATIONS).filter((n) => n.user_id === user_id).sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));

export function enqueueNotification(n) {
  const list = load(KEYS.NOTIFICATIONS);
  list.unshift({
    id: uid("n_"),
    created_at: iso(),
    updated_at: iso(),
    status: "pending",
    priority: "normal",
    ...n,
  });
  save(KEYS.NOTIFICATIONS, list);
  return list[0];
}

// ---- SUGGESTIONS (rules + simple scoring; AI later) ----
const diffRank = { easy: 3, med: 2, hard: 1 };
const expRank = { beginner: 1, intermediate: 2, advanced: 3 };

export function getSuggestions(user_id, space_id, limit = 6) {
  const space = load(KEYS.SPACES).find((s) => s.id === space_id);
  if (!space) return [];
  const profile = getProfile(user_id) || { experience: "beginner" };
  const catalog = load(KEYS.PLANTS);

  const candidates = catalog.filter(
    (p) => space.sunlight_hours >= p.min_sun_hours && space.sunlight_hours <= p.max_sun_hours
  );

  const scored = candidates.map((p) => {
    // closeness to ideal sun
    const mid = (p.min_sun_hours + p.max_sun_hours) / 2;
    const sunScore = Math.max(0, 100 - Math.abs(space.sunlight_hours - mid) * 15); // simple curve
    // difficulty vs experience
    const d = diffRank[p.difficulty] || 2;
    const e = expRank[profile.experience] || 1;
    const diffScore = 20 * (d >= e ? 1 : 0.6);
    const total = Math.round(Math.min(100, sunScore + diffScore) / 2);
    const rationale = `${p.common_name} suits ~${p.min_sun_hours}-${p.max_sun_hours}h; ${p.difficulty} to grow.`;
    return { plant_slug: p.slug, common_name: p.common_name, score: total, rationale };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

// ---- DASHBOARD STATS ----
export function getDashboardStats(user_id) {
  const spaces = getSpaces(user_id);
  const plants = getUserPlants(user_id);
  const tasksToday = getCareTasks({ when: "today", user_id });
  const overdue = getCareTasks({ when: "overdue", user_id });
  return {
    spaces: spaces.length,
    plants: plants.length,
    tasksToday: tasksToday.length,
    overdue: overdue.length,
    avgSunlightHours: Number(avg(spaces.map((s) => s.sunlight_hours)).toFixed(1)),
    recommendations: spaces.length ? getSuggestions(user_id, spaces[0].id).length : 0,
  };
}
