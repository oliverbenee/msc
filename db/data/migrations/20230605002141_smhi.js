/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    knex.schema.hasTable("smhi").then((exists) => {
    if(!exists) {
      knex.schema
        .createTable("smhi", table => {
          table.string('device_id')
	        table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
          table.timestamp("time").defaultTo(knex.fn.now())
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
        .then(() => {knex.raw("ALTER TABLE smhi ADD CONSTRAINT unq_smhi_device_id_time UNIQUE(device_id, time)")}) // knex seems to specifically ignore this one's unique key constraint. this fixes it. 
        .then(console.log("the SMHI table has been created. Uniquely, it should not return a promise. "))
    }
  })  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
