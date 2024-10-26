const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";
const headers = new Headers({ "Content-Type": "application/json" });

async function fetchJson(url, options = {}, onCancel = null, maxRetries = 2, timeout = 3000) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const { signal } = controller;
    options = { ...options, signal };

    const fetchTimeout = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, options);
      clearTimeout(fetchTimeout);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      return payload?.data ?? null;
    } catch (error) {
      clearTimeout(fetchTimeout);

      if (error.name === "AbortError") {
        console.warn(`Request to ${url} timed out. Retrying... (${attempt + 1}/${maxRetries})`);
        attempt += 1;
      } else {
        console.error(error.stack);
        throw error;
      }
    }
  }

  // If all retries failed, resolve with onCancel value or throw an error
  return Promise.resolve(onCancel);
}

// Updated API functions with AbortController and retry logic
export async function listReservations(params = {}, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value.toString()));
  
  return fetchJson(url, { headers, signal });
}

export async function createReservation(reservation, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  const options = { method: "POST", headers, body: JSON.stringify({ data: reservation }), signal };
  
  return fetchJson(url, options);
}

export async function readReservation(reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`);
  
  return fetchJson(url, { headers, signal });
}

export async function updateReservation(updatedReservation, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${updatedReservation.reservation_id}`);
  const options = { method: "PUT", headers, body: JSON.stringify({ data: updatedReservation }), signal };
  
  return fetchJson(url, options);
}

export async function createTable(table, signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  const options = { method: "POST", headers, body: JSON.stringify({ data: table }), signal };
  
  return fetchJson(url, options);
}

export async function listTables(signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  
  return fetchJson(url, { headers, signal });
}

export async function seatReservation(table_id, reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/tables/${table_id}/seat/`);
  const options = { method: "PUT", headers, body: JSON.stringify({ data: { reservation_id } }), signal };
  
  return fetchJson(url, options);
}

export async function updateReservationStatus(reservation_id, status, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}/status`);
  const options = { method: "PUT", headers, body: JSON.stringify({ data: { status } }), signal };
  
  return fetchJson(url, options);
}

export async function cancelReservation(reservation_id, signal) {
  return updateReservationStatus(reservation_id, "cancelled", signal);
}

export async function finishTable(table_id, signal) {
  const url = new URL(`${API_BASE_URL}/tables/${table_id}/seat/`);
  const options = { method: "DELETE", headers, body: JSON.stringify({ data: table_id }), signal };
  
  return fetchJson(url, options);
}

export async function searchReservations(mobile_number, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  url.searchParams.append("mobile_number", mobile_number);
  
  return fetchJson(url, { headers, signal });
}