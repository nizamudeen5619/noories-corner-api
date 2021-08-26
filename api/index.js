const express = require('express')
const router = express.Router()
require('./routes/job')(router)
require('./routes/user')(router)
module.exports = router