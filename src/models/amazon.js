const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    ProductId: { type: String | Number },
    ProductName: { type: String },
    Design: { type: String },
    SKU: { type: String },
    Color: { type: String },
    Fabric: { type: String },
    ProductDescription: { type: String },
    NeckType: { type: String },
    Occassion: { type: String },
    BrandName: { type: String },
    StitchType: { type: String },
    Size: { type: String | Number },
    Image1: { type: String },
    Image2: { type: String },
    SizeChart: { type: String },
})

const Amazon = mongoose.model('amazon', productSchema)

module.exports = Amazon