import knex from "knex";

const db = knex({
  client: "sqlite3",
  useNullAsDefault: true,
});

export default db;
