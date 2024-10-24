import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-time";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

// Default headers for the API requests
const headers = new Headers();
headers.append("Content-Type", "application/json");

// Function to handle fetching JSON data and errors
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) return null; // No content to return

    const payload = await response.json();

    if (payload.error) return Promise.reject({ message: payload.error });
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") throw error;
    return Promise.resolve(onCancel);
  }
}

// API function to list reservations based on query parameters
export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

// API function to create a new reservation
export async function createReservation(reservation, signal) {
  const url = `${API_BASE_URL}/reservations`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: reservation }),
    signal,
  };
  return await fetchJson(url, options);
}

// API function to read a specific reservation by ID
export async function readReservation(reservation_id, signal) {
  const url = `${API_BASE_URL}/reservations/${reservation_id}`;
  return await fetchJson(url, { headers, signal }, {});
}

// API function to update an existing reservation
export async function updateReservation(reservation, signal) {
  const url = `${API_BASE_URL}/reservations/${reservation.reservation_id}`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: reservation }),
    signal,
  };
  return await fetchJson(url, options);
}

// API function to update the status of an existing reservation
export async function updateReservationStatus(reservation_id, status, signal) {
  const url = `${API_BASE_URL}/reservations/${reservation_id}/status`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { status } }),
    signal,
  };
  return await fetchJson(url, options);
}

// API function to list all tables
export async function listTables(signal) {
  const url = `${API_BASE_URL}/tables`;
  return await fetchJson(url, { headers, signal }, []);
}

// API function to create a new table
export async function createTable(table, signal) {
  const url = `${API_BASE_URL}/tables`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: table }),
    signal,
  };
  return await fetchJson(url, options);
}

// API function to seat a reservation at a specific table
export async function seatReservation(table_id, reservation_id, signal) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { reservation_id } }),
    signal,
  };
  return await fetchJson(url, options);
}

// API function to finish a table and free it up
export async function finishTable(table_id, signal) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const options = { method: "DELETE", headers, signal };
  return await fetchJson(url, options);
}

// API function to search for reservations by phone number
export async function searchReservations(mobile_number, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  url.searchParams.append("mobile_number", mobile_number);
  return await fetchJson(url, { headers, signal }, []);
}