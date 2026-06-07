export async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers
    }
  });

  const payload = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const error = new Error(payload?.message || "Action impossible");
    error.status = response.status;
    throw error;
  }

  return payload;
}

export function fetchEquipments(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest(`/api/courts${suffix}`);
}

export const fetchCourts = fetchEquipments;

export function todayDateValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function fetchEquipment(id, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest(`/api/courts/${id}${suffix}`);
}

export const fetchCourt = fetchEquipment;

export function fetchCategories() {
  return apiRequest("/api/clubs");
}

export const fetchClubs = fetchCategories;

export function signIn(payload) {
  return apiRequest("/api/auth/signin", { method: "POST", body: JSON.stringify(payload) });
}

export function signUp(payload) {
  return apiRequest("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) });
}

export function signOut(token) {
  return apiRequest("/api/auth/signout", { method: "POST", token });
}

export function fetchMyReservations(token) {
  return apiRequest("/api/me/reservations", { token });
}

export function createReservation(token, payload) {
  return apiRequest("/api/reservations", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function cancelMyReservation(token, reservationId) {
  return apiRequest(`/api/me/reservations/${reservationId}/cancel`, {
    method: "PATCH",
    token
  });
}
