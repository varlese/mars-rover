require('dotenv').config()
const express = require('express')
const { fromJS } = require('immutable');
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
//@todo move rover name into variable on API

//Get Mars rover manifest data
//@todo move API call for each call into a function to more easily parse data for later
app.get('/rovers', async(req,rest) => {
    try {
        let roverData = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity/?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
    } catch(err) {
        console.log('error:', err);
    }
})

//Get Mars rover photos
app.get('/mars-photos', async(req,rest) => {
    try {
        let roverData = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=2015-6-3&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
            console.log(roverData)
    } catch(err) {
        console.log('error:', err);
    }
})

// example API response/log
// app.get('/ping', async(req,res) => {
//     console.log('pong')
//     res.send('pong')
// })

// example API call
// app.get('/apod', async (req, res) => {
//     try {
//         let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
//             .then(res => res.json())
//         res.send({ image })
//     } catch (err) {
//         console.log('error:', err);
//     }
// })

app.listen(port, () => console.log(`Example app listening on port ${port}!`))