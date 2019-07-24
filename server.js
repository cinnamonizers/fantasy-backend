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

app.get('/movies', getMovies);
app.get('/quotes', searchQuotes);
app.get('/words', searchWords);

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
  let finalMovies = [];
  (client.query(`SELECT * FROM movies`).then(result => {
    result.rows.forEach(item => {
      if (item.id === 6 || item.id === 7 || item.id === 8) {
        finalMovies.push(item);
      }
    })
    response.send(finalMovies);
  }));
}

function getMovieID(movieName) {

  const SQL = `SELECT movie_id FROM movies WHERE movie_name=$1;`;
  const values = [movieName];
  let movieID = '';

  return client.query(SQL, values)
    .then(result => {
      movieID = result.rows[0].movie_id;
      return movieID;
    })
    .catch(console.error);
}

function searchWords(request, response) {
  console.log('here at search words');
  let wordToSearch = request.query.data || 'kind';
  const url = `https://wordsapiv1.p.rapidapi.com/words/${wordToSearch}`;

  getWordID(wordToSearch, url).then(data => {
    response.send(data);
  });


}

function getWordID(wordToSearch, url) {

  const SQL = `SELECT id FROM words WHERE word=$1;`;
  const values = [wordToSearch];

  return client.query(SQL, values)
    .then(result => {
      if (result.rowCount === 0) {
        console.log('RESULTS FROM WORD API____', result);
        return client.query(
          SQL_INSERTS['words'], [wordToSearch]
        ).then(() => {
          return makeApiCall('wordsVariations', wordToSearch, url);
        })

      } else {
        console.log('RETURNING FROM DB');
        let wordID = result.rows[0].id;
        console.log('Word ID___', wordID);
        return cacheHit(wordID);
      }
    }).catch(console.error);
}

function cacheHit(wordID) {

  let wordResult = [];

  return getExamples(wordID).then(examples => {
    return getDefinitions(wordID).then(definitions => {
      return getSynonyms(wordID).then(synonyms => {
        wordResult.push(examples);
        wordResult.push(definitions);
        wordResult.push(synonyms);
        return wordResult;
      });//syn ends
    });//defn
  });//examples
}

function getExamples(wordID) {

  let examples = [];
  console.log('Word ID in getExamples___', wordID);
  const SQL = `SELECT * FROM examples WHERE word_id=$1;`;
  const values = [wordID];

  return client.query(SQL, values)
    .then(result => {
      result.rows.map(item => {
        examples.push(item.example);
      })
      return examples;
    })
    .catch(console.error);
}

function getDefinitions(wordID) {
  let definitions = [];
  const SQL = `SELECT * FROM definitions WHERE word_id=$1;`;
  const values = [wordID];

  return client.query(SQL, values)
    .then(result => {
      result.rows.map(item => {
        definitions.push(item.def);
      })
      return definitions;
    })
    .catch(console.error);
}

function getSynonyms(wordID) {
  const SQL = `SELECT * FROM synonyms WHERE word_id=$1;`;
  const values = [wordID];
  let synonyms = [];

  return client.query(SQL, values)
    .then(result => {
      result.rows.map(item => {
        synonyms.push(item.syn);
      })
      return synonyms;
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
        response.send(data);
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
                RETURNING *`,
  definitions: `INSERT INTO definitions(
    def,
    word_id
    
  ) VALUES($1, $2)
                RETURNING *`,
  examples: `INSERT INTO examples(
    example,
    word_id
    
  ) VALUES($1, $2)
                RETURNING *`,
  synonyms: `INSERT INTO synonyms(
    syn,
    word_id
    
  ) VALUES($1, $2)
                RETURNING *`,
  words: `INSERT INTO words(
                  word
                  ) VALUES($1)
                  RETURNING *`

}

//Check DB

function checkDB(search_query, search_value, url, tableName) {
  return client.query(`SELECT * FROM ${tableName} WHERE ${search_query} = $1`, [search_value])
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
  let movieID = '';
  let arrayOfQuotes = [];
  let words = [];
  let syn = [];
  let ex = [];
  let def = [];


  switch (tableName) {
    case 'quotes':
      movieID = url.split('/')[5];
      arrayOfQuotes = [];
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

    case 'wordsVariations':
      return client.query(
        `SELECT id FROM words WHERE word=$1`, [search_value]
      ).then(sqlResult => {
        //id is the primary key
        return unirest.get(url + '/examples')
          .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
          .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
          .then(result => {
            // console.log(result.body);
            result.body.examples.map(item => {
              client.query(
                SQL_INSERTS['examples'], [item, sqlResult.rows[0].id]  //Insert into DB
              )
              ex.push(item);
            })
            return unirest.get(url + '/definitions')
              .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
              .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
              .then(result => {
                result.body.definitions.forEach(item => {
                  client.query(
                    SQL_INSERTS['definitions'], [item.definition, sqlResult.rows[0].id]  //Insert into DB
                  )
                  def.push(item.definition);
                })
                return unirest.get(url + '/synonyms')
                  .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
                  .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
                  .then(result => {
                    result.body.synonyms.forEach(item => {
                      client.query(
                        SQL_INSERTS['synonyms'], [item, sqlResult.rows[0].id]  //Insert into DB
                      )
                      syn.push(item);
                    })
                    words.push(ex);
                    words.push(def);
                    words.push(syn);
                    return words;

                  })//third unirest

              }) //second unirest

          }) //first unirest
      }).catch(e => console.log(e)) //client query ends

  } //switch ends

}

//Send from DB

function sendFromDB(sqlResult) {
  console.log('returning from DB');
  return sqlResult.rows;
}

function startServer() {
  let arrayOfMovies = [];
  return client.query(`SELECT * FROM movies`).then(result => {
    if (result.rowCount === 0) {
      const url = `https://the-one-api.herokuapp.com/v1/movie`;
      let tableName = 'movies';
      return superagent.get(url)
        .set('Authorization', `Bearer ${process.env.MOVIE_API_KEY}`)
        .then(result => {
          result.body.docs.forEach(item => {
            arrayOfMovies.push(new Movie(item._id, item.name));
            return client.query(
              SQL_INSERTS[tableName], [item._id, item.name]
            )
          }) //for each ends
        }).catch(e => {
          console.log(e);
        });
    }

  });
}

//Starting Server
app.listen(PORT, () => {
  console.log('listing on port', PORT);
  startServer();

})
