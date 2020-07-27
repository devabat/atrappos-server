// /models/Path.js

const mongoose = require('mongoose');
const {Schema} = mongoose;

const propertiesSchema = new Schema({
    objective: { type: String },
    subjective: { type: String },
}, { _id : false });

const geometrySchema = new Schema({
    type: { type: String },
    coordinates: {type: Array}
}, { _id : false });

const pathSchema = new Schema({
    _id: Schema.Types.ObjectId,
    userId: { type: String },
    type: { type: String },
    geometry: geometrySchema,
    properties: propertiesSchema,
    device: { type: String },
    created: { type: Date },
    modified: [{ type: Date }],
    area: { type: String },
    distance: { type: Number},
    name: { type: String },
    description: { type: String},
    drawType: { type: String },
    drawn: {type: Object},
    evaluations: [{ type: Object }],
    edited: [{ type: Object }],
    snapped: { type: Boolean }
});





module.exports = Path = mongoose.model('paths', pathSchema);