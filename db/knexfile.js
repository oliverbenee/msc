/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: 'postgres',
      user: 'postgres',
      password: 'g37TbukJZ',
    },
    dialect: "postgres",
    migrations: { 
      directory: './data/migrations' 
    },
    seeds: {directory: './data/seeds'},
    useNullAsDefault: true
  }
};
