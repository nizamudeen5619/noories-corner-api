import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer';
import User from '../models/user.js';
import auth from '../middleware/auth.js';
import rootAuth from '../middleware/root-auth.js';
import handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { Types } from 'mongoose';
import Meesho from '../models/meesho.js';
import Amazon from '../models/amazon.js';


const nooriescornerApp = {
    name: "Noorie's Corner",
    email: "nooriescorner@gmail.com",
    slogan: "Fashion with Tradition!",
    url: "http://localhost:4200/",
    logo: "https://i.imgur.com/ny8EXnN.png"
}

const router = new Router()

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAILID,
        pass: process.env.PASSWORD
    }
});

async function sendEmail(to, subject, htmlBody) {
    try {
        const mailOptions = {
            from: process.env.EMAILID,
            to,
            subject,
            html: htmlBody,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error('Failed to send email');
    }
}


//register
router.post('/users/register', rootAuth, async (req, res, next) => {
    try {
        const user = new User(req.body);
        const username = user.name;

        // Read the HTML template file
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const templatePath = path.join(__dirname, 'email-template', 'registration-email.handlebars');
        const htmlTemplate = readFileSync(templatePath, 'utf8');

        // Compile the Handlebars template
        const template = handlebars.compile(htmlTemplate);

        // Provide the data to the template
        const compiledTemplate = template({
            username,
            nooriescornerApp
        });

        await user.save();

        // Send email
        await sendEmail(user.email, `Welcome to ${nooriescornerApp.name} - ${nooriescornerApp.slogan}`, compiledTemplate);

        const token = await user.generateAuthToken();

        res.status(201).send({ username, token });
    } catch (e) {
        if (e.code === 11000) {
            e.status = 501;
            e.message = 'Email already exists';
        }
        else if (e.message === '') {
            e.message = 'An error occurred';
        }
        next(e);
    }
});


//login
router.post('/users/login', rootAuth, async (req, res, next) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        const username = user.name;
        res.status(200).send({ username, token });
    } catch (e) {
        if (e.message === '401') {
            e.status = 401;
            e.message = 'Invalid credentials! Please check your email and password.'
        }
        next(e);
    }
});

// Request password reset
router.post('/users/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });


        if (!user) {
            throw new Error('401');
        }

        const username = user.name;

        // Read the HTML template file
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const templatePath = path.join(__dirname, 'email-template', 'password-reset-email.handlebars');
        const htmlTemplate = readFileSync(templatePath, 'utf8');

        // Compile the Handlebars template
        const template = handlebars.compile(htmlTemplate);

        // Generate password reset token
        const resetToken = await user.generatePasswordResetToken();
        // Generate password reset link
        const passResetLink = "http://localhost:4200/user/reset-password/" + String(resetToken);
        // Provide the data to the template
        const compiledTemplate = template({
            username,
            nooriescornerApp,
            passResetLink
        });

        // Send email
        await sendEmail(user.email, `Noorie's Corner - Account Password Reset`, compiledTemplate);

        res.status(200).send({ status: 'success' });
    } catch (e) {
        if (e.message === '401') {
            e.status = 401;
            e.message = 'Email not found'
        }
        next(e);
    }
});

// Handle password reset form submission
router.post('/users/reset-password', async (req, res, next) => {
    try {
        const { token, password } = req.body;

        // Find user by token and ensure it's valid
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new Error('401');
        }

        // Set the new password and clear the reset token fields
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        // Save the updated user document
        await user.save();

        res.status(200).send({ status: 'success' });
    } catch (e) {
        if (e.message === '401') {
            e.status = 401;
            e.message = 'Token Expired'
        }
        next(e);
    }
});


//logout
router.post('/users/logout', rootAuth, auth, async (req, res, next) => {
    try {
        const user = req.user;

        user.tokens = user.tokens.filter((token) => token.token !== req.token);
        await user.save();

        res.status(200).send();
    } catch (e) {
        e.message = 'Logout failed'
        next(e);
    }
});

//logoutall
router.post('/users/logoutAll', rootAuth, auth, async (req, res) => {
    try {
        const user = req.user;

        user.tokens = [];
        await user.save();

        res.status(200).send();
    } catch (e) {
        e.message = 'Logout All failed'
        next(e);
    }
});

//user profile
router.get('/users/me', rootAuth, auth, async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            throw new Error('404');
        }

        res.send(user);
    } catch (error) {
        if (e.message === '404') {
            e.status = 404;
            e.message = "User not found";
        } else {
            e.message = 'Failed to fetch user';
        }
        next(e);
    }
});

//update user
router.patch('/users/me', rootAuth, auth, async (req, res, next) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        throw new Error('400');
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();

        res.status(200).send({ userName: req.user.name });
    } catch (e) {
        if (e.message === '400') {
            e.status = 400;
            e.message = "Invalid updates";
        } else {
            e.message = 'Failed to update user';
        }
        next(e);
    }
});

