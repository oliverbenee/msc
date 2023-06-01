/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const knexPostgis = require('knex-postgis')

exports.up = function (knex) {
  const st = knexPostgis(knex)
  knex.schema.hasTable("locations").then((exists) => {
    if (!exists) {
      knex.schema
        .createTable("locations", table => {
          table.specificType("geometry", "geometry(point, 3857)")
          table.string('device_type')
          table.string('device_id').primary()
        })
        .then(console.log("created locations if it didn't exist. "))
    }
  })
  
  knex.schema.hasTable("dmisensor").then((exists) => {
    if (!exists) {
      knex.schema
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
  
  knex.schema.hasTable("smartcitizen").then((exists) => {
    if (!exists) {
      knex.schema
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
  
  knex.schema.hasTable("wifilocations").then((exists) => {
    if (!exists) {
      knex.schema
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
  
  knex.schema.hasTable("metdotno").then((exists) => {
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
  
  knex.schema.hasTable("ausensor").then((exists) => {
    if (!exists) {
      knex.schema
        .createTable("ausensor", table => {
          table.string('device_id')
          table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
          table.timestamp("time").defaultTo(knex.fn.now())
          table.float("no2", 5)
          table.float("nox", 5)
          table.float("co", 5)
          table.float("so2", 5)
          table.float("mP2", 5)
          table.float("mPX", 5)
          table.json("json")
          table.unique(["device_id", "time"], {useConstraint: true})
        })
        .then(console.log("created ausensor if it didn't exist. "))
    }
  })

  knex.schema.hasTable("open-meteo").then((exists) => {
    if(!exists) {
      knex.schema
        .createTable("open-meteo", table => {
          table.string("device_id")
          table.foreign("device_id").references("device_id").inTable("locations").onDelete("CASCADE")
          table.timestamp("time")
          table.float("t", 5)
          table.float("h", 5)
          table.float("precip", 5)
          table.float("p", 5)
          table.integer("visibility")
          table.float("wind_speed", 5)
          table.float("wind_dir", 5)
          table.unique(["device_id", "time"], {useConstraint: true})
        })
        .then(console.log("created table open-meteo"))
    }
  })
  console.log("all done.")

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