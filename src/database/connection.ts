//require mongoose module
import mongoose from "mongoose";

//require chalk module to give colors to console text
import chalk from "chalk";

//require database URL from properties file
import { Db } from "../config/dbConfig";

const connected = chalk.bold.cyan;
const error = chalk.bold.yellow;
const disconnected = chalk.bold.red;
const termination = chalk.bold.magenta;

//export this function and imported by server.js
export function dbConnect() {
  mongoose.connect(Db.url, {
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
  });

  mongoose.connection.on("connected", function () {
    console.log(connected("Mongoose default connection is open to ", Db.url));
  });

  mongoose.connection.on("error", function (err) {
    console.log(
      error("Mongoose default connection has occured " + err + " error")
    );
  });

  mongoose.connection.on("disconnected", function () {
    console.log(disconnected("Mongoose default connection is disconnected"));
  });

  process.on("SIGINT", function () {
    console.log(termination("closing the connection"));
    mongoose.connection.close();
  });
}
