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
})

module.exports = mongoose.model.Pasien || mongoose.model("Pasien", PasienSchema);