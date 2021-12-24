require('dotenv').config()
const express = require('express')
const { Map, List } = require('immutable');
const dayjs = require('dayjs');
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path');
const res = require('express/lib/response');

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
//@todo move rover name into variable on API

//Get Mars rover manifest data
app.get('/rovers', async(req,res) => {
    try {
        let roverData = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity/?api_key=${process.env.API_KEY}`)
            .then(res => res.json())

            .then(res => {
                console.log(res)
                return res
            })

            .then(res => res.photo_manifest)

            .then(res => {
                return {
                    name: res.name,
                    landing_date: dayjs(res.landing_date).format('MMMM D, YYYY'),
                    launch_date: dayjs(res.launch_date).format('MMMM D, YYYY'),
                    status: res.status,
                    max_date: res.max_date,
                }
            })

        res.send(roverData)
    } catch(err) {
        console.log('error:', err);
    }
})

//Get Mars rover photos
app.get('/mars-photos/:filterDate', async(req,res) => {
    const filterDate = dayjs( req.params.filterDate ).format( 'YYYY-M-D' );

    try {
        let roverPhotos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${filterDate}&api_key=${process.env.API_KEY}`)
            .then(res => res.json())

            .then(res => {
                console.log(res)
                return res
            })

            .then(res => res.photos)

            .then(res => {
                const roverPhotos = List(res)
                return roverPhotos.map((photo, key) => {
                    console.log(key)
                    return photo.img_src
                })
            })

            res.send(roverPhotos)
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
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))