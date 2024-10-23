exports.seed = function (knex) {
  return knex("tables").del()
    .then(function () {
      return knex("tables").insert([
        { table_name: "Bar #1", capacity: 1, created_at: new Date(), updated_at: new Date() },
        { table_name: "Bar #2", capacity: 1, created_at: new Date(), updated_at: new Date() },
        { table_name: "#1", capacity: 6, created_at: new Date(), updated_at: new Date() },
        { table_name: "#2", capacity: 6, created_at: new Date(), updated_at: new Date() },
      ]);
    });
};