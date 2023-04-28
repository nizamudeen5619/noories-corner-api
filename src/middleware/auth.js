import { verify } from 'jsonwebtoken'
import User from '../models/user.js'

const auth = async (req, res, next) => {
    try {
        const authToken = req.header('Authorization').replace('Bearer ', '').trim()
        const decodedToken = verify(authToken, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decodedToken._id })
        if (!user) {
            throw new Error('User not found')
        }
        const tokenExists = user.tokens.some((token) => token.token === authToken)

        if (!tokenExists) {
            user.tokens.push({ token: authToken })
            await user.save()
        }
        if (req.url.includes('admin')) {
            const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL })

            if (!adminUser || user.email !== adminUser.email) {
                throw new Error('Unauthorized')
            }
        }

        req.token = authToken
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate' })
    }
}

export default auth