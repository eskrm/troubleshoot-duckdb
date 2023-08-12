import {exec} from 'child_process';
import {Database, OPEN_READWRITE} from 'duckdb-async';
import fs from 'fs-extra';
import path from 'path';
import pino from 'pino';

const logger = pino({transport: {target: 'pino-pretty'}});

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const databasePath = path.join(__dirname, 'data', 'test.db');
  const pathExists = await fs.pathExists(databasePath);
  if (pathExists) {
    await fs.remove(databasePath);
  }
  await fs.mkdirp(path.dirname(databasePath));

  const db = await Database.create(databasePath, OPEN_READWRITE);
  logger.info('Database.create(%s)', databasePath);
  try {
    await db.exec('create table foo(bar int)');
  } finally {
    await db.close();
    logger.info('Database.close(%s)', databasePath);
  }

  let fileOpen = true;
  do {
    exec(`lsof ${databasePath}`, (err, stdout) => {
      if (err?.code === 1) {
        fileOpen = false;
        logger.info('Database file closed');
      } else {
        logger.info('Database file still open. Details:\n%s', stdout);
      }
    });
    await sleep(1_000);
  } while (fileOpen);
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
