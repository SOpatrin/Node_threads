import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'threads',
    password: 'qwerty',
    port: 5432,
});
