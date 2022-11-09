const express = require("express");
const app = express();
const bodyParser = require('body-parser');

// require database connection 
const dbConnect = require("./db/dbConnect");

// require data models
const Pasien = require("./db/pasienModel");

// execute database connection 
dbConnect();

// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

// endpoints
app.post("/register", (request, response) => {
  // initialize new Pasien object with params from the req
  const pasien = new Pasien({
    idPasien: request.body.idPasien,
    namaPasien: request.body.namaPasien,
  });

  // save the data
  pasien.save()
  .then((result) => {
    response.status(201).send({
      message: "Pasien registered successfully",
      result,
    });
  })
  .catch((error) => {
    response.status(500).send({
      message: "Error registering pasien",
      error,
    });
  })
});

module.exports = app;
