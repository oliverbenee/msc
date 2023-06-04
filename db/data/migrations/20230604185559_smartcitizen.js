/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  knex.schema.hasTable("smartcitizen").then((exists) => {
    if (!exists) {
      return knex.schema
        .createTable("smartcitizen", table => {
          table.string('device_id') //.unique({ useConstraint: true })
          table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
          table.timestamp("time").defaultTo(knex.fn.now())
          table.float("l", 5)
          table.float("nA", 5)
          table.float("t", 5)
          table.float("h", 5)
          table.float("p", 5)
          table.float("mP1", 5)
          table.float("mP2", 5)
          table.float("mPX", 5)
          table.float("eCO2", 5)
          table.float("TVOC", 5)
          table.unique(["device_id", "time"], {useConstraint: true})
        })
        .then(console.log("created smartcitizen if it didn't exist. "))
    }
  })  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
