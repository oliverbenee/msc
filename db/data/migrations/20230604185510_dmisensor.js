/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  knex.schema.hasTable("dmisensor").then((exists) => {
    if (!exists) {
      return knex.schema
        .createTable("dmisensor", table => {
          table.string('device_id') //.unique({ useConstraint: true })
          table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
          table.timestamp("time").defaultTo(knex.fn.now())
          table.float("t", 5)
          table.float("h", 5)
          table.float("p", 5)
          table.float("radia_glob", 5)
          table.float("wind_dir", 5)
          table.float("wind_speed", 5)
          table.float("precip", 5)
          table.float("sun", 5)
          table.integer("visibility")
          table.json("json")
          table.unique(['device_id', "time"], {useConstraint: true})
        })
        .then(console.log("created dmisensor if it didn't exist. "))
    }
  })  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
