import { threadId, workerData } from "worker_threads";
import * as fs from "fs";
import { pool } from "./db.js";
const { start, end } = workerData;

console.log(`worker${threadId} start`);

const client = await pool.connect();

const res = await client.query('select * from data offset $1 limit $2', [ start, end - start ]);

let output = '';
res.rows.forEach((row) => {
    output += `${row.id},${threadId}\n`;
});

fs.writeFileSync(`./workers_output/output${threadId}.csv`, output, { flag: 'w+' });

console.log(`worker${threadId} end`);
process.exit(0);
