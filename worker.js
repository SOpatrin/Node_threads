import { threadId, workerData } from "worker_threads";
import * as fs from "fs";
import { pool } from "./db.js";
const { buffer, rows } = workerData;

console.log(`worker${threadId} start`);

const MAX_ROWS_READ = 10000;
const rowNumber = new Int32Array(buffer);

const client = await pool.connect();

let output = '';

// Read data
while (Atomics.load(rowNumber, 0) <= rows) {
    const res = await client.query('select * from data offset $1 limit $2', [
        Atomics.add(rowNumber, 0, MAX_ROWS_READ),
        MAX_ROWS_READ
    ]);
    res.rows.forEach(({ id }) => {
        output += `${id},${threadId}\n`;
    });
}

fs.writeFileSync(`./workers_output/output${threadId}.csv`, output, { flag: 'w+' });

console.log(`worker${threadId} end`);
process.exit(0);
