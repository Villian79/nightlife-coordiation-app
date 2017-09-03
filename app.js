const express       = require('express');
const app           = express();
const bodyParser    = require('body-parser');
const RapidAPI      = require('rapidapi-connect');

//config
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

const rapid = new RapidAPI("nightlife", "7e884fc0-85a7-40d0-b006-dcc58d234646");


app.get('/', (req, res)=>{
    res.render('landing');
});

app.post('/placesnearby', (req, res)=>{
        let location = req.body.location;
        rapid.call('YelpAPI', 'getBusinesses', {
    	'accessToken': 'UHQNkB_jT1owIxkFp19SoGF7m_RhDeXV2AY2Rj9znLpSJ6fxUaqpCEgDGlbpXoHdu3HSFHwmmFCiBuARDs08aW4c7wgf3Sy2jJrfJAY8S8tjjnOQ8IuNxrqfyj6pWXYx',
    	'location': location,
        'term': 'bars',
        'radius': 20000,
        'sortBy': 'distance',
        'limit': 50

    }).on('success', (payload)=>{
        res.render('placesnearby', {payload: payload, location: location});
    }).on('error', (payload)=>{
    	console.log("Error");;
    });
});

app.listen(3000 || process.env.PORT, process.env.IP, ()=>{
    console.log('Server is running');
});
