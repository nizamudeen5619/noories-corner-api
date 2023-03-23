const express = require('express');
const auth = require('../middleware/auth');
const rootAuth = require('../middleware/root-auth');
const Offer = require('../models/offer')
const router = new express.Router()

router.post('/offer/admin', rootAuth, auth, async (req, res) => {
    const product = new Offer(req.body)

    try {
        await product.save()
        res.status(201).send(product)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/offer', rootAuth, async (req, res) => {
    const color = req.query.color;
    const design = parseInt(req.query.design);

    try {
        const products = await Offer.find({ Color: color, Design: design })
        res.status(200).send(products)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/offer/:id', rootAuth, async (req, res) => {
    const _id = req.params.id
    try {
        const product = await Offer.findOne({ _id })
        if (!product) {
            return res.status(404).send()
        }
        res.status(200).send(product)
    } catch (e) {
        res.status(500).send()
    }
})

router.put('/offer/admin', rootAuth, auth, async (req, res) => {
    try {
        const product = await Offer.findOne({ _id: req.body._id })
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


router.delete('/offer/admin/:id', rootAuth, auth, async (req, res) => {
    try {
        const product = await Offer.findOneAndDelete({ _id: req.params.id })

        if (!task) {
            return res.status(404).send()
        }

        res.status(200).send(product)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router