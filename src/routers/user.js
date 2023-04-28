import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import nodemailer from 'nodemailer';
import User from '../models/user.js';
import auth from '../middleware/auth.js';
import rootAuth from '../middleware/root-auth.js';
const router = new Router()

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAILID,
        pass: process.env.PASSWORD
    }
})

//register
router.post('/users/register', rootAuth, async (req, res) => {
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
        const username = user.name
        res.status(201).send({ username, token })
    } catch (e) {
        res.status(401).send('Email Already Exists')
    }
})

//login
router.post('/users/login', rootAuth, async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        const username = user.name
        res.status(200).send({ username, token })
    } catch (e) {
        res.status(401).send()
    }
})

//logout
router.post('/users/logout', rootAuth, auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

//logoutall
router.post('/users/logoutAll', rootAuth, auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

//user profile
router.get('/users/me', rootAuth, auth, async (req, res) => {
    res.send(req.user)
})

//update user
router.patch('/users/me', rootAuth, auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.status(200).send(req.user.name)
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete user account
router.delete('/users/me', rootAuth, auth, async (req, res) => {
    try {
        let mailOptions = {
            from: process.env.EMAILID,
            to: req.user.email,
            subject: 'Test',
            text: `hi ${req.user.name}`
        }
        await transporter.sendMail(mailOptions)
        await req.user.remove()
        res.status(200).send()
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
router.post('/users/me/avatar', rootAuth, auth, upload.single('avatar'), async (req, res) => {
    console.log(req.file);
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//delete profile photo
router.delete('/users/me/avatar', rootAuth, auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//view profile photo
router.get('/users/me/avatar', rootAuth, auth, async (req, res) => {
    try {
        res.set('Content-Type', 'image/png')
        res.status(200).send(req.user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

//view favourites
router.get('/users/favourites', rootAuth, auth, async (req, res) => {
    res.send(req.user.favourites)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//check favourites
router.get('/users/favourites/:id', rootAuth, auth, async (req, res) => {
    const id = req.params.id
    let checkFavourite = false
    for (let favourite of req.user.favourites) {
        if (favourite.productID === id) {
            checkFavourite = true
            break;
        }
    }
    res.status(200).send({ checkFavourite })
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


//add to favourites
router.post('/users/favourites/:id', rootAuth, auth, async (req, res) => {
    try {
        const id = req.params.id
        req.user.favourites = req.user.favourites.filter(product => product.productID !== id)
        req.user.favourites.push({ productID: id })
        await req.user.save()
        res.status(200).send({ addedToFavourites: true })
    } catch (e) {
        res.status(400).send(e)
    }
})

//remove from favourites
router.delete('/users/favourites/:id', rootAuth, auth, async (req, res) => {
    try {
        const favouriteID = req.params.id
        req.user.favourites = req.user.favourites.filter(product => product.productID !== favouriteID)
        await req.user.save()
        res.status(200).send({ removedFromFavourites: true })
    } catch (error) {
        res.status(400).send(e)
    }
})


export default router