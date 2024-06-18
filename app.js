const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 4000
var cors = require('cors')  
var whitelist = [ 'https://evans-portfolio.onrender.com','https://portfolio-server-6sq5.onrender.com']

var corsOptions = {
  origin: function (origin, callback) {

    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static(path.join(__dirname,'/public')))

app.use('/Music', cors(corsOptions), require(path.join(__dirname,'routes','spotify')))

 
app.get('/', (req, res) => {

  // we can send a file using  res.sendfile()
  res.send('Hello World!')
  console.log('request recieved')
})

app.get('/*', (req,res) => {

  res.status(404).sendFile(path.join(__dirname,'views','404.html'))

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})