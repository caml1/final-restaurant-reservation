const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Middleware to check if reservation exists
async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);

  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({ status: 404, message: `Reservation ID: ${reservation_id} not found.` });
}

// Middleware to validate required fields
function hasRequiredFields(req, res, next) {
  const { data = {} } = req.body;
  const requiredFields = ["first_name", "last_name", "mobile_number", "reservation_date", "reservation_time", "people"];

  for (let field of requiredFields) {
    if (!data[field]) {
      return next({
        status: 400,
        message: `Field required: ${field}`,
      });
    }
  }

  if (typeof data.people !== "number" || data.people <= 0) {
    return next({
      status: 400,
      message: "Field 'people' must be a number greater than 0.",
    });
  }

  const reservationDate = new Date(`${data.reservation_date}T${data.reservation_time}`);
  if (isNaN(reservationDate.getTime())) {
    return next({
      status: 400,
      message: "Field 'reservation_date' must be a valid date.",
    });
  }

  if (!/^\d{2}:\d{2}$/.test(data.reservation_time)) {
    return next({
      status: 400,
      message: "Field 'reservation_time' must be in HH:MM format.",
    });
  }

  next();
}

// Middleware to validate reservation status
function validStatus(req, res, next) {
  const { status } = req.body.data;
  const validStatuses = ["booked", "seated", "finished", "cancelled"];
  
  if (!validStatuses.includes(status)) {
    return next({ status: 400, message: `Invalid status: ${status}` });
  }

  next();
}

// Create a new reservation
async function create(req, res) {
  const newReservation = await service.create(req.body.data);
  res.status(201).json({ data: newReservation });
}

// Read a reservation by ID
async function read(req, res) {
  const { reservation } = res.locals;
  res.json({ data: reservation });
}

// Update an existing reservation
async function update(req, res) {
  const updatedReservation = {
    ...req.body.data,
    reservation_id: res.locals.reservation.reservation_id,
  };
  const data = await service.update(updatedReservation);
  res.json({ data });
}

// Update the status of an existing reservation
async function updateStatus(req, res, next) {
  const { reservation_id } = req.params;
  const { status } = req.body.data;

  if (res.locals.reservation.status === "finished") {
    return next({
      status: 400,
      message: "A finished reservation cannot be updated.",
    });
  }

  const data = await service.updateStatus(reservation_id, status);
  res.json({ data });
}

// List reservations by date or mobile number (for search functionality)
async function list(req, res) {
  const { date, mobile_number } = req.query;

  let data;
  if (mobile_number) {
    data = await service.search(mobile_number);
  } else {
    data = await service.listByDate(date);
  }

  res.json({ data });
}

module.exports = {
  create: [hasRequiredFields, asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(reservationExists), read],
  update: [asyncErrorBoundary(reservationExists), hasRequiredFields, asyncErrorBoundary(update)],
  updateStatus: [asyncErrorBoundary(reservationExists), validStatus, asyncErrorBoundary(updateStatus)],
  list: asyncErrorBoundary(list),
};