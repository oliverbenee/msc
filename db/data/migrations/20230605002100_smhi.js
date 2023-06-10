/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    knex.schema.hasTable("smhi").then((exists) => {
    if(!exists) {
      return knex.schema
      .createTable("smhi", table => {
        table.string("device_id")
        table.timestamp("time")
        table.float("t", 5)
        table.float("h", 5)
        table.float("p", 5)
        table.float("precip", 5)
        table.float("sun", 5)
        table.integer("visibility")
        table.float("wind_speed", 5)
        table.float("wind_dir", 5)
        table.float("radia_glob", 5)
        table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
      })
      .then(console.log("table created."))
      .then(() => {return knex.raw("ALTER TABLE smhi ADD CONSTRAINT unq_smhi_device_id_time UNIQUE(device_id, time)")}) // knex seems to specifically ignore this one's unique key constraint. this fixes it. 
      .then(console.log("and added the constraint? (check it in pgAdmin just in case)"))
    }
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
