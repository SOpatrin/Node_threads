import { pool } from "./db.js";
import { Worker } from "worker_threads";

console.time('time');
console.log('start');

const client = await pool.connect();

const res = await client.query('select count(*) from data');
const rows = Number(res.rows[0].count);
const threads = 10;
const isFlush = process.env.FLUSH?.toUpperCase() === 'TRUE';
const workerPath = isFlush ? './workerWithFlush.js' : './worker.js';

isFlush && console.log('Flush mode enabled, it will be slow...');

// Create workers and give them window for reading in db
const workers = [];

let start;
let end = rows;
for (let i = 1; i <= threads; i++) {
    // First worker read last (rows / threads) rows etc
    start = rows - (i * Math.floor((rows / threads)));

    // If rows not divisible by threads last worker will receive remaining
    if (i === threads) {
        start = 0;
    }

    workers.push(new Worker(workerPath, { workerData: { start, end } }));

    end = start;
}

// Wait when workers will do their work
workers.forEach((worker) => {
    worker.on('exit', () => {
        workers.splice(workers.indexOf(worker), 1);
        if (workers.length === 0) {
            pool.end();
            console.log('end')
            console.timeEnd('time');
            process.exit(0);
        }
    });
});
