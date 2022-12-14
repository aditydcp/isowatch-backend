const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./auth")
const Pusher = require('pusher')
const mongoose = require('mongoose')
require('dotenv').config()

// configure Pusher object
const pusher = new Pusher({
  appId: process.env.app_id,
  key: process.env.key,
  secret: process.env.secret,
  cluster: process.env.cluster,
  encrypted: true,
})
const channel = 'healthpoints'

// require database connection 
const dbConnect = require("./db/dbConnect");

// require data models
const Pasien = require("./db/pasienModel");
const Admin = require("./db/adminModel");
const Pemeriksaan = require("./db/pemeriksaanModel")
const HealthPoint = require("./db/healthPointModel")

// execute database connection 
dbConnect();

// once database is connected, watch for changes on HealthPoints collection
const db = mongoose.connection
db.once('open', () => {
  const hpCollection = db.collection('healthpoints')
  const changeStream = hpCollection.watch()

  changeStream.on('change', (change) => {
    console.log(change);
    
    if(change.operationType === 'insert') {
      const healthpoint = change.fullDocument;
      pusher.trigger(
        channel,
        'inserted', 
        {
          idPemeriksaan: healthpoint.idPemeriksaan,
          timestamp: healthpoint.timestamp,
          heartRate: healthpoint.heartRate,
          diastolicBloodPressure: healthpoint.diastolicBloodPressure,
          sistolicBloodPressure: healthpoint.sistolicBloodPressure,
          bloodOxygen: healthpoint.bloodOxygen,
        }
      )
    }
  })
})

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

// REGISTER HEALTH POINT ON PEMERIKSAAN
app.post("/patient/pemeriksaan/healthpoint", (request, response) => {
  // initialize new Pemeriksaan object with params from the req
  const healthPoint = new HealthPoint({
    idPemeriksaan: request.body.idPemeriksaan,
    timestamp: request.body.timestamp,
    heartRate: request.body.heartRate,
    diastolicBloodPressure: request.body.diastolicBloodPressure,
    sistolicBloodPressure: request.body.sistolicBloodPressure,
    bloodOxygen: request.body.bloodOxygen,
  })

  // save the data
  healthPoint.save()
  .then((result) => {
    response.status(201).send({
      message: "Titik data berhasil dimasukkan",
      result,
    });
    console.log("[" + healthPoint.timestamp + "] Data masuk")
  })
  .catch((error) => {
    console.log("Titik data gagal dimasukkan")
    response.status(500).send({
      message: "Terjadi masalah dalam memasukkan data",
      error,
    });
  })
})

// GET ONE LATEST HEALTH POINT ON PEMERIKSAAN
app.get("/patient/pemeriksaan/:id/latest-healthpoint", auth, (request, response) => {
  Pemeriksaan.findOne({ idPemeriksaan: request.params.id })
  .then((pemeriksaan) => {
    HealthPoint.find({ idPemeriksaan: pemeriksaan.idPemeriksaan})
    .sort({ timestamp: -1 }).limit(1)
    .then((result) => {
      response.status(200).send({
        message: "Health Point terbaru didapatkan",
        result,
      })
    })
    .catch((error) => {
      response.status(404).send({
        message: "Health Point tidak ditemukan dalam sesi pemeriksaan tersebut",
        error,
      })
    })
  })
  .catch((e) => {
    response.status(404).send({
      message: "Tidak ada sesi pemeriksaan dengan id tersebut ditemukan",
      e,
    })
  })
})

// GET 20 HEALTH POINTS ON PEMERIKSAAN
app.get("/patient/pemeriksaan/:id/healthpoint", auth, (request, response) => {
  Pemeriksaan.findOne({ idPemeriksaan: request.params.id })
  .sort({ timestamp: -1 }).limit(20)
  .then((pemeriksaan) => {
    HealthPoint.find({ idPemeriksaan: pemeriksaan.idPemeriksaan})
    .then((result) => {
      response.status(200).send({
        message: "Health Point didapatkan",
        result,
      })
    })
    .catch((error) => {
      response.status(404).send({
        message: "Health Point tidak ditemukan dalam sesi pemeriksaan tersebut",
        error,
      })
    })
  })
  .catch((e) => {
    response.status(404).send({
      message: "Sesi pemeriksaan tidak ditemukan",
      e,
    })
  })
})

// REGISTER PEMERIKSAAN
app.post("/patient/pemeriksaan/add", (request, response) => {
  // get the current total (assumming no deletion) of pemeriksaan
  Pemeriksaan.find()
  .then((result) => {
    // add overhead "0" and increment the number
    let newId = "0" + (result.length + 1).toString()

    // initialize new Pemeriksaan object with params from the req
    const pemeriksaan = new Pemeriksaan({
      idPemeriksaan: newId,
      tanggalMulai: request.body.tanggalMulai,
    })

    // save the data
    pemeriksaan.save()
    .then((result) => {
      response.status(201).send(result);
      console.log("Sesi pemeriksaan " + pemeriksaan.idPemeriksaan + " pada pasien " + pemeriksaan.idPasien + " berhasil dibuat")
    })
    .catch((error) => {
      console.log("Sesi pemeriksaan gagal dibuat")
      response.status(500).send({
        message: "Terjadi masalah dalam membuat sesi pemeriksaan",
        error,
      });
    })
  })
  .catch((error) => {
    console.log("Sesi pemeriksaan gagal dibuat")
    response.status(500).send({
      message: "Terjadi masalah dalam membuat sesi pemeriksaan",
      error,
    });
  })
})

