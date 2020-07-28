'use strict';

const server = require('express');
const cors = require('cors');
const superagent = require('superagent');
const { response, request } = require('express');
require('dotenv').config();
const app = server();
app.use(cors());

const PORT = process.env.PORT || 3500;

//Location 

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

var locationLatlon = [];


//Weather 

app.get('/weather', getWeather);

function getWeather(request, response) {
    weatherData().then(returnedData => {
        response.status(200).send(returnedData);
    })

};

function weatherData() {
    let APIKEY = process.env.WEATHER_API_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${locationLatlon[0]}&lon=${locationLatlon[1]}&key=${APIKEY}`
    return superagent.get(url).then(data => {
        let weatherData = JSON.parse(data.text);
        let weatherArr = weatherData.data.map(e => new Weather(e));
        return weatherArr.splice(0,8);
    })
};


//Trails

app.get('/trails', getTrails);

function getTrails(request, response) {
    trailsData().then(returnedData => {
        response.status(200).send(returnedData);
    })

};

function trailsData() {
    let APIKEY = process.env.TRAIL_API_KEY;
    let url = `https://www.hikingproject.com/data/get-trails?lat=${locationLatlon[0]}&lon=${locationLatlon[1]}&maxDistance=10&key=${APIKEY}`
    return superagent.get(url).then(data => {
        let trailsData = JSON.parse(data.text);
        let trailsArr = trailsData.trails.map(e => new Trails(e));
        return trailsArr;
    })
};


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
    
    locationLatlon[0]= data[0].lat;
    locationLatlon[1]= data[0].lon;

}

function Weather(data) {
    this.forecast = data.weather.description;
    this.time = data.valid_date;
}

function Trails(data){
    this.name = data.name;
    this.location = data.location;
    this.length = data.length;
    this.stars = data.stars;
    this.starVotes = data.star_votes;
    this.summary = data.summary;
    this.trailUrl = data.trail_url;
    this.conditions = data.conditions;
    this.conditionData = data.condition_data;
    this.conditionTime = data.condition_time;
}
