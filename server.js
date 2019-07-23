'Use strict'

//Dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');


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

app.get('/movies', getMovies);
app.get('/quotes', searchQuotes);
// app.get('/words', searchWords);

//Any other routes
app.use('*', (req, res) => {
  res.send('You got in the wrong place')
})
//Constructors
function Movie(id, name) {
  this.movieID = id;
  this.movieName = name;
}

function Quotes(quote, movieName, movieID) {
  this.movieName = movieName;
  this.quote = quote;
  this.movieID = movieID;
}


function getMovies(request, response) {
  console.log('here at get movies');

  const url = `https://the-one-api.herokuapp.com/v1/movie`;

  let tableName = 'movies';
  let movieID = request.query.data || '5cd95395de30eff6ebccde5d';

  checkDB('movie_id', movieID, url, tableName)
    .then(data => {
      console.log('data', data);
      response.send(data);
    }).catch(e => {
      console.log(e);
    });



}

// function searchWords(request, response) {
//   console.log('here at search words');
//   let wordToSearch = request.query.data || 'King';

// }

function getMovieID(movieName) {

  const SQL = `SELECT movie_id FROM movies WHERE movie_name=$1;`;
  const values = [movieName];
  let movieID = '';
  console.log(movieName, SQL, values);

  return client.query(SQL, values)
    .then(result => {
      movieID = result.rows[0].movie_id;
      return movieID;
    })
    .catch(console.error);
}

function searchQuotes(request, response) {
  console.log('here at search quotes');
  let movieName = request.query.data || 'The Fellowship of the Ring';
  let movieID = '';

  getMovieID(movieName).then(item => {
    movieID = item;
    let tableName = 'quotes';
    const url = `https://the-one-api.herokuapp.com/v1/movie/${movieID}/quote`;

    checkDB('movie_name', movieName, url, tableName)
      .then(data => {
        response.send(data.slice(0, 50));
      }).catch(e => {
        console.log(e);
      });
  });

}

//SQL INSERTS
const SQL_INSERTS = {

  movies: `INSERT INTO movies(
    movie_id,
    movie_name
    
  ) VALUES($1, $2)
                RETURNING *`,
  quotes: `INSERT INTO quotes(
    movie_name,
    quote,
    movie_id
    
  ) VALUES($1, $2, $3)
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

  if (tableName === 'quotes') {
    let movieID = url.split('/')[5];
    let arrayOfQuotes = [];
    return superagent.get(url)
      .set('Authorization', `Bearer ${process.env.MOVIE_API_KEY}`)
      .then(result => {
        arrayOfQuotes = result.body.docs.map(item => {
          const newQuote = new Quotes(item.dialog, search_value, movieID);
          client.query(
            SQL_INSERTS[tableName], [newQuote.movieName, newQuote.quote, newQuote.movieID]
          )
          return newQuote;

        })
        return arrayOfQuotes;
      })
  } else {

    let arrayOfMovies = [];
    return superagent.get(url)
      .set('Authorization', `Bearer ${process.env.MOVIE_API_KEY}`)
      .then(result => {
        result.body.docs.forEach(item => {
          arrayOfMovies.push(new Movie(item._id, item.name));

          client.query(
            SQL_INSERTS[tableName], [item._id, item.name]
          )

        }) //for each ends

        console.log('after api call');

        return arrayOfMovies;
      });


  }

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