// GET ALL PEMERIKSAAN
app.get("/patient/pemeriksaan/", auth, (request, response) => {
  Pemeriksaan.find()
  .then((result) => {
    response.status(200).send({
      message: "Pemeriksaan didapatkan",
      result,
    })
    console.log("Pemeriksaan didapatkan")
  })
  .catch((error) => {
    console.log("Tidak ada sesi pemeriksaan")
    response.status(404).send({
      message: "Tidak ada sesi pemeriksaan",
      error,
    })
  })
})

// GET PEMERIKSAAN BY ID
app.get("/patient/pemeriksaan/:id", auth, (request, response) => {
  Pemeriksaan.findOne({ idPemeriksaan: request.params.id })
  .then((result) => {
    response.status(200).send({
      message: "Pemeriksaan " + result.idPemeriksaan + " ditemukan",
      result,
    })
    console.log("Pemeriksaan ditemukan. ID: " + result.idPasien)
  })
  .catch((e) => {
    console.log("Pemeriksaan dengan ID: " + request.idPasien + " tidak ditemukan")
    response.status(404).send({
      message: "Tidak ada sesi pemeriksaan dengan id tersebut ditemukan",
      e,
    })
  })
})

// GET ALL ACTIVE PEMERIKSAAN
app.get("/patient/active-pemeriksaan", auth, (request, response) => {
  Pemeriksaan.find({ tanggalSelesai: null })
  .then((result) => {
    response.status(200).send({
      message: "Pemeriksaan aktif ditemukan",
      result,
    })
    console.log("Pemeriksaan aktif ditemukan")
  })
  .catch((e) => {
    response.status(404).send({
      message: "Tidak ada sesi pemeriksaan aktif ditemukan",
      e,
    })
  })
})

// GET ACTIVE PEMERIKSAAN BY PASIEN
app.get("/patient/:id/active-pemeriksaan", auth, (request, response) => {
  Pasien.findOne({ idPasien: request.params.id })
  .then((pasien) => {
    Pemeriksaan.find({ idPasien: pasien.idPasien, tanggalSelesai: null })
    .then((result) => {
      response.status(200).send({
        message: "Pemeriksaan aktif ditemukan pada pasien " + pasien.idPasien,
        result,
      })
      console.log("Pemeriksaan aktif ditemukan pada pasien " + pasien.idPasien)
    })
    .catch((e) => {
      response.status(404).send({
        message: "Tidak ada sesi pemeriksaan aktif ditemukan pada pasien " + pasien.idPasien,
        e,
      })
    })
  })
  .catch((e) => {
    response.status(404).send({
      message: "Tidak ada pasien dengan id tersebut ditemukan",
      e,
    })
  })
})

// GET ACTIVE PEMERIKSAAN BY ADMIN
app.get("/admin/:id/active-pemeriksaan", auth, (request, response) => {
  Admin.findOne({ idAdmin: request.params.id })
  .then((admin) => {
    Pemeriksaan.find({ idAdmin: admin.idAdmin, tanggalSelesai: null })
    .then((result) => {
      response.status(200).send({
        message: "Pemeriksaan aktif ditemukan pada admin " + admin.idAdmin,
        result,
      })
      console.log("Pemeriksaan aktif ditemukan pada admin " + admin.idAdmin)
    })
    .catch((e) => {
      response.status(404).send({
        message: "Tidak ada sesi pemeriksaan aktif ditemukan pada admin " + admin.idAdmin,
        e,
      })
    })
  })
  .catch((e) => {
    response.status(404).send({
      message: "Tidak ada admin dengan id tersebut ditemukan",
      e,
    })
  })
})

// UPDATE PASIEN PEMERIKSAAN
app.put("/patient/pemeriksaan/:id", auth, (request, response) => {
  Pemeriksaan.findOne({ idPemeriksaan: request.params.id })
  .then((result) => {
    // kalau pasien sudah ada, tidak perlu ditambahkan
    if(result.idPasien) {
      return response.status(304).send({
        message: "Sudah ada pasien untuk pemeriksaan ini",
        error,
      })
    }

    result.idPasien = request.body.idPasien

    result.save()
    .then((result) => {
      response.status(202).send({
        message: "Pasien berhasil dimasukkan ke dalam pemeriksaan ini",
        result,
      })
    })
    .catch((error) => {
      console.log("Terjadi kesalahan memasukkan pasien dalam pemeriksaan")
      response.status(500).send({
        message: "Terjadi masalah dalam memasukkan Pasien dalam pemeriksaan",
        error,
      });
    })
  })
  .catch((error) => {
    console.log("Pemeriksaan tidak ditemukan")
    response.status(404).send({
      message: "Pemeriksaan tidak ditemukan",
      error,
    })
  })
})

