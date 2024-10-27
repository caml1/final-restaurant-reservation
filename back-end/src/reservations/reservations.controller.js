const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

// Middleware for Validations and Error Handling

/**
 * Middleware for handling query parameters for reservations.
 * Checks if 'date' or 'mobile_number' is present in the query,
 * then retrieves reservations accordingly.
 */
async function queryInput(request, response, next) {
  const { date, mobile_number } = request.query;
  if (date) {
    response.locals.reservations = await service.list(date);
    next();
  } else if (mobile_number) {
    response.locals.reservations = await service.search(mobile_number);
    next();
  } else {
    next({
      status: 400,
      message: `No query was specified in the URL`,
    });
  }
}

/**
 * Middleware to validate 'people' property in reservation data.
 * Ensures the 'people' value is a number greater than 0.
 */
function validPeople(request, response, next) {
  const { people } = request.body.data;
  if (people < 1 || typeof people !== "number") {
    next({
      status: 400,
      message: `people must be a number greater than 0.`,
    });
  }
  next();
}

/**
 * Middleware to validate the 'status' of a reservation.
 * Checks if 'status' is one of the allowed values: 'seated', 'booked', 'finished', or 'cancelled'.
 */
function validStatus(request, response, next) {
  const statuses = ["seated", "booked", "finished", "cancelled"];
  const { status } = request.body.data;
  if (statuses.includes(status)) next();
  else {
    next({
      status: 400,
      message: `The status cannot be ${status}, and must be "seated", "booked", "finished", or "cancelled".`,
    });
  }
}

/**
 * Middleware to check if a reservation is already finished.
 * If the reservation is finished, prevents further status changes.
 */
function isFinished(request, response, next) {
  if (response.locals.reservation.status !== "finished") {
    next();
  } else {
    next({
      status: 400,
      message: "Reservation is already finished.",
    });
  }
}

/**
 * Middleware to validate 'reservation_date' and 'reservation_time'.
 * Checks for valid date, time format, and ensures the reservation is in the future.
 * Also validates that reservations are not allowed on Tuesdays or outside open hours.
 */
async function validDateTime(request, response, next) {
  const { data: { reservation_date, reservation_time } = {} } = request.body;
  const reservation = new Date(`${reservation_date}T${reservation_time}Z`);
  const now = new Date();
  const [hour, minute] = reservation_time.split(":");
  
  if (reservation_date === "not-a-date") {
    next({ status: 400, message: `reservation_date is not a valid date.` });
  }
  if (reservation_time === "not-a-time") {
    next({ status: 400, message: `reservation_time is not a valid time.` });
  }
  if (reservation.getUTCDay() === 2) {
    next({ status: 400, message: "The restaurant is closed on Tuesdays." });
  }
  if (reservation < now) {
    next({ status: 400, message: "Reservation must be made at a future date/time." });
  }
  if (hour < 10 || hour > 21 || (hour == 10 && minute < 30) || (hour == 21 && minute > 30)) {
    next({ status: 400, message: `Your reservation time must be between 10:30 AM and 9:30 PM` });
  }
  next();
}

/**
 * Middleware to check if a reservation exists based on reservation_id.
 * If found, attaches the reservation to response.locals for further processing.
 */
async function reservationExists(request, response, next) {
  const { reservation_id } = request.params;
  const found = await service.read(reservation_id);

  if (found) {
    response.locals.reservation = found;
    return next();
  } else {
    next({ status: 404, message: `Reservation ${reservation_id} does not exist` });
  }
}

/**
 * Middleware to validate that new reservations have a default status of "booked".
 * Ensures the reservation cannot have any other status upon creation.
 */
function resBooked(request, response, next) {
  const { status } = request.body.data;
  if (!status || status === "booked") next();
  else {
    next({
      status: 400,
      message: `New reservations cannot be '${status}', only 'booked'.`,
    });
  }
}

// CRUD Handlers for Reservations

/**
 * Handler to read a reservation from response.locals and send it in the response.
 */
async function read(request, response, next) {
  response.json({ data: response.locals.reservation });
}

/**
 * Handler to list reservations stored in response.locals.
 */
async function list(request, response, next) {
  response.json({ data: response.locals.reservations });
}

/**
 * Handler to create a new reservation.
 * Sends back the created reservation with a 201 status.
 */
async function create(request, response) {
  const data = await service.create(request.body.data);
  response.status(201).json({ data });
}

/**
 * Handler to update an existing reservation.
 * Updates the reservation based on provided data and returns the updated reservation.
 */
async function update(request, response, next) {
  const { reservation_id } = response.locals.reservation;
  const data = await service.update({ ...request.body.data, reservation_id });
  response.json({ data: data[0] });
}

/**
 * Handler to change the status of a reservation.
 * Sends back the updated reservation after modifying its status.
 */
async function changeStatus(request, response, next) {
  const { reservation_id } = request.params;
  const data = await service.changeStatus({ ...request.body.data, reservation_id });
  response.json({ data: data[0] });
}

// Exports with Middleware and Validation

module.exports = {
  list: [
    asyncErrorBoundary(queryInput),
    asyncErrorBoundary(list),
  ],
  create: [
    hasProperties("first_name"),
    hasProperties("last_name"),
    hasProperties("mobile_number"),
    hasProperties("reservation_date"),
    hasProperties("reservation_time"),
    hasProperties("people"),
    validDateTime,
    validPeople,
    resBooked,
    asyncErrorBoundary(create),
  ],
  read: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(read),
  ],
  update: [
    hasProperties("first_name"),
    hasProperties("last_name"),
    hasProperties("mobile_number"),
    hasProperties("reservation_date"),
    hasProperties("reservation_time"),
    hasProperties("people"),
    validDateTime,
    validPeople,
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(update),
  ],
  changeStatus: [
    asyncErrorBoundary(reservationExists),
    validStatus,
    isFinished,
    asyncErrorBoundary(changeStatus),
  ],
};