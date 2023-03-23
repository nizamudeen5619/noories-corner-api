const express = require('express')
const cors = require('cors');

require('./db/mongoose')

const userRouter = require('./routers/user')
const amazonRouter = require('./routers/amazon')
const meeshoRouter = require('./routers/meesho')
const offerRouter = require('./routers/offer')

const app = express()

app.use(cors())
app.use(express.json())//parse json to object
app.use('/api/v1', userRouter)
app.use('/api/v1', amazonRouter)
app.use('/api/v1', meeshoRouter)
app.use('/api/v1', offerRouter)

module.exports = app