// UPDATE ADMIN PEMERIKSAAN
app.put("/admin/pemeriksaan/:id", auth, (request, response) => {
  Pemeriksaan.findOne({ idPemeriksaan: request.params.id })
  .then((result) => {
    // kalau admin sudah ada, tidak perlu ditambahkan
    if(result.idAdmin.includes(request.body.idAdmin)) {
      return response.status(304).send({
        message: "Anda sudah tergabung dalam pemeriksaan ini",
        error,
      })
    }

    result.idAdmin.push(request.body.idAdmin)

    result.save()
    .then((result) => {
      response.status(202).send({
        message: "Anda telah bergabung dalam pemeriksaan ini",
        result,
      })
    })
    .catch((error) => {
      console.log("Terjadi kesalahan memasukkan Anda dalam pemeriksaan")
      response.status(500).send({
        message: "Terjadi masalah dalam memasukkan Admin dalam pemeriksaan",
        error,
      });
    })
  })
  .catch((error) => {
    console.log("Pemeriksaan tidak ditemukan")
    response.status(404).send({
      message: "Pemeriksaan tidak ditemukan",
      error,
    })
  })
})

// UPDATE ADMIN AND PASIEN ON PEMERIKSAAN
app.put("/pemeriksaan/:id", auth, (request, response) => {
  Pemeriksaan.findOne({ idPemeriksaan: request.params.id })
  .then((result) => {
    // kalau pasien sudah ada, tolak permintaan
    if(result.idPasien) {
      return response.status(304).send({
        message: "Sudah ada pasien untuk pemeriksaan ini",
        error,
      })
    }
    // kalau admin sudah ada, tidak perlu ditambahkan
    if(result.idAdmin.includes(request.body.idAdmin)) {
      return response.status(304).send({
        message: "Anda sudah tergabung dalam pemeriksaan ini",
        error,
      })
    }

    result.idAdmin.push(request.body.idAdmin)
    result.idPasien = request.body.idPasien

    result.save()
    .then((result) => {
      response.status(202).send({
        message: "Update Admin dan Pasien berhasil",
        result,
      })
    })
    .catch((error) => {
      console.log("Terjadi kesalahan dalam update data pemeriksaan")
      response.status(500).send({
        message: "Terjadi kesalahan dalam update data pemeriksaan",
        error,
      });
    })
  })
  .catch((error) => {
    console.log("Pemeriksaan tidak ditemukan")
    response.status(404).send({
      message: "Pemeriksaan tidak ditemukan",
      error,
    })
  })
})

// GET ALL PEMERIKSAAN ON PASIEN
app.get("/patient/:id/pemeriksaan", auth, (request, response) => {
  Pemeriksaan.find({ idPasien: request.params.id })
  .then((result) => {
    response.status(200).send({
      message: "Pemeriksaan ditemukan",
      result,
    })
    console.log("Pemeriksaan ditemukan")
  })
  .catch((e) => {
    response.status(404).send({
      message: "Tidak ada sesi pemeriksaan dengan pasien tersebut ditemukan",
      e,
    })
  })
})

// GET ALL PEMERIKSAAN ON ADMIN
app.get("/admin/:id/pemeriksaan", auth, (request, response) => {
  Pemeriksaan.find({ idAdmin: request.params.id })
  .then((result) => {
    response.status(200).send({
      message: "Pemeriksaan ditemukan",
      result,
    })
    console.log("Pemeriksaan ditemukan")
  })
  .catch((e) => {
    response.status(404).send({
      message: "Tidak ada sesi pemeriksaan dengan admin tersebut ditemukan",
      e,
    })
  })
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

// GET ONE PASIEN BY ID
app.get("/patient/:id", auth, (request, response) => {
  Pasien.findOne({ idPasien: request.params.id })
  .then((result) => {
    response.status(200).send({
      message: "Pasien " + result.idPasien + " ditemukan",
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

// GET ALL PATIENTS ON ADMIN
app.get("/admin/:id/patient", auth, (request, response) => {
  Pemeriksaan.find({ idAdmin: request.params.id })
  .then((pemeriksaan) => {
    // create an array to store values
    let patients = []
    
    // store found values into the array
    pemeriksaan.map((data) => {
      patients.push(data.idPasien)
    })

    // get Pasien by stored values
    Pasien.find({ idPasien: { $in: patients } })
    .then((result) => {
      response.status(200).send({
        message: "Pasien ditemukan",
        result,
      })
      console.log("Pasien ditemukan")
    })
    .catch((e) => {
      response.status(404).send({
        message: "Tidak ada pasien ditemukan untuk admin tersebut",
        e,
      })
    })
  })
  .catch((e) => {
    response.status(404).send({
      message: "Tidak ada pasien ditemukan untuk admin tersebut",
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
