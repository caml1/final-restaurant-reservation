const router = require("express").Router();
const controller = require("./reservations.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// Route to handle creating new reservations and listing reservations
router.route("/")
  .post(controller.create)
  .all(methodNotAllowed);

// Route to handle updating a reservation and fetching a single reservation by ID
router.route("/:reservation_id")
  .get(controller.read)
  .put(controller.update)  // Ensure `controller.update` is properly defined
  .all(methodNotAllowed);

// Route to handle updating the status of a reservation
router.route("/:reservation_id/status")
  .put(controller.updateStatus)  // Ensure `controller.updateStatus` is properly defined
  .all(methodNotAllowed);

module.exports = router;