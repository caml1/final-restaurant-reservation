/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");

// POST /reservations to create a new reservation
router.route("/")
  .get(controller.list) // List reservations for a given date
  .post(controller.create); // Create a new reservation

module.exports = router;
