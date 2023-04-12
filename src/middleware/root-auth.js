import { verify } from 'jsonwebtoken'

const rootAuth = async (req, res, next) => {
    try {
        const token$ = req.header('apipass').trim()
        const decoded = verify(token$, process.env.JWT_SECRET)
        if (!token$ || !decoded) {
            throw new Error('Unauthorised')
        }
        else if (decoded.apipass === process.env.API_PASSWORD) {
            next()
        }
        else {
            throw new Error('Unauthorised')
        }
    } catch (e) {
        res.status(401).send({ error: 'Unauthorised' })
    }
}

export default rootAuth