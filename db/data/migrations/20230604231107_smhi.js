/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  knex.schema.hasTable("smhi").then((exists) => {
    if(!exists) {
      return knex.schema
        .createTable("smhi", table => {
          table.string('device_id')
          table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
          table.timestamp("time")
          table.float("t", 5)
          table.float("h", 5)
          table.float("p", 5)
          table.float("wind_dir", 5)
          table.float("wind_speed", 5)
          table.float("radia_glob", 5)
          table.float("precip", 5)
          table.float("sun", 5)
          table.float("visibility", 5)
          table.unique(["device_id", "time"], {useConstraint: true})
        })
        .then(console.log("created table smhi"))
    }
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
