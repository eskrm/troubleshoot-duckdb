# Troubleshoot DuckDB

This program shows how the DuckDB Node.js library keeps an open file handle to a
database for some time after the database is **closed**. This prevents other
processes from opening a connection to the database due to the file lock
maintained by DuckDB.

To run:

```
npm i
npm run start
```
