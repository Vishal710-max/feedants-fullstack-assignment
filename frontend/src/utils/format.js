const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

export const formatDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
};

export const formatTime = (iso) => {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const formatDateTime = (iso) => `${formatDate(iso)}, ${formatTime(iso)}`;

// Indian digit grouping: 1500 -> "1,500", 125000 -> "1,25,000"
export const inr = (n) => {
  const s = String(Math.round(n));
  if (s.length <= 3) return s;
  return `${s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${s.slice(-3)}`;
};

export const pad2 = (n) => String(n).padStart(2, '0');

