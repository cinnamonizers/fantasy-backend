# Fantast Wordbook Backend

For project information please refer back to https://github.com/cinnamonizers/fantasy-wordbook

# Functions List

- getMovies - Helper function to get the movies for the initial pageload drop-down box in the frontend

- searchWords - Helper function to the words route that makes necessary API call or gets results from the database

- getWordID - Helper function to the {function: searchWords}. Gets the wordID for the words to search to make necessary DB calls. Needed as Word ID is the primary key

- cacheHit - Helper function to {function: getWordID} which returns the synonyms, definitions and examples from the database for the words searched

- getExamples - Helper function to {function: cacheHit} which returns the examples of word usage from the DB

- getDefinitions - Helper function to {function: cacheHit} which returns the definitions of the word searched from the DB

- getSynonyms - Helper function to {function: cacheHit} which returns the synonyms of the words searched from the DB

- searchQuotes - Helper function to quotes route which uses movie ID to make neccesary API calls or query database

- getMovieID - Helper function to get the movie ID of the movie whose name which is passed as a parameter.

- checkDB - Helper function to check database and make api call if data does not exist.
Otherwise, retrieve from database

- makeApiCall - Helper function to make relevant API call and store in DB based on the parameters passed

- sendFromDB - Helper function to access sql results and send it back to the first caller in the stack

- pageLoad - Initialization function that makes an API call to get movie information if not in the database

- getChapters - Helper function that gets executed when the server starts to get chapters information from the API and store into the DB

- returnChapters - Helper function to return bhagavad gita chapters to the front end when requested

- returnVerses - Helper function to return bhagavad gita verses to the front end when requested

- getVerses - Helper function that gets executed when the server starts to get verses information from the API and store into the DB

# Change Log

# Day 1

1. Project delegation into front end and backend. 
2. Set up Trello Board and GitHub repository.
3. Listed functions and components and started work on MVP.
4. Working movies and quotes routes returning data back from API calls.
5. Decide and create backend table structures for Movies and Quotes data.

# Day 2

1. Persisted Movie and Quotes data to database.
2. Restructure table for movies to work with quotes data. 
3. Integrate words API without full DB persistence.

# Day 3

1. Full data persistence achieved. Working Movies, Quotes and Words routes.
2. Refactor existing code base.
3. Deployed master branch on Heroku.
4. Implemented API call and data storage for the stretch goal.