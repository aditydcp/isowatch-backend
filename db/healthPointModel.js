const mongoose = require("mongoose");
const HealthPointSchema = new mongoose.Schema({
    idPemeriksaan: {
        type: String,
        required: [true, "Please provide an ID!"],
        unique: false,
    },
    timestamp: {
        type: Date,
        required: [true, "Please provide a timestamp"],
        unique: false,
    },
    heartRate: {
        type: Number,
        required: [true, "Please provide heart rate measurements"],
        unique: false,
    },
    diastolicBloodPressure: {
        type: Number,
        required: [true, "Please provide diastolic blood pressure measurements"],
        unique: false,
    },
    sistolicBloodPressure: {
        type: Number,
        required: [true, "Please provide sistolic blood pressure measurements"],
        unique: false,
    },
    bloodOxygen: {
        type: Number,
        required: [true, "Please provide blood oxygen measurements"],
        unique: false,
    },
})

module.exports = mongoose.model("HealthPoint", HealthPointSchema);