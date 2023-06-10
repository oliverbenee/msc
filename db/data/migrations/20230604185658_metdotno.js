/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.hasTable("metdotno").then((exists) => {
    if (!exists) {
      knex.schema
        .createTable("metdotno", table => {
          table.string('device_id')
          table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
          table.timestamp("time").defaultTo(knex.fn.now())
          table.varchar('name')
          table.varchar('municipality')
          table.float('height') // one station has a height of 3.5, the rest only 3.
          table.float("t", 5)
          table.float("h", 5)
          table.float("wind_speed", 5)
          table.float("wind_dir", 5)
          table.float("p", 5)
          table.float("precip", 5)
          table.json("json")
          table.unique(["device_id", "time"], {useConstraint: true})
        })
        .then(console.log("created metdotno if it didn't exist. "))
    }
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
