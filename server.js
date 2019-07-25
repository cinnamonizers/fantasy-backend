/**
 *- Project: Fantasy-wordbook
 *- Team: Cinnamonizer
 *- Definition: This serves as a backend to the project. Hanldes client request for movies, quotes & words *
 */

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
                  RETURNING *`,
  chapters: `INSERT INTO chapters(
      chapter_summary,
      chapter_number,
      chapter_name,
      name_meaning
    ) VALUES($1, $2, $3, $4)
    RETURNING *`,
  verses: `INSERT INTO verses(
    chapter_number,
    verse_number,
    verse_text,
    verse_transliteration,
    verse_meaning,
    verse_word_meanings
      ) VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *`
}


//Apps
const app = express();
app.use(cors());

//Routes for the client requests
app.get('/movies', getMovies);
app.get('/quotes', searchQuotes);
app.get('/words', searchWords);
app.get('/chapters', returnChapters);
app.get('/verses', getVerses);

//Any other routes
app.use('*', (req, res) => {
  res.send('You got in the wrong place')
})

/*************************CONSTRUCTORS****************************************** */
/**
 * Constructs a movie object to return to front end and also store in database
 * @param {*} id : unique String for each movie
 * @param {*} name : name of the movie *
 */
function Movie(id, name) {
  this.movieID = id;
  this.movieName = name;
}

/**
 * Constructs a quote object to return to front end and also store in database
 * @param {*} quote : quote from the movie chosen
 * @param {*} movieName : name of the movie that is used to generate the quote from the API
 * @param {*} movieID : unique movie ID received from API call and stored in database
 */
function Quotes(quote, movieName, movieID) {
  this.movieName = movieName;
  this.quote = quote;
  this.movieID = movieID;
}
/*************************CONSTRUCTORS****************************************** */


/**************************FUNCTIONS******************************************/


function returnChapters(request, response) {
  client.query(`SELECT * FROM chapters`).then(result => {
    response.send(result.rows);
  }).catch(error => {
    console.log(error);
  })

}

/**
 * Helper function to get the movies for the initial pageload drop-down box in the frontend
 * @param {*} request : request from the client
 * @param {*} response : response to the client
 */
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

/**
 * Helper function to the words route that makes necessary API call or get
 * results from the database
 * @param {*} request : request from the front end
 * @param {*} response : response to the front end
 */
function searchWords(request, response) {
  console.log('here at search words');
  let wordToSearch = request.query.data || 'kind';
  const url = `https://wordsapiv1.p.rapidapi.com/words/${wordToSearch}`;

  getWordID(wordToSearch, url).then(data => {
    response.send(data);
  });
}

/**
 * Helper function to the {function: searchWords}.
 * Gets the wordID for the words to search to make necessary DB calls
 * @param {*} wordToSearch : argument from the front-end to search the given word
 * @param {*} url : API url used by superagent or unirest
 */
function getWordID(wordToSearch, url) {
  const SQL = `SELECT id FROM words WHERE word=$1;`;
  const values = [wordToSearch];

  return client.query(SQL, values)
    .then(result => {
      if (result.rowCount === 0) {
        return client.query(
          SQL_INSERTS['words'], [wordToSearch]
        ).then(() => {
          return makeApiCall('wordsVariations', wordToSearch, url);
        })
      } else {
        console.log('RETURNING FROM DB');
        let wordID = result.rows[0].id;
        return cacheHit(wordID);
      }
    }).catch(console.error);
}

/**
 * Helper function to {function: getWordID} which returns the synonyms, definitions and examples
 * for the words searched from the database
 * @param {*} wordID : an argument to make necessary DB calls
 */
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

/**
 * Helper function to {function: cacheHit} which returns the examples from the DB
 * @param {*} wordID : an argument to get examples from the DB
 */

