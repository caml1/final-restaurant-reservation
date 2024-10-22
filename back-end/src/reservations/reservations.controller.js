const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./reservations.service");
const hasProperties = require("../errors/hasProperties");

// List of required fields for a reservation
const REQUIRED_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

// Middleware to check that all required properties are present
const hasRequiredProperties = hasProperties(...REQUIRED_PROPERTIES);

async function list(req, res) {
  const { date } = req.query;
  const data = await service.listByDate(date);
  res.json({ data });
}

async function create(req, res) {
  const { data } = req.body;

  // Validation: Ensure "people" is a number and greater than 0
  if (typeof data.people !== "number" || data.people < 1) {
    return res.status(400).json({ error: "people must be a number greater than 0" });
  }

  // Validation: Ensure reservation_date is a valid date
  if (isNaN(Date.parse(data.reservation_date))) {
    return res.status(400).json({ error: "reservation_date must be a valid date" });
  }

  // Validation: Ensure reservation_time is in valid time format (HH:MM)
  const timeFormat = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
  if (!timeFormat.test(data.reservation_time)) {
    return res.status(400).json({ error: "reservation_time must be a valid time in HH:MM format" });
  }

  const newReservation = await service.create(data);
  res.status(201).json({ data: newReservation });
}

async function read(req, res) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);
  if (!reservation) {
    return res.status(404).json({ error: `Reservation ID ${reservation_id} not found` });
  }
  res.json({ data: reservation });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [hasRequiredProperties, asyncErrorBoundary(create)],
  read: asyncErrorBoundary(read),
};