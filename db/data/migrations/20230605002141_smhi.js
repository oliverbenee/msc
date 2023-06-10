/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function(knex) {
  knex.schema.hasTable("smhi").then((exists) => {
    if(!exists) {
      return knex.raw("ALTER TABLE smhi ADD CONSTRAINT unq_smhi_device_id_time UNIQUE(device_id, time)")
        .then(console.log("and added the constraint? (check it in pgAdmin just in case)"))
    }
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  //.then(() => {knex.debug().raw("ALTER TABLE smhi ADD CONSTRAINT unq_smhi_device_id_time UNIQUE(device_id, time)")}) // knex seems to specifically ignore this one's unique key constraint. this fixes it. 
};
