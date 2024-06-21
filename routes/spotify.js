const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const path = require('path')
const spotifyController = require(path.join(__dirname,'..','controller','spotifyController'))


router.route('/Login')
    .get(spotifyController.authorize)
router.route('/Info')
    .get(spotifyController.getInfo)


module.exports = router