import { pool } from "./db.js";
import { Worker } from "worker_threads";

console.time('time');
console.log('start');

const client = await pool.connect();

const THREADS_NUMBER = 10;
const res = await client.query('select count(*) from data');
const rows = Number(res.rows[0].count);
const isFlush = process.env.FLUSH?.toUpperCase() === 'TRUE';
const workerPath = isFlush ? './workerWithFlush.js' : './worker.js';

isFlush && console.log('Flush mode enabled, it will be slow...');

// Create workers and give shared buffer for storing current row number
const workers = [];
const buffer = new SharedArrayBuffer(4);
buffer[0] = 0;

for (let i = 1; i <= THREADS_NUMBER; i++) {
    workers.push(new Worker(workerPath, { workerData: { buffer, rows } }));
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
