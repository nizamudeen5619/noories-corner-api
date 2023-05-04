import { Schema, model } from 'mongoose'

const productSchema = new Schema({
    ProductId: { type: String | Number },
    ProductName: { type: String },
    Design: { type: Number },
    SKU: { type: String },
    Color: { type: String },
    Price: { type: Number },
    Rating: { type: Number },
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
    Platform: { type: String }
})

productSchema.statics.findOneOrFail = async function (query) {
    const result = await this.findOne(query);
    if (!result) {
        throw new Error('Prouct not found');
    }
    return result;
};

productSchema.pre('save', async function (next) {
    this.ProductDescription = SanitizeHTML(this.ProductDescription);
    next()
})

const Offer = model('offer', productSchema, 'offer')

export default Offer