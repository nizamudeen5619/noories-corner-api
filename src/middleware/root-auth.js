import { verify } from 'jsonwebtoken'

const rootAuth = (req, res, next) => {
    try {
        const token = req.header('apipass')?.trim();
        if (!token) {
            throw new Error('Unauthorized: Missing token');
        }

        const decoded = verify(token, process.env.JWT_SECRET);
        if (!decoded || decoded.apipass !== process.env.API_PASSWORD) {
            throw new Error('Unauthorized: Invalid token');
        }

        next();
    } catch (e) {
        next(e); // Pass the error to the next middleware (error-handling middleware)
    }
};

export default rootAuth