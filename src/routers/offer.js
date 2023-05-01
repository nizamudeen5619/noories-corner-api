import { Router } from 'express';
import auth from '../middleware/auth.js';
import rootAuth from '../middleware/root-auth.js';
import Offer from '../models/offer.js';
import { pageGenerator } from './page-generator.js';

const router = new Router()

//add product to offer collection
router.post('/offer/admin', rootAuth, auth, async (req, res) => {
    try {
        const product = new Offer(req.body)
        await product.validate(); // This will throw an error if the input is invalid
        await product.save()
        res.status(201).send(product)
    } catch (e) {
        switch (e.code) {
            case 11000:
                return res.status(409).send({ error: 'Product already exists' });
            case 12000 || 12500:
                return res.status(409).send({ error: `Validation Error: ${e.message}` });
            default:
                return res.status(500).send({ error: 'Internal server error' });
        }
    }
})

//get products from offer collection
router.get('/offer', rootAuth, async (req, res) => {
    try {
        const { color, design, page } = req.query;
        const colorArray = JSON.parse(color);
        const designArray = JSON.parse(design);
        const skip = parseInt(page) * 12 || 0;
        const query = colorArray.length && designArray.length
            ? designArray.flatMap((designItem) =>
                colorArray.map((colorItem) => ({
                    Design: parseInt(designItem.Design),
                    Color: colorItem.Color,
                }))
            )
            : [...colorArray, ...designArray].map((item) => ({
                Design: parseInt(item.Design),
            }));
        const products = await Offer.find(
            { $or: query },
            'ProductName Price Rating Image1'
        )
            .limit(12)
            .skip(skip);
        const count = await Offer.countDocuments({});
        return res.status(200).send({
            products,
            pages: pageGenerator(query, products.length, count),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send();
    }
});

//get product with id from offer collection
router.get('/offer/:id', rootAuth, async (req, res) => {
    try {
        const id = req.params.id;
        // Validate the input
        if (!isValidId(id)) {
            return res.status(400).send({ error: 'Invalid ID' });
        }
        // Fetch the product or throw an error if not found
        const product = await Offer.findOneOrFail({ _id: id });
        res.status(200).send(product);
    } catch (e) {
        // Handle errors and send a meaningful error response
        if (e.name === 'EntityNotFoundError') {
            return res.status(404).send({ error: 'Product not found' });
        } else {
            console.error(e);
            return res.status(500).send({ error: 'Internal server error' });
        }
    }
});

function isValidId(id) {
    return mongoose.isValidObjectId(id);
}

//update product in offer collection
router.put('/offer/admin', rootAuth, auth, async (req, res) => {
    try {
        const {
            ProductId,
            ProductName,
            Design,
            SKU,
            Color,
            Fabric,
            ProductDescription,
            NeckType,
            Occassion,
            BrandName,
            StitchType,
            Size,
            Image1,
            Image2,
            SizeChart,
        } = req.body;
        const product = await Offer.findByIdAndUpdate(
            req.body._id,
            {
                ProductId,
                ProductName,
                Design,
                SKU,
                Color,
                Fabric,
                ProductDescription,
                NeckType,
                Occassion,
                BrandName,
                StitchType,
                Size,
                Image1,
                Image2,
                SizeChart,
            },
            { new: true }
        );
        if (!product) {
            return res.status(404).send();
        }
        return res.status(200).send(product);
    } catch (error) {
        console.error(error);
        return res.status(500).send();
    }
});

//delete product in offer collection
router.delete('/offer/admin/:id', rootAuth, auth, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Offer.findOneAndDelete({ _id: id });
        if (!product) {
            return res.status(404).send();
        }
        return res.status(200).send(product);
    } catch (error) {
        console.error(error);
        return res.status(500).send();
    }
});


export default router