/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  knex.schema.hasTable("wifilocations").then((exists) => {
    if (!exists) {
      return knex.schema
        .createTable("wifilocations", table => {
          table.string('device_id').unique({
            useConstraint: true
          })
          table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
          table.varchar("city")
          table.varchar("name")
          table.varchar("zip")
          table.varchar("street")
          table.varchar("department")
          table.varchar("houseno")
        })
        .then(console.log("created wifilocations if it didn't exist. "))
    }
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
