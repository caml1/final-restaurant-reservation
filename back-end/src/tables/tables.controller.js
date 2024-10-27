const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

// Middleware for Validations and Existence Checks

/**
 * Middleware to check if a reservation exists based on reservation_id.
 * If the reservation exists, it is stored in response.locals.
 */
async function reservationExists(request, response, next) {
    const { reservation_id } = request.body.data;
    const found = await reservationsService.read(reservation_id);

    if (!found) {
        return next ({ status: 404, message: `Reservation ${reservation_id} does not exist` });
    }

    response.locals.reservation = found;
    next();
}

/**
 * Middleware to check if a table exists based on table_id.
 * If the table exists, it is stored in response.locals.
 */
async function tableExists(request, response, next) {
    const { table_id } = request.params;
    const found = await service.read(table_id);

    if (!found) {
        return next({ status: 404, message: `Table number ${table_id} does not exist` });
    }

    response.locals.table = found;
    next();
}

/**
 * Middleware to validate the table name length.
 * Ensures table_name is more than 1 character.
 */
async function validTableName(request, response, next) {
    const { table_name } = request.body.data;
    if (table_name.length <= 1) {
        next({
            status: 400,
            message: `table_name is invalid. Table name must be longer than 1 character`
        });
    }
    next();
}

/**
 * Middleware to validate table capacity.
 * Ensures capacity is a positive number.
 */
async function validCapacity(request, response, next) {
    const { capacity } = request.body.data;
    if (capacity <= 0 || typeof capacity !== "number") {
        next({
            status: 400,
            message: `capacity must be a number greater than 0.`
        });
    }
    next();
}

/**
 * Middleware to check if a table is occupied.
 * Throws an error if the table is already occupied.
 */
async function isOccupied(request, response, next) {
    if (response.locals.table.reservation_id) {
        next({ status: 400, message: "Table is occupied" });
    }
    next();
}

/**
 * Middleware to check if a table is not occupied.
 * Throws an error if the table is not occupied.
 */
async function isNotOccupied(request, response, next) {
    if (!response.locals.table.reservation_id) {
        next({
            status: 400,
            message: "Table is not occupied."
        });
    }
    next();
}

/**
 * Middleware to check if a reservation is already seated.
 * Throws an error if the reservation is already seated.
 */
async function isSeated(request, response, next) {
    if (response.locals.reservation.status === "seated") {
        next({ status: 400, message: "Reservation is already seated" });
    }
    next();
}

/**
 * Middleware to validate if a table can seat the party.
 * Ensures that the table capacity is sufficient for the reservation party size.
 */
async function validSeating(request, response, next) {
    if (response.locals.reservation.people > response.locals.table.capacity) {
        next({
            status: 400,
            message: "Table capacity cannot fit this party."
        });
    }
    next();
}

// CRUD Handlers for Tables

/**
 * Handler to list all tables.
 * Returns a JSON response with all tables.
 */
async function list(request, response) {
    const data = await service.list();
    response.status(200).json({ data });
}

/**
 * Handler to read a table from response.locals and send it in the response.
 */
async function read(request, response) {
    const data = response.locals.table;
    response.status(200).json({ data });
}

/**
 * Handler to create a new table.
 * Sends back the created table with a 201 status.
 */
async function create(request, response) {
    const { data: newData = {} } = request.body;
    const data = await service.create(newData);
    response.status(201).json({ data });
}

/**
 * Handler to update a table with a reservation.
 * Sets the table status to "occupied" and reservation status to "seated".
 */
async function update(request, response) {
    const { table, reservation } = response.locals;
    table.reservation_id = reservation.reservation_id;
    table.status = "occupied";
    reservation.status = "seated";

    const updatedTable = await service.update(table);
    const updatedReservation = await reservationsService.update(reservation, table);
    response.json({ data: [updatedTable, updatedReservation] });
}

/**
 * Handler to clear a reservation from a table.
 * Sets table status to "free" and reservation status to "finished".
 */
async function destroy(request, response) {
    const { table } = response.locals;
    const reservation = await reservationsService.read(table.reservation_id);
    table.reservation_id = null;
    table.status = "free";
    reservation.status = "finished";

    const finishedTable = await service.update(table);
    const finishedReservation = await reservationsService.update(reservation, table);

    response.status(200).json({ data: [finishedReservation, finishedTable] });
}

// Exports with Middleware and Validation

module.exports = {
    list: asyncErrorBoundary(list),
    read: [
        asyncErrorBoundary(tableExists),
        asyncErrorBoundary(read),
    ],
    create: [
        hasProperties("table_name"),
        hasProperties("capacity"),
        asyncErrorBoundary(validCapacity),
        asyncErrorBoundary(validTableName),
        asyncErrorBoundary(create),
    ],
    update: [
        hasProperties("reservation_id"),
        asyncErrorBoundary(reservationExists),
        asyncErrorBoundary(tableExists),
        asyncErrorBoundary(isSeated),
        asyncErrorBoundary(isOccupied),
        asyncErrorBoundary(validSeating),
        asyncErrorBoundary(update)
    ],
    delete: [
        asyncErrorBoundary(tableExists),
        asyncErrorBoundary(isNotOccupied),
        asyncErrorBoundary(destroy)
    ],
};