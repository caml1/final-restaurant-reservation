/**
 * Defines the base URL for the API.
 * The default values are overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the request.
 * @param options
 *  any options for fetch.
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservations.
 * @param params
 *  the query parameters to be sent to the API.
 * @param signal
 *  optional AbortSignal to cancel the request.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservations saved in the database.
 */
export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

/**
 * Creates a new reservation.
 * @param reservation
 *  the reservation data to be saved in the database.
 * @param signal
 *  optional AbortSignal to cancel the request.
 * @returns {Promise<reservation>}
 *  a promise that resolves to the saved reservation data.
 */
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

/**
 * Fetches a reservation by its ID.
 * @param reservation_id
 *  the reservation ID.
 * @param signal
 *  optional AbortSignal to cancel the request.
 * @returns {Promise<reservation>}
 *  a promise that resolves to the saved reservation data.
 */
export async function readReservation(reservation_id, signal) {
  const url = `${API_BASE_URL}/reservations/${reservation_id}`;
  return await fetchJson(url, { headers, signal }, {});
}

/**
 * Updates an existing reservation.
 * @param reservation
 *  the reservation data to be updated in the database.
 * @param signal
 *  optional AbortSignal to cancel the request.
 * @returns {Promise<reservation>}
 *  a promise that resolves to the updated reservation data.
 */
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

/**
 * Updates the status of an existing reservation.
 * @param reservation_id
 *  the reservation ID.
 * @param status
 *  the new status for the reservation (e.g., "booked", "seated", "finished", "cancelled").
 * @param signal
 *  optional AbortSignal to cancel the request.
 * @returns {Promise<reservation>}
 *  a promise that resolves to the updated reservation data.
 */
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

/**
 * Retrieves all existing tables.
 * @param signal
 *  optional AbortSignal to cancel the request.
 * @returns {Promise<[table]>}
 *  a promise that resolves to a possibly empty array of tables saved in the database.
 */
export async function listTables(signal) {
  const url = `${API_BASE_URL}/tables`;
  return await fetchJson(url, { headers, signal }, []);
}

/**
 * Creates a new table.
 * @param table
 *  the table data to be saved in the database.
 * @param signal
 *  optional AbortSignal to cancel the request.
 * @returns {Promise<table>}
 *  a promise that resolves to the saved table data.
 */
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

/**
 * Seats a reservation at a specific table.
 * @param table_id
 *  the table ID.
 * @param reservation_id
 *  the reservation ID.
 * @param signal
 *  optional AbortSignal to cancel the request.
 * @returns {Promise<table>}
 *  a promise that resolves to the updated table data.
 */
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

/**
 * Finishes a table by removing its seated reservation.
 * @param table_id
 *  the table ID.
 * @param signal
 *  optional AbortSignal to cancel the request.
 * @returns {Promise<void>}
 *  a promise that resolves when the table is cleared.
 */
export async function finishTable(table_id, signal) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const options = { method: "DELETE", headers, signal };
  return await fetchJson(url, options);
}

/**
 * Searches for reservations by mobile number.
 * @param mobile_number
 *  the mobile number to search for.
 * @param signal
 *  optional AbortSignal to cancel the request.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservations matching the mobile number.
 */
export async function searchReservations(mobile_number, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  url.searchParams.append("mobile_number", mobile_number);
  return await fetchJson(url, { headers, signal }, []);
}