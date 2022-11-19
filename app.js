const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./auth")

// require database connection 
const dbConnect = require("./db/dbConnect");

// require data models
const Pasien = require("./db/pasienModel");
const Admin = require("./db/adminModel");
const Pemeriksaan = require("./db/pemeriksaanModel")
const HealthPoint = require("./db/healthPointModel")

// execute database connection 
dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

// ENDPOINTS SECTION

// REGISTER PEMERIKSAAN ON PASIEN
app.post("/patient/pemeriksaan/register", auth, (request, response) => {
  
})

// REGISTER PASIEN
app.post("/patient/register", auth, (request, response) => {
  // initialize new Pasien object with params from the req
  const pasien = new Pasien({
    idPasien: request.body.idPasien,
    namaPasien: request.body.namaPasien,
    tanggalLahir: request.body.tanggalLahir,
    alamat: request.body.alamat,
    gender: request.body.gender,
    keluhan: request.body.keluhan,
    riwayatPenyakit: request.body.riwayatPenyakit,
  });

  // save the data
  pasien.save()
  .then((result) => {
    response.status(201).send({
      message: "Pasien sukses terdaftar",
      result,
    });
    console.log("Pasien dengan ID: " + pasien.idPasien + " berhasil terdaftar")
  })
  .catch((error) => {
    console.log("Pasien dengan ID: " + pasien.idPasien + " gagal terdaftar")
    response.status(500).send({
      message: "Terjadi masalah dalam mendaftarkan pasien",
      error,
    });
  })
});

// GET ONE PASIEN
app.get("/patient", auth, (request, response) => {
  Pasien.findOne({ idPasien: request.body.idPasien })
  .then((result) => {
    response.status(200).send({
      message: "Pasien ditemukan",
      result,
    })
    console.log("Pasien ditemukan. ID: " + result.idPasien)
  })
  .catch((e) => {
    response.status(404).send({
      message: "Tidak ada pasien dengan id tersebut ditemukan",
      e,
    })
  })
})

// ADMIN ENDPOINTS SECTION
// REGISTER ADMIN
app.post("/admin/register", (request, response) => {
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // initialize new Admin object with params from the req
      const admin = new Admin({
        idAdmin: request.body.idAdmin,
        password: hashedPassword,
        namaAdmin: request.body.namaAdmin,
      });

      // save the data
      admin.save()
      .then((result) => {
        response.status(201).send({
          message: "Admin sukses terdaftar",
          result,
        });
        console.log("Admin " + result.namaAdmin + " berhasil terdaftar")
      })
      .catch((error) => {
        console.log("Gagal mendaftarkan admin")
        response.status(500).send({
          message: "Terjadi masalah dalam mendaftarkan Admin",
          error,
        });
      })
    })
    // catch error if password hash failed
    .catch((error) => {
      response.status(500).send({
        message: "Gagal enkripsi password",
        error,
      });
    });
})

// LOGIN ADMIN
app.post("/admin/login", (request, response) => {
  Admin.findOne({ idAdmin: request.body.idAdmin })
  .then((result) => {
    bcrypt.compare(request.body.password, result.password)
    .then((passwordCheck) => {
      if(!passwordCheck) {
        return response.status(400).send({
          message: "Password tidak sesuai",
          error,
        })
      }

      // create token
      const token = jwt.sign(
        {
          idAdmin: result._id,
          namaAdmin: result.namaAdmin,
        },
        "RANDOM-TOKEN",
        { expiresIn: "24h" }
      )

      //   return success response
      response.status(200).send({
        message: "Login berhasil",
        idAdmin: result.idAdmin,
        namaAdmin: result.namaAdmin,
        token,
      })
      console.log("Admin ditemukan. ID: " + result.idAdmin)
      console.log("Selamat datang " + result.namaAdmin)
    })
    .catch((error) => {
      console.log("Password tidak sesuai")
      response.status(400).send({
        message: "Password tidak sesuai",
        error,
      })
    })
  })
  .catch((error) => {
    console.log("Admin dengan ID tersebut tidak ditemukan")
    response.status(404).send({
      message: "Admin dengan ID tersebut tidak terdaftar",
      error,
    })
  })
})

module.exports = app;
