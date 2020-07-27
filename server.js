'use strict';

const server = require('express');
const cors = require('cors');
const { response, request } = require('express');
require('dotenv').config();
const app = server();
app.use(cors());

const PORT = process.env.PORT || 3500;

app.get('/location', (request, response) => {
    const data = require('./data/location.json');
    let city = request.query.city;
    let locationData = new Location(city, data);
    response.status(200).send(locationData);
})

app.get('/weather', (request, response) => {
    const dataOfWeather = require('./data/weather.json');
    let weatherArr = dataOfWeather.data.map(e => new Weather(e));
    console.log(weatherArr);
    response.status(200).send(weatherArr);
})

app.all('*', (request,response) => {
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
