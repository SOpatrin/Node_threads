import { threadId, workerData } from "worker_threads";
import * as fs from "fs";
import { pool } from "./db.js";
const { start, end } = workerData;

console.log(`worker${threadId} start`);

const client = await pool.connect();

const res = await client.query('select * from data offset $1 limit $2', [ start, end - start ]);

fs.writeFileSync(`./workers_output/output${threadId}.csv`, '', { flag: 'w+' });
fs.open(`./workers_output/output${threadId}.csv`, "a+",(err, fd) => {
    res.rows.forEach((row) => {
        const output = `${row.id},${threadId}\n`;
        fs.writeSync(fd, output);
        fs.fdatasync(fd, () => {});
    });

    fs.close(fd, () => {
        console.log(`worker${threadId} end`);
        process.exit(0);
    });
});
