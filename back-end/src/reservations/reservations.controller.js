const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Validation middleware
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

  const reservationDate = new Date(data.reservation_date);
  if (isNaN(reservationDate.getTime())) {
    return next({
      status: 400,
      message: "Field 'reservation_date' must be a valid date.",
    });
  }

  const reservationTime = data.reservation_time;
  if (!/^\d{2}:\d{2}$/.test(reservationTime)) {
    return next({
      status: 400,
      message: "Field 'reservation_time' must be in HH:MM format.",
    });
  }

  next();
}

async function create(req, res, next) {
  const newReservation = req.body.data;
  const createdReservation = await service.create(newReservation);
  res.status(201).json({ data: createdReservation });
}

async function read(req, res, next) {
  const { reservation } = res.locals;
  res.json({ data: reservation });
}

// Validation to check if reservation exists
async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);

  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }

  next({ status: 404, message: `Reservation ID: ${reservation_id} not found.` });
}

async function list(req, res) {
  const { date } = req.query;
  const data = await service.listByDate(date);
  res.json({ data });
}

module.exports = {
  create: [hasRequiredFields, asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(reservationExists), read],
  list: asyncErrorBoundary(list),
};