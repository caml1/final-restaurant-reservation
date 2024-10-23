const knex = require("../db/connection");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const reservationsService = require("../reservations/reservations.service");

async function list(req, res) {
  const data = await knex("tables").select("*").orderBy("table_name");
  res.json({ data });
}

async function create(req, res, next) {
  const { data = {} } = req.body;

  if (!data.table_name || data.table_name.length < 2) {
    return next({ status: 400, message: "table_name must be at least 2 characters long." });
  }

  if (!data.capacity || typeof data.capacity !== "number" || data.capacity < 1) {
    return next({ status: 400, message: "capacity must be a number greater than or equal to 1." });
  }

  const newTable = await knex("tables")
    .insert(data)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);

  res.status(201).json({ data: newTable });
}

async function seatReservation(req, res, next) {
  const { table_id } = req.params;
  const { reservation_id } = req.body.data;

  const table = await knex("tables").where({ table_id }).first();
  const reservation = await reservationsService.read(reservation_id);

  if (!table) {
    return next({ status: 404, message: `Table with ID ${table_id} not found.` });
  }

  if (!reservation) {
    return next({ status: 404, message: `Reservation with ID ${reservation_id} not found.` });
  }

  if (table.capacity < reservation.people) {
    return next({ status: 400, message: `Table capacity (${table.capacity}) is smaller than the reservation size (${reservation.people}).` });
  }

  if (table.reservation_id) {
    return next({ status: 400, message: `Table ${table_id} is currently occupied.` });
  }

  await knex.transaction(async (trx) => {
    await trx("tables").where({ table_id }).update({ reservation_id });
    await trx("reservations").where({ reservation_id }).update({ status: "seated" });
  });

  res.status(200).json({ data: table });
}

async function finishTable(req, res, next) {
  const { table_id } = req.params;

  const table = await knex("tables").where({ table_id }).first();

  if (!table) {
    return next({ status: 404, message: `Table with ID ${table_id} not found.` });
  }

  if (!table.reservation_id) {
    return next({ status: 400, message: `Table ${table_id} is not occupied.` });
  }

  await knex.transaction(async (trx) => {
    await trx("tables").where({ table_id }).update({ reservation_id: null });
    await trx("reservations").where({ reservation_id: table.reservation_id }).update({ status: "finished" });
  });

  res.status(200).json({ data: table });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: asyncErrorBoundary(create),
  seatReservation: asyncErrorBoundary(seatReservation),
  finishTable: asyncErrorBoundary(finishTable),
};