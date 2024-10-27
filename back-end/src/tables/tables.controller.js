const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

async function reservationExists(request, response, next) {
    const { reservation_id } = request.body.data;
    const found = await reservationsService.read(reservation_id);

    if (!found) {
        return next ({ status: 404, message: `Reservation ${reservation_id} does not exist` });
    }

    response.locals.reservation = found;
    next();
}

async function tableExists (request, response, next) {
    const { table_id } = request.params;
    const found = await service.read(table_id);

    if (!found) {
        return next({ status: 404, message: `table number ${table_id} does not exist` });
    }

    response.locals.table = found;

    next();
}

async function validTableName(request, response, next) {
    const { table_name } = request.body.data;
    if(table_name.length <= 1){
      next({
        status: 400,
        message: `table_name is invalid. Table name must be longer than 1 character`
      })
    }
    next();
}

async function validCapacity(request, response, next){
    const { capacity } = request.body.data;
    if(capacity <= 0 || typeof capacity !== "number"){
      next({
        status: 400,
        message: `capacity must be a number greater than 0.`
      })
    }
    next();
}

async function isOccupied (request, response, next) {
    if (response.locals.table.reservation_id) {
        next ({ status: 400, message: "Table is occupied" });
    }

    next();
}

async function isNotOccupied(request, response, next){
    if(!response.locals.table.reservation_id){
      next({
        status: 400,
        message: "Table is not occupied."
      })
    }
    next();
}

async function isSeated(request, response, next) {
    if (response.locals.reservation.status === "seated") {
        next ({ status: 400, message: "Reservation is already seated" });
    }

    next();
}

async function validSeating(request, response, next){
    if(response.locals.reservation.people > response.locals.table.capacity){
      next({
        status: 400,
        message: "Table capacity cannot fit this party."
      })
    }
    next();
  }

async function list(request, response) {
    const data = await service.list();

    response.status(200).json({ data });
}

async function read(request, response) {
    const data = response.locals.table;
    response.status(200).json({ data });
  }

  async function create(request, response) {
    const { data: newData = {} } = request.body;
    const data = await service.create(newData);
    response.status(201).json({ data });
  }

  async function update(request, response) {
    const { table, reservation } = response.locals;
    table.reservation_id = reservation.reservation_id;
    table.status = "occupied";
    reservation.status = "seated";
  
    const updatedTable = await service.update(table);
    const updatedReservation = await reservationsService.update(reservation, table)
    response.json({data: [updatedTable, updatedReservation]});
  }

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
}