function getExamples(wordID) {
  let examples = [];
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

/**
 * Helper function to {function: cacheHit} which returns the definitions from the DB
 * @param {*} wordID : an argument to get definitions from the DB
 */
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

/**
 * Helper function to {function: cacheHit} which returns the synonyms from the DB
 * @param {*} wordID : an argument to get synonyms from the DB
 */
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

/**
 * Helper function to quotes route which used movie ID to make neccesary API calls and query database
 * @param {*} request : request from the front end
 * @param {*} response : response to the front end
 */
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

/**
 * Helper function to get the movie ID of the movie name which is passed as a parameter.
 * The parameter is passed from front end. The function is used by quotes route to make
 * API call using movie ID
 * @param {*} movieName : name of the movie passed from front end
 */
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

/**
 * Helper function to check database and make api call if data does not exist.
 * Otherwise, it retrieves from database
 * @param {*} search_query : column name for the database
 * @param {*} search_value : column value to search for
 * @param {*} url : url to make API call
 * @param {*} tableName : table from DB to work with
 */

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

/**
 * Helper function to make relevant API call and store in DB based on the parameters passed
 * @param {*} tableName : table from DB to work with
 * @param {*} search_value : column value to search for
 * @param {*} url : url to make API call
 */
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
        return unirest.get(url + '/examples')
          .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
          .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
          .then(result => {
            result.body.examples.map(item => {
              client.query(
                SQL_INSERTS['examples'], [item, sqlResult.rows[0].id] //Insert into DB
              )
              ex.push(item);
            })
            return unirest.get(url + '/definitions')
              .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
              .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
              .then(result => {
                result.body.definitions.forEach(item => {
                  client.query(
                    SQL_INSERTS['definitions'], [item.definition, sqlResult.rows[0].id] //Insert into DB
                  )
                  def.push(item.definition);
                })
                return unirest.get(url + '/synonyms')
                  .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
                  .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
                  .then(result => {
                    result.body.synonyms.forEach(item => {
                      client.query(
                        SQL_INSERTS['synonyms'], [item, sqlResult.rows[0].id] //Insert into DB
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

/**
 * Helper function to access sql results and send it back to the first caller in the stack
 * @param {*} sqlResult : the result from the DB
 */
function sendFromDB(sqlResult) {
  console.log('returning from DB');
  return sqlResult.rows;
}

/**
 * Initialization function that makes a necessary API call if movie information
 * is not in the database
 */
function pageLoad() {
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

/**
 * Helper function that gets executed when the server starts to get chapters information from the API and store into the DB
 */

function getChapters() {
  let url = 'https://bhagavadgita.io/auth/oauth/token';
  return client.query(`SELECT * FROM chapters`).then(result => {
    if (result.rowCount === 0) {
      superagent.post(url)
        .type('form')
        .send({ client_id: process.env.CLIENT_ID })
        .send({ client_secret: process.env.CLIENT_SECRET })
        .send({ 'grant_type': 'client_credentials' })
        .send({ 'scope': 'verse chapter' })
        .then(result => {
          let ACCESS_TOKEN = result.body.access_token;
          let getUrl = `https://bhagavadgita.io/api/v1/chapters?access_token=${ACCESS_TOKEN}`
          superagent.get(getUrl).then(result => {
            result.body.forEach(item => {
              client.query(
                SQL_INSERTS['chapters'], [item.chapter_summary, item.chapter_number, item.name, item.name_meaning]
              )
            })
          })

        })

    }
  }).catch(error => {
    console.log(error)
  }) // client query ends

}

function getVerses(request, response) {
  console.log('here in Get Verses');
  let url = 'https://bhagavadgita.io/auth/oauth/token';
  return client.query(`SELECT * FROM verses`).then(result => {
    if (result.rowCount === 0) {
      superagent.post(url)
        .type('form')
        .send({ client_id: process.env.CLIENT_ID })
        .send({ client_secret: process.env.CLIENT_SECRET })
        .send({ 'grant_type': 'client_credentials' })
        .send({ 'scope': 'verse chapter' })
        .then(result => {
          let ACCESS_TOKEN = result.body.access_token;
          let getUrl = `https://bhagavadgita.io/api/v1/verses?access_token=${ACCESS_TOKEN}`
          superagent.get(getUrl).then(result => {
            result.body.forEach(item => {
              client.query(
                SQL_INSERTS['verses'], [item.chapter_number, item.verse_number, item.text, item.transliteration, item.meaning, item.word_meanings]
              )
            })
          })

        })

    }
  }).catch(error => {
    console.log(error)
  }) // client query ends
}

/**************************FUNCTIONS******************************************/


//Starting Server
app.listen(PORT, () => {
  console.log('listing on port', PORT);
  pageLoad();
  getChapters();
})