//delete user account
router.delete('/users/me', rootAuth, auth, async (req, res) => {
    try {
        const user = req.user;
        const enteredPassword = req.body.password;

        // Compare the entered password with the user's hashed password
        const passwordMatch = await bcrypt.compare(enteredPassword, user.password);
        if (!passwordMatch) {
            throw new Error('401')
        }
        else {
            const username = user.name;
            // Read the HTML template file
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const templatePath = path.join(__dirname, 'email-template', 'account-deletion-email.handlebars');
            const htmlTemplate = readFileSync(templatePath, 'utf8');
            // Compile the Handlebars template
            const template = handlebars.compile(htmlTemplate);
            // Provide the data to the template
            const compiledTemplate = template({
                username,
                nooriescornerApp,
            });

            await sendEmail(user.email, `Account Deletion - ${nooriescornerApp.name}`, compiledTemplate);

            await user.remove();

            res.status(200).send();
        }
    } catch (e) {
        if (e.message === '401') {
            e.status = 401;
            e.message = "Incorrect Password";
        }
        next(e);
    }
});


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
router.post('/users/me/avatar', rootAuth, auth, upload.single('avatar'), async (req, res, next) => {
    try {
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
        req.user.avatar = buffer;
        await req.user.save();

        res.send();
    } catch (e) {
        next(e)
    }
});

// Delete profile photo
router.delete('/users/me/avatar', rootAuth, auth, async (req, res, next) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

// View profile photo
router.get('/users/me/avatar', rootAuth, auth, async (req, res, next) => {
    try {
        if (!req.user.avatar) {
            throw new Error('404');
        }
        else {
            res.set('Content-Type', 'image/png');
            res.status(200).send(req.user.avatar);
        }
    } catch (e) {
        if (e.message === '404') {
            e.status = 404;
            e.message = "Profile photo not found";
        }
        next(e);
    }
});

// View favorites
router.get('/users/favourites', rootAuth, auth, async (req, res, next) => {
    try {
        const favouriteProductIds = req.user.favourites;

        let favouriteProducts;

        if(!favouriteProductIds.length){
            favouriteProducts=[];
        }
        else{
        const [meeshoProducts, amazonProducts] = await Promise.all([
            Meesho.find({ _id: { $in: favouriteProductIds } }).select('ProductName Price Rating Image1'),
            Amazon.find({ _id: { $in: favouriteProductIds } }).select('ProductName Price Rating Image1'),
        ]);
        
        favouriteProducts = [...meeshoProducts, ...amazonProducts];
        }

        res.status(200).send({ favouriteProducts });
    } catch (e) {
        next(e)
    }
});

// Check favorites
router.get('/users/favourites/:id', rootAuth, auth, async (req, res, next) => {
    try {
        const id = req.params.id;
        const productId = Types.ObjectId(id);
        let checkFavourite;
        if (!req.user.favourites.length) {
            checkFavourite = false;
        }
        else {
            checkFavourite = req.user.favourites.includes(productId);
        }
        console.log(checkFavourite);
        res.status(200).send({ checkFavourite });
    } catch (e) {
        if (e.status !== 500) {
            e.message = 'Failed to check favorites';
        }
        else if (e.message === '400') {
            e.status = 400;
            e.message = 'Invalid product ID';
        }

        next(e);
    }
});


// Add to favorites
router.post('/users/favourites/:id', rootAuth, auth, async (req, res, next) => {
    try {
        const productId = req.params.id;

        if (!Types.ObjectId.isValid(productId)) {
            throw new Error('400');
        }
        const [meeshoProduct, amazonProduct] = await Promise.all([
            Meesho.findById(productId),
            Amazon.findById(productId)
        ]);

        if (!meeshoProduct && !amazonProduct) {
            throw new Error('404');
        }
        // Update the user's favorites in memory
        if (!req.user.favourites.includes(productId)) {
            req.user.favourites.push(productId);
        }

        await req.user.save();

        res.status(200).send({ addedToFavourites: true });
    } catch (e) {
        if (e.status !== 500) {
            e.message = 'Failed to add to favorites';
        }
        else if (e.message === '400') {
            e.status = 400;
            e.message = 'Invalid product ID';
        }
        else if (e.message === '404') {
            e.status = 404;
            e.message = 'Product not found';
        }
        next(e);
    }
});

// Remove from favorites
router.delete('/users/favourites/:id', rootAuth, auth, async (req, res, next) => {
    try {
        const productId = req.params.id;
        // Validate that 'id' is a valid ObjectId
        if (!Types.ObjectId.isValid(productId)) {
            throw new Error('400');
        }
        if (!req.user.favorites.includes(productId) || !req.user.favorites.length) {
            throw new Error('404');
        }
        req.user.favourites = req.user.favourites.filter(product => product.productID !== productId);
        await req.user.save();
        res.status(200).send({ removedFromFavourites: true });
    } catch (e) {
        if (e.status !== 500) {
            e.message = 'Failed to remove from favorites';
        }
        else if (e.message === '400') {
            e.status = 400;
            e.message = 'Invalid product ID';
        }
        else if (e.message === '404') {
            e.status = 404;
            e.message = 'Product not found in favourites';
        }
        next(e);
    }
});


export default router