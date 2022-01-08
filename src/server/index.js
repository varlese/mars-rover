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
app.get('favicon.ico', async(req, res) => {
    return ''
})

//Get Mars rover manifest data
app.get('/rovers/:roverName', async(req, res, next) => {
    const roverName = req.params.roverName

    if( !roverName ) {
        res.status(404)
        res.render('error', { error: 'Rover not found' })
    }

    try {
        let roverData = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}/?api_key=${process.env.API_KEY}`)
            .then(res => res.json())

            .then(res => {
                console.log(res)
                return res
            })

            .then(res => {
                if(res.errors){
                    return res.errors
                }

                const rover = res.photo_manifest

                return {
                    name: rover.name,
                    landing_date: dayjs(rover.landing_date).format('MMMM D, YYYY'),
                    launch_date: dayjs(rover.launch_date).format('MMMM D, YYYY'),
                    status: rover.status,
                    max_date: rover.max_date,
                }
            })

        res.send(roverData)
    } catch(err) {
        console.log('error:', err);
    }
})

//Get Mars rover photos
app.get('/mars-photos/:roverName/:filterDate', async(req,res) => {
    const roverName = req.params.roverName

    const filterDate = dayjs( req.params.filterDate ).format( 'YYYY-M-D' );

    try {
        let roverPhotos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?earth_date=${filterDate}&api_key=${process.env.API_KEY}`)
            .then(res => res.json())

            .then(res => {
                console.log(res)
                return res
            })

            .then(res => res.photos)

            .then(res => {
                if(!res.length){
                    return {error: 'Whoops, no pictures today!'}
                }

                const roverPhotos = List(res)

                return roverPhotos.map((photo, key) => {
                    return photo.img_src
                })
            })

            res.send(roverPhotos)
    } catch(err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))