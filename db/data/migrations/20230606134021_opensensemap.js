/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  knex.schema.hasTable("opensensemap").then((exists) => {
    if (!exists) {
      return knex.schema
        .createTable("opensensemap", table => {
          table.string('device_id')
          table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
          table.timestamp("time").defaultTo(knex.fn.now())
          table.text('description', "longtext")
          table.string('exposure')
          table.string('name')
          table.string('model')
          table.float("t", 5)
          table.float("h", 5)
          table.float("p", 5)
          table.float("wind_dir", 5)
          table.float("mP2", 5)
          table.float("mPX", 5)
          table.float("l", 5)
          table.float("precip", 5)
          table.float("wind_speed", 5)
          table.json("json")
          table.unique(["device_id", "time"], {useConstraint: true})
        })
        .then(console.log("created opensensemap if it didn't exist. "))
        .then(knex.raw("ALTER TABLE opensensemap ADD CONSTRAINT unq_opensensemap_device_id_time UNIQUE(device_id, time)")
        .then(console.log("and added the constraint? (check it in pgAdmin just in case)")))
    }
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
