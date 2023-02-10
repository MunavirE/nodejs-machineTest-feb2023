const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    description: {
        required: false,
        type: String
    },
    mrp: {
        required: true,
        type: Number
    },
    discount: {
        required: false,
        type: Number
    },
    shippingCharge: {
        required: false,
        type: Number
    },
    imageUrl: {
        required: false,
        type: Array
    },
    price: {
        required: true,
        type: Number
    }
})

module.exports = mongoose.model('Data', dataSchema)