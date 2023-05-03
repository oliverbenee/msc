//////////////////////////
// SET UP EXPRESS PAGE. //
//////////////////////////

const express = require('express')
const app = express()
const port = 3000

const exphbs = require('express-handlebars')
app.set('view engine', '.hbs')
app.engine('.hbs', exphbs.engine({
  defaultLayout: 'main',
  extname: '.hbs', // Shorten handlebars file name.
  layoutsDir: `${__dirname}/../views/layouts`, // allow use of layouts, when specified with res.render.
  partialsDir: `${__dirname}/../views/partials` // allow use of partials automatically from 'views/partials'
}))

app.use(express.static(`${__dirname}/../public`)) // serve static webpages. Use content from the public folder.

// Allows us to connect to the web server. 
app.listen(port, () => { console.log(`listening on port ${port}`) })

// Use bodyparser as a middleware for parsing requests.
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true})) 

const router = require('./routes').router
app.use(router)

// near=56.172592, 10.189799&distance=1000000

//  https://data.sensor.community/airrohr/v1/filter/country=DK

const apiToDatabaseUpdateHandler = require('./apiToDatabaseUpdateHandler')