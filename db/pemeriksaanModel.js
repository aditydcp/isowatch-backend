const mongoose = require("mongoose");
const PemeriksaanSchema = new mongoose.Schema({
    idPemeriksaan: {
        type: String,
        required: [true, "Please provide an ID!"],
        unique: [true, "ID already exists!"],
    },
    idPasien: {
        type: String,
        required: false,
        unique: false,
    },
    idAdmin: {
        type: [String],
        required: false,
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