const mongoose = require("mongoose");
const PemeriksaanSchema = new mongoose.Schema({
    idPemeriksaan: {
        type: String,
        required: [true, "Please provide an ID!"],
        unique: [true, "ID already exists!"],
    },
    idPasien: {
        type: String,
        required: [true, "Please provide a Patient ID!"],
        unique: false,
    },
    idAdmin: {
        type: [String],
        required: [true, "Please provide an Admin ID!"],
        unique: false,
    },
    tanggalMulai: {
        type: Date,
        required: [true, "Please provide starting time"],
        unique: false,
    },
    tanggalSelesai: {
        type: Date,
        required: false,
        unique: false,
    },
})

module.exports = mongoose.model("Pemeriksaan", PemeriksaanSchema);