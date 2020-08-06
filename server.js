'use strict';

const server = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const { response, request } = require('express');

const app = server();
app.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);

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
    let selectSQL = `SELECT * FROM locations WHERE search_query = '${city}'`;
    return client.query(selectSQL).then(result => {
        if (result.rowCount) {
            return result.rows[0];
        } else {
            return superagent.get(url).then(data => {
                let locationData = new Location(city, data.body);
                let queryValues = [locationData.search_query, locationData.formatted_query, locationData.latitude, locationData.longitude];
                let SQL = 'INSERT INTO locations(search_query,formatted_query,latitude,longitude) Values ($1,$2,$3,$4);';
                client.query(SQL, queryValues).then(result => {
                    return locationData;
                });
            });
        };
    });
};

//Weather 

app.get('/weather', getWeather);

function getWeather(request, response) {
    let lon = request.query.longitude;
    let lat = request.query.latitude;
    weatherData(lon, lat).then(returnedData => {
        response.status(200).send(returnedData);
    })

};

function weatherData(lon, lat) {
    let APIKEY = process.env.WEATHER_API_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${APIKEY}`
    return superagent.get(url).then(data => {
        let weatherData = data.body.data;
        let weatherArr = weatherData.map(e => new Weather(e));
        return weatherArr.splice(0, 8);
    })
};


//Trails

app.get('/trails', getTrails);

function getTrails(request, response) {
    let lon = request.query.longitude;
    let lat = request.query.latitude;
    trailsData(lon, lat).then(returnedData => {
        response.status(200).send(returnedData);
    })

};

function trailsData(lon, lat) {
    let APIKEY = process.env.TRAIL_API_KEY;
    let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${APIKEY}`
    return superagent.get(url).then(data => {
        let trailsData = data.body.trails;
        let trailsArr = trailsData.map(e => new Trails(e));
        return trailsArr;
    })
};

// Movies 

app.get('/movies', getMovies);

function getMovies(request, response) {
    moviesData().then(returnedData => {
        response.status(200).send(returnedData);
    })
};

function moviesData() {
    let APIKEY = process.env.MOVIE_API_KEY;
    let url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${APIKEY}&language=en-US&page=1`;
    return superagent.get(url).then(data => {
        let moviesData = data.body.results;
        let moviesArr = moviesData.map(e => new Movies(e));
        return moviesArr;
    });
};

// yelp 

app.get('/yelp', getYelp);

function getYelp(request, response) {
    let lon = request.query.longitude;
    let lat = request.query.latitude;
    let page = request.query.page;
    yelpData(lon, lat, page).then(returnedData => {
        response.status(200).send(returnedData);
    })
};

function yelpData(lon, lat, page) {
    let APIKEY = process.env.YELP_API_KEY;
    let offset = (page - 1) * 5;
    let url = `https://api.yelp.com/v3/businesses/search?term=restaurants`;
    let queryParams = {
        'latitude' : lat,
        'longitude' : lon,
        'limit' : 5,
        'offset' : offset,
    };
    return superagent.get(url).set('Authorization', `Bearer ${APIKEY}`).query(queryParams).then(data => {
        let yelpData = data.body.businesses;
        let yelpArr = yelpData.map(e => new Yelp(e));
        return yelpArr;
    })
};

app.all('*', (request, response) => {
    response.status(500).send('this page doesn`t exist !!');
})

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

function Trails(data) {
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

function Movies(data) {
    this.title = data.title;
    this.overview = data.overview;
    this.averageVotes = data.vote_average;
    this.totalVotes = data.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
    this.popularity = data.popularity;
    this.releasedOn = data.release_date;
}

function Yelp(data) {
    this.name = data.name;
    this.image_url = data.image_url;
    this.price = data.price;
    this.rating = data.rating;
    this.url = data.url;
  }


client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('server is listening to port ', PORT);
    });
});