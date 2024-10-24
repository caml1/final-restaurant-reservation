const router = require("express").Router();
const controller = require("./reservations.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
  .route("/")
  .get(controller.list)  // List reservations
  .post(controller.create)  // Create a new reservation
  .all(methodNotAllowed);

router
  .route("/:reservation_id")
  .get(controller.read)  // Get reservation by ID
  .put(controller.update)  // Update reservation by ID
  .all(methodNotAllowed);

router
  .route("/:reservation_id/status")
  .put(controller.updateStatus)  // Update reservation status
  .all(methodNotAllowed);

module.exports = router;