/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries.
  // Note, that this is working,yes. That's how you lost the cityprobes. 
  return knex('locations').insert([
      {geometry: '0101000020E6100000CE88D2DEE08352406ADE718A8EDC4CC0', device_type: "TEST", device_id: "1"},
      {geometry: '0101000020E6100000CE88D2DEE08352406ADE718A8EDC4CC1', device_type: "TEST", device_id: "06108"},
      {geometry: '0101000020E6100000CE88D2DEE08352406ADE718A8EDC4CC2', device_type: "TEST", device_id: "3"}
    ])
    .onConflict("device_id").ignore()
    .then(() => {return knex('dmisensor').insert([
        {device_id: "1", time: "2023-01-01 00:00:00", t: 5.0, h: 1.0, p: 1004.7, radia_glob: 100.5, wind_dir: 9, wind_speed: 6.9, precip: 1.337, sun: 10000, visibility: 50000},
        {device_id: "06108", time: "2023-04-14 15:41:00", t: 8.0, h: 78, p: 1011.3, wind_dir:140, wind_speed: 5.7, visibility: 13000, json: {"cloud_height": 2600}}
      ])
    })
    .then(() => {return knex('smartcitizen').insert([
        {device_id: "3", time: "2023-01-01 00:00:00", l: 5000, nA: 100.1, t: 6, h: 70.1, p: 100.2, mP2: 54, mPX: 56, mP1: 56, eCO2: 55, TVOC: 99}
    ])
    })
};