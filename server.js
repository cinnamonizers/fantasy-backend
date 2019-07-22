'Use strict'

//Dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');


//Global vars
const PORT = process.env.PORT || 3001;
// const client = new pg.Client(process.env.DATABASE_URL);
// client.connect();
// client.on('error', error => {
//   console.error(error);
// })

//Apps
const app = express();
app.use(cors());


//Routes
app.get('/quotes', searchQuotes);

//Any other routes
app.use('*', (req, res) => {
  res.send('You got in the wrong place')
})
//Constructors
function Movie(data) {
  this.movieName = data.name;
}

function Quotes(quote, movieName) {
  this.movieName = movieName;
  this.quote = quote;
}


function getMovies(request, response) {
  console.log('here at get movies');

  const url = `https://the-one-api.herokuapp.com/v1/movie`;
  let arrayOfMovies = [];

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.MOVIE_API_KEY}`)
    .then(result => {
      result.body.docs.forEach(item => {
        arrayOfMovies.push(new Movie(item));
      })
      console.log(arrayOfMovies);

    });
  response.send('Done');
  console.log('after api call');

}


function searchQuotes(request, response) {
  console.log('here at search quotes');
  let movieName = request.query.data || 'The Return of the King';
  let movieID = request.query.data || '5cd95395de30eff6ebccde5d';
  let arrayOfQuotes = [];

  const url = `https://the-one-api.herokuapp.com/v1/movie/${movieID}/quote`;
  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.MOVIE_API_KEY}`)
    .then(result => {
      arrayOfQuotes = result.body.docs.map(item => {

        return new Quotes(item.dialog, movieName);
      })

      console.log(arrayOfQuotes);
      response.send(arrayOfQuotes);

    }).catch(e => {
      console.log(e);
    });

}









//Start process
//SQL INSERTS
//Check DB
//make API Call




//Starting Server
app.listen(PORT, () => {
  console.log('listing on port', PORT);
})
