const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res, next) {
  const { date, mobile_number } = req.query;

  if (mobile_number) {
    const data = await service.searchByMobileNumber(mobile_number);
    return res.json({ data });
  }

  const data = await service.listByDate(date);
  res.json({ data });
}

async function create(req, res, next) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

async function read(req, res, next) {
  const { reservation_id } = req.params;
  const data = await service.read(reservation_id);

  if (!data) {
    return next({ status: 404, message: `Reservation ID ${reservation_id} not found` });
  }
  
  res.status(200).json({ data });
}

async function updateStatus(req, res, next) {
  const { reservation_id } = req.params;
  const { status } = req.body.data;

  const validStatuses = ["booked", "seated", "finished", "cancelled"];
  if (!validStatuses.includes(status)) {
    return next({ status: 400, message: `Invalid status: ${status}` });
  }

  const updatedReservation = await service.updateStatus(reservation_id, status);
  res.status(200).json({ data: updatedReservation });
}

async function update(req, res, next) {
  const { reservation_id } = req.params;
  const updatedReservation = await service.update(reservation_id, req.body.data);
  res.status(200).json({ data: updatedReservation });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: asyncErrorBoundary(create),
  read: asyncErrorBoundary(read),
  updateStatus: asyncErrorBoundary(updateStatus),
  update: asyncErrorBoundary(update),
};