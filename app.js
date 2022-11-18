const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// require database connection 
const dbConnect = require("./db/dbConnect");

// require data models
const Pasien = require("./db/pasienModel");
const Admin = require("./db/adminModel");

// execute database connection 
dbConnect();

// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

// ENDPOINTS SECTION

app.post("/patient/register", (request, response) => {
  // initialize new Pasien object with params from the req
  const pasien = new Pasien({
    idPasien: request.body.idPasien,
    namaPasien: request.body.namaPasien,
  });

  // save the data
  pasien.save()
  .then((result) => {
    response.status(201).send({
      message: "Pasien sukses terdaftar",
      result,
    });
  })
  .catch((error) => {
    response.status(500).send({
      message: "Terjadi masalah dalam mendaftarkan pasien",
      error,
    });
  })
});

app.get("/patient", (request, response) => {
  Pasien.findOne({ idPasien: request.body.idPasien })
  .then()
  .catch((e) => {
    response.status(404).send({
      message: "Tidak ada pasien dengan id tersebut ditemukan",
      e,
    })
  })
})

app.post("/admin/register", (request, response) => {
  // initialize new Admin object with params from the req
  const admin = new Admin({
    idAdmin: request.body.idAdmin,
    password: request.body.password,
    namaAdmin: request.body.namaAdmin,
  });

  // save the data
  admin.save()
  .then((result) => {
    response.status(201).send({
      message: "Admin sukses terdaftar",
      result,
    });
  })
  .catch((error) => {
    response.status(500).send({
      message: "Terjadi masalah dalam mendaftarkan Admin",
      error,
    });
  })
})

app.post("/admin/login", (request, response) => {
  Admin.findOne({ idAdmin: request.body.idAdmin })
  .then((admin) => {
    if(admin.password === request.body.password){
      // create token
      const token = jwt.sign(
        {
          idAdmin: admin.idAdmin,
          namaAdmin: admin.namaAdmin
        },
        "RANDOM_TOKEN",
        { expiresIn: "24h" }
      )

      // success response
      response.status(200).send({
        message: "Login berhasil",
        idAdmin: admin.idAdmin,
        namaAdmin: admin.namaAdmin,
        token,
      })
    }
    else {
      response.status(400).send({
        message: "ID dan Password tidak sesuai",
      })
    }
  })
  .catch((e) => {
    response.status(404).send({
      message: "Admin dengan ID tersebut tidak terdaftar",
      e,
    })
  })
})

module.exports = app;
