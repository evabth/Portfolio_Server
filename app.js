const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 4000
var cors = require('cors')
var whitelist = ['http://localhost:4000', 'https://evans-portfolio.onrender.com, http://127.0.0.1:4000','https://portfolio-server-6sq5.onrender.com']

var corsOptions = {
  origin: function (origin, callback) {
    console.log(origin)
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

app.get('/Music', cors(corsOptions), function (req, res, next) {
  res.json({msg: 'This is CORS-enabled for a whitelisted domain.'})
})

 
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