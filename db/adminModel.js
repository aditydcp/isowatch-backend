const mongoose = require("mongoose");
const AdminSchema = new mongoose.Schema({
    idAdmin: {
        type: String,
        required: [true, "Please provide an ID!"],
        unique: [true, "ID already exists!"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    },
    namaAdmin: {
        type: String,
        required: [true, "Please provide a name!"],
        unique: false,
    },
})

module.exports = mongoose.model("Admin", AdminSchema);