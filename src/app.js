import express from 'express';
import cors from 'cors';

import './db/mongoose.js';

import userRouter from './routers/user.js';
import amazonRouter from './routers/amazon.js';
import meeshoRouter from './routers/meesho.js';
import offerRouter from './routers/offer.js';

const app = express()

app.use(cors())
app.use(express.json())//parse json to object
app.use('/api/v1', userRouter)
app.use('/api/v1', amazonRouter)
app.use('/api/v1', meeshoRouter)
app.use('/api/v1', offerRouter)


export default app