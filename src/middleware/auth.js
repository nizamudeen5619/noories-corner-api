import jsonwebtoken from 'jsonwebtoken'
import User from '../models/user.js'

const { verify } = jsonwebtoken;

const auth = async (req, res, next) => {
    try {
        const authToken = req.header('Authorization')?.replace('Bearer ', '')?.trim();
        if (!authToken) {
            throw new Error('Unauthorized: Missing token');
        }

        const decodedToken = verify(authToken, process.env.JWT_SECRET);
        if (!decodedToken) {
            throw new Error('Unauthorized: Invalid token');
        }

        const user = await User.findOne({ _id: decodedToken._id });
        if (!user) {
            throw new Error('Unauthorized: User not found');
        }

        const tokenExists = user.tokens.some((token) => token.token === authToken);

        if (!tokenExists) {
            user.tokens.push({ token: authToken });
            await user.save();
        }

        if (req.url.includes('admin')) {
            const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });

            if (!adminUser || user.email !== adminUser.email) {
                throw new Error('Unauthorized: Not an admin');
            }
        }

        req.token = authToken;
        req.user = user;
        next();
    } catch (e) {
        next(e); // Pass the error to the next middleware (error-handling middleware)
    }
};


export default auth