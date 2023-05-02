require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const mysql = require("mysql2/promise");
const { DataSource } = require("typeorm");

const dataSource = new DataSource({
  type: process.env.DB_CONNECTION,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

dataSource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized!");

    // Read the CSV file
    const rows = [];
    fs.createReadStream("data.csv")
      .pipe(csv())
      .on("data", (data) => {
        rows.push(data);
      })
      .on("end", async () => {
        // Connect to the MySQL database
        const connection = await mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
        });

        // Insert the rows into the database
        for (const row of rows) {
          await connection.query(`INSERT INTO table_name (column1, column2, ...) VALUES (?, ?, ...)`, [
            row.column1, row.column2, ...
          ]);
        }

        // Close the database connection
        await connection.end();

        console.log("Data has been inserted into the database!");
      });
  })
  .catch((err) => {
    console.log("Error occurred during Data Source initialization", err);
    dataSource.destroy();
  });
