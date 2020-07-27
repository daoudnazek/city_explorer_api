'use strict';

const server = require('express');
const cors = require('cors');
const superagent = require('superagent');
const { response, request } = require('express');
require('dotenv').config();
const app = server();
app.use(cors());

const PORT = process.env.PORT || 3500;

app.get('/location', getLocation);

function getLocation(request, response) {
    let city = request.query.city;
    locationData(city).then(returnedData => {
        response.status(200).send(returnedData);
    })

};

function locationData(city) {
    let APIKEY = process.env.GEOCODE_API_KEY;
    let url = `https://eu1.locationiq.com/v1/search.php?key=${APIKEY}&q=${city}&format=json`;
    return superagent.get(url).then(data => {
        let locationData = new Location(city, data.body);
        return locationData;
    })
};

app.get('/weather', (request, response) => {
    const dataOfWeather = require('./data/weather.json');
    let weatherArr = dataOfWeather.data.map(e => new Weather(e));
    response.status(200).send(weatherArr);
})

app.all('*', (request, response) => {
    response.status(500).send('this page doesn`t exist !!');
})

app.listen(PORT, () => {
    console.log('server is listening to port ', PORT);
});


function Location(city, data) {
    this.search_query = city;
    this.formatted_query = data[0].display_name;
    this.latitude = data[0].lat;
    this.longitude = data[0].lon;
}

function Weather(data) {
    this.forecast = data.weather.description;
    this.time = data.valid_date;
}
