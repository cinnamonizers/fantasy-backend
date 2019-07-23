'Use strict'

//Dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const unirest = require('unirest');


//Global vars
const PORT = process.env.PORT || 3001;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', error => {
  console.error(error);
})

//Apps
const app = express();
app.use(cors());


//Routes
app.get('/quotes', searchQuotes);
app.get('/words', searchWords);

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
      //console.log(arrayOfMovies);

    });
  response.send('Done');
  console.log('after api call');

}

function searchWords(request, response) {
  console.log('here at search words');
  let wordToSearch = request.query.data || 'King';
  const url = `https://wordsapiv1.p.rapidapi.com/words/${wordToSearch}/examples`;

  unirest.get(url)
    .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
    .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
    .then(result => {
      console.log(result.body);
      response.send(result.body);
    })
}

function searchQuotes(request, response) {
  console.log('here at search quotes');
  let movieName = request.query.data || 'The Return of the King';
  let movieID = request.query.data || '5cd95395de30eff6ebccde5d';


  let tableName = 'quotes';
  const url = `https://the-one-api.herokuapp.com/v1/movie/${movieID}/quote`;

  checkDB('movie_name', movieName, url, tableName)
    .then(data => {
      response.send(data.slice(0, 50));
    }).catch(e => {
      console.log(e);
    });
}

//SQL INSERTS
const SQL_INSERTS = {
  quotes: `INSERT INTO quotes(
    movie_name,
    quote
    
  ) VALUES($1, $2)
                RETURNING *`
}

//Check DB

function checkDB(search_query, search_value, url, tableName) {
  return client.query(`SELECT * FROM ${tableName} WHERE ${search_query}=$1`, [search_value])
    .then(sqlResult => {
      if (sqlResult.rowCount === 0) {
        return makeApiCall(tableName, search_value, url);
      } else {
        return sendFromDB(sqlResult);
      }
    })

}

//make API Call

function makeApiCall(tableName, search_value, url) {

  console.log('Making an API call');
  let arrayOfQuotes = [];
  return superagent.get(url)
    .set('Authorization', `Bearer ${process.env.MOVIE_API_KEY}`)
    .then(result => {
      arrayOfQuotes = result.body.docs.map(item => {
        const newQuote = new Quotes(item.dialog, search_value);
        client.query(
          SQL_INSERTS[tableName], [newQuote.movieName, newQuote.quote]
        )
        return newQuote;

      })
      return arrayOfQuotes;
    })
}

//Send from DB

function sendFromDB(sqlResult) {
  console.log('returning from DB');
  return sqlResult.rows;
}

//Starting Server
app.listen(PORT, () => {
  console.log('listing on port', PORT);
})
