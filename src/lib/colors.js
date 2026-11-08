// Batch id থেকে স্থায়ী gradient — একই batch সবসময় একই রঙ
const GRADIENTS = [
  "from-indigo-600 to-violet-500",
  "from-emerald-600 to-teal-500",
  "from-rose-500 to-orange-400",
  "from-sky-600 to-cyan-400",
  "from-fuchsia-600 to-pink-500",
  "from-amber-500 to-yellow-400",
];

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-emerald-500", "bg-rose-500",
  "bg-sky-500", "bg-fuchsia-500", "bg-amber-500",
];

const hash = (str) =>
  [...String(str)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7);

export const batchGradient = (id) => GRADIENTS[hash(id) % GRADIENTS.length];
export const avatarColor = (name) =>
  AVATAR_COLORS[hash(name) % AVATAR_COLORS.length];
export const initials = (name = "?") =>
  name.trim().charAt(0).toUpperCase() || "?";