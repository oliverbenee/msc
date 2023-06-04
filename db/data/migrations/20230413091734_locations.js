/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
  knex.schema.hasTable("locations").then((exists) => {
    if (!exists) {
      return knex.schema
        .createTable("locations", table => {
          table.specificType("geometry", "geometry(point, 3857)")
          table.string('device_type')
          table.string('device_id').primary()
        })
        .then(console.log("created locations if it didn't exist. "))
    }
  })
  
  /*
  .createTableIfNotExists("cityprobe2", table => {
    table.string('device_id').unique({useConstraint: true})
    table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
    table.timestamp("time").defaultTo(knex.fn.now())
    table.float("aPS", 4)
    table.float("b", 5)
    table.float("h", 5)
    table.float("l", 5)
    table.float("mP1", 5)
    table.float("mP2", 5)
    table.float("mP4", 5)
    table.float("mPX", 5)
    table.float("nA", 5)
    table.float("nMa", 5)
    table.float("nMi", 5)
    table.float("nS", 5)
    table.float("nP1", 5)
    table.float("nP2", 5)
    table.float("nP4", 5)
    table.float("nPX", 5)
    table.float("p", 5)
    table.float("t", 5)
  })
  */
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw("drop table knex_migrations, knex_migrations_lock")
  //return knex.raw('DROP TABLE locations CASCADE')
};