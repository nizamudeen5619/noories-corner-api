import { Router } from 'express';
import auth from '../middleware/auth.js';
import rootAuth from '../middleware/root-auth.js';
import Amazon from '../models/amazon.js';
import { pageGenerator } from './page-generator.js';

const router = new Router()

router.post('/amazon/admin', rootAuth, auth, async (req, res) => {
    const product = new Amazon(req.body)
    try {
        await product.save()
        res.status(201).send(product)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/amazon', rootAuth, async (req, res) => {
    try {
        const color = req.query.color;
        const design = parseInt(req.query.design)
        const skip = parseInt(req.query.page) * 10 || 0
        let query = {}
        if (color) {
            query['Color'] = color
        }
        if (design) {
            query['Design'] = design
        }
        const products = await Amazon.find(query, 'ProductName Design Color Price Rating Image1').limit(10).skip(skip)
        const count = await Amazon.countDocuments({})
        const pages = pageGenerator(query, products.length, count)
        return res.status(200).send({ products, pages })
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/amazon/:id', rootAuth, async (req, res) => {
    const _id = req.params.id
    try {
        const product = await Amazon.findOne({ _id })
        if (!product) {
            return res.status(404).send()
        }
        res.status(200).send(product)
    } catch (e) {
        res.status(500).send()
    }
})

router.put('/amazon/admin', rootAuth, auth, async (req, res) => {
    try {
        const product = await Amazon.findOne({ _id: req.body._id })
        if (!product) {
            return res.status(400).send()
        }
        product.ProductId = req.body.ProductId
        product.ProductName = req.body.ProductName
        product.Design = req.body.Design
        product.SKU = req.body.SKU
        product.Color = req.body.Color
        product.Fabric = req.body.Fabric
        product.ProductDescription = req.body.ProductDescription
        product.NeckType = req.body.NeckType
        product.Occassion = req.body.Occassion
        product.BrandName = req.body.BrandName
        product.StitchType = req.body.StitchType
        product.Size = req.body.Size
        product.Image1 = req.body.Image1
        product.Image2 = req.body.Image2
        product.SizeChart = req.body.SizeChart

        await product.save()
        res.status.send(product)
    } catch (e) {
        res.status(500).send()
    }
})


router.delete('/amazon/admin/:id', rootAuth, auth, async (req, res) => {
    try {
        const product = await Amazon.findOneAndDelete({ _id: req.params.id })
        if (!task) {
            return res.status(404).send()
        }
        res.status(200).send(product)
    } catch (e) {
        res.status(500).send()
    }
})



export default router