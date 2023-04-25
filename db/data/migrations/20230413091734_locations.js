/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTableIfNotExists("locations", table => {
      table.specificType("geometry", "geometry(point, 4326)")
      table.string('device_type')
      table.string('device_id').primary()
    })

    .createTableIfNotExists("dmisensor", table => {
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
    })

    .createTableIfNotExists("smartcitizen", table => {
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
    })

    .createTableIfNotExists("wifilocations", table => {
      table.string('device_id').unique({useConstraint: true})
      table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
      table.varchar("city")
      table.varchar("name")
      table.varchar("zip")
      table.varchar("street")
      table.varchar("department")
      table.varchar("houseno")
    })

    .createTableIfNotExists("metdotno", table => {
      table.string('device_id').unique({useConstraint: true})
      table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
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
  //return knex.raw('DROP TABLE locations CASCADE')
};