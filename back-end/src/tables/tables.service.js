const knex = require("../db/connection");

function listByDate(date) {
  return knex("reservations")
    .where({ reservation_date: date })
    .whereNot({ status: "finished" }) // Filter out finished reservations
    .orderBy("reservation_time");
}

function create(newReservation) {
  return knex("reservations")
    .insert(newReservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

function read(reservation_id) {
  return knex("reservations").where({ reservation_id }).first();
}

function updateStatus(reservation_id, status) {
  return knex("reservations")
    .where({ reservation_id })
    .update({ status })
    .returning("*")
    .then((updatedRecords) => updatedRecords[0]);
}

function searchByPhoneNumber(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

function updateReservation(updatedReservation) {
  return knex("reservations")
    .where({ reservation_id: updatedReservation.reservation_id })
    .update(updatedReservation)
    .returning("*")
    .then((updatedRecords) => updatedRecords[0]);
}

module.exports = {
  listByDate,
  create,
  read,
  updateStatus,
  searchByPhoneNumber,
  updateReservation,
};