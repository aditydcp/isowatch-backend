const mongoose = require("mongoose");
const PasienSchema = new mongoose.Schema({
    idPasien: {
        type: String,
        required: [true, "Please provide an ID!"],
        unique: [true, "ID already exists!"],
    },
    namaPasien: {
        type: String,
        required: [true, "Please provide a name!"],
        unique: false,
    },
    tanggalLahir: {
        type: Date,
        required: [true, "Please provide birthdate!"],
        unique: false,
    },
    alamat: {
        type: String,
        required: [true, "Please provide address!"],
        unique: false,
    },
    gender: {
        type: String,
        required: [true, "Please provide gender!"],
        unique: false,
    },
    keluhan: {
        type: String,
        required: false,
        unique: false,
    },
    riwayatPenyakit: {
        type: String,
        required: false,
        unique: false,
    },
})

module.exports = mongoose.model("Pasien", PasienSchema);