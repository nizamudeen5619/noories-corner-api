const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token$ = req.header('Authorization').replace('Bearer ', '').trim()
        const decoded = jwt.verify(token$, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id })
        if (!user) {
            throw new Error('User Not FOund')
        }
        else if (user.tokens.forEach((token) => token.token === token$)) {
            user.tokens.concat(token$)
            user.save()
        }
        if (req.url.includes('admin')) {
            if (user.email !== process.env.ADMINID) {
                throw new Error('Unauthorised')
            }
        }
        req.token = token$
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate' })
    }
}

module.exports = auth