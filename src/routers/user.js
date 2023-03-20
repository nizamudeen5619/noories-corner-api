const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const nodemailer = require('nodemailer');
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAILID,
        pass: process.env.PASSWORD
    }
})

//register
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        let mailOptions = {
            from: process.env.EMAILID,
            to: user.email,
            subject: 'Test',
            text: `hi ${user.name}`
        }
        await transporter.sendMail(mailOptions)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send('Email Already Exists')
    }
})

//login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

//logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//logoutall
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//user profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//update user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete user account
router.delete('/users/me', auth, async (req, res) => {
    try {
        let mailOptions = {
            from: process.env.EMAILID,
            to: req.user.email,
            subject: 'Test',
            text: `hi ${req.user.name}`
        }
        await transporter.sendMail(mailOptions)
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

//upload profile photo
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//delete profile photo
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

//view profile photo
router.get('/users/me/avatar', auth, async (req, res) => {
    try {
        res.set('Content-Type', 'image/png')
        res.send(req.user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

//view favourites
router.get('/users/favourites', auth, async (req, res) => {
    res.send(req.user.favourites)
})

//add to favourites
router.post('/users/favourites/:id', auth, async (req, res) => {

    try {
        const id = req.params.id
        req.user.favourites = req.user.favourites.filter(product => product.productID !== id)
        req.user.favourites.push({ productID: id })
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//remove from favourites
router.delete('/users/favourites/:id', auth, async (req, res) => {
    try {
        const favouriteID = req.params.id
        req.user.favourites = req.user.favourites.filter(product => product.productID !== favouriteID)
        await req.user.save()
        res.status(200).send(req.user.favourites)
    } catch (error) {
        res.status(400).send(e)
    }
})


module.exports = router