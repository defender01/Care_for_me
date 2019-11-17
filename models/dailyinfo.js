var mongoose = require('mongoose');

var dataCollection_schema = new mongoose.Schema({
    _dataId: mongoose.Schema.Types.ObjectId,
    updated: { type: Date, default: Date.now },
    symptoms:{
        chest_pain: {
            type: String
        },
        respiratory: {
            type: String
        },
        cardio_vascular: {
            type: String
        },
        hematological: {
            type: String
        },
        lymphatic: {
            type: String
        },
        neurolohical: {
            type: String
        },
        psychological: {
            type: String
        },
        gasttrointestinal: {
            type: String
        },
        genitourinary: {
            type: String
        },
        weight_gain: {
            type: String
        },
        weight_loss: {
            type: String
        },
        musculoskeletal: {
            type: String
        }
    },
    weight:{
        type: Number
    },
    systolic:{
        type: Number
    },
    diastolic:{
        type: Number
    },
    taking_med:{
        type: String
    },
    med_details:{
        type: String
    },
    diary:{
        type: String
    }

});

module.exports = mongoose.model('dataCollection', dataCollection_schema);
