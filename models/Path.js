// /models/Path.js

const mongoose = require('mongoose');
const {Schema} = mongoose;

const featureSchema = new Schema({
    _featureId: Schema.Types.ObjectId,
    type: { type: String },
    properties: {
        hardship: { type: String },
        difficulty: { type: String },
        category: { type: String },
    },
    geometry: {
        type: { type: String },
        coordinates: {type: Array}
    }
});


const pathSchema = new Schema({
    _id: Schema.Types.ObjectId,
    userId: { type: String },
    type: { type: String },
    name: { type: String },
    description: { type: String},
    features: [featureSchema],
    created: { type: Date },
    edited: [{ type: Date}],
    device: { type: String }
});





module.exports = Path = mongoose.model('paths', pathSchema);