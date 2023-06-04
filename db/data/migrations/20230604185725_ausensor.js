/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  knex.schema.hasTable("ausensor").then((exists) => {
    if (!exists) {
      knex.schema
        .createTable("ausensor", table => {
          table.string('device_id')
          table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
          table.timestamp("time").defaultTo(knex.fn.now())
          table.float("no2", 5)
          table.float("nox", 5)
          table.float("co", 5)
          table.float("so2", 5)
          table.float("mP2", 5)
          table.float("mPX", 5)
          table.json("json")
          table.unique(["device_id", "time"], {useConstraint: true})
        })
        .then(console.log("created ausensor if it didn't exist. "))
    }
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
