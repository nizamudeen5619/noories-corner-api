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
app.use('/api', userRouter)
app.use('/api', amazonRouter)
app.use('/api', meeshoRouter)
app.use('/api', offerRouter)

module.exports = app