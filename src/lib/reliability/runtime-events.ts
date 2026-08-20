export const SESSION_EXPIRED_EVENT = "xerin:session-expired";

export const announceSessionExpired = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
};

export const createIncidentId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().split("-")[0].toUpperCase();
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
};
