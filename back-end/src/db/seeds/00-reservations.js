const reservations = require("./00-reservations.json");

exports.seed = function (knex) {
  // Truncate the table and restart identity
  return knex.raw("TRUNCATE TABLE reservations RESTART IDENTITY CASCADE")
    .then(function () {
      // Inserts seed entries
      return knex("reservations").insert(reservations);
    });
};