# Fantasy Wordbook Backend

For project information please refer back to https://github.com/cinnamonizers/fantasy-wordbook

## Functions List

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

## API Sample Responses
### The Lord of the Rings (The One API)
Movies

[

{

id: 6,

movie_id: '5cd95395de30eff6ebccde5b',

movie_name: 'The Two Towers '

},

{

id: 7,

movie_id: '5cd95395de30eff6ebccde5c',

movie_name: 'The Fellowship of the Ring'

},

{

id: 8,

movie_id: '5cd95395de30eff6ebccde5d',

movie_name: 'The Return of the King'

}

]

Quotes sample

{

id: 2,

movie_name: 'The Fellowship of the Ring',

quote: 'Who is she ? This woman you sing of ?',

movie_id: '5cd95395de30eff6ebccde5c'

},

{

id: 3,

movie_name: 'The Fellowship of the Ring',

quote: "Tis the Lady of L'thien. The Elf Maiden " +

'who gave her love to Beren ... a ' +

'mortal',

movie_id: '5cd95395de30eff6ebccde5c'

}

### Words API
Sample - examples, definition and synonyms for words selected (kind)

[

[

'a dry climate kind to asthmatics',

'hot summer pavements are anything but kind to the feet',

'our neighbor was very kind about the window our son broke',

'what kinds of desserts are there?',

'kind to sick patients',

'a kind master',

'kind words showing understanding and sympathy',

'thanked her for her kind letter'

],

[

'agreeable, conducive to comfort',

'tolerant and forgiving under provocation',

'a category of things distinguished by ' +

'some common characteristic or quality',

'having or showing a tender and considerate and helpful ' +

'nature; used especially of persons and their behavior'

],

[ 'genial', 'tolerant', 'form', 'sort', 'variety' ]

]

## Change Log

### Day 1

1. Project delegation into front end and backend. 
2. Set up Trello Board and GitHub repository.
3. Listed functions and components and started work on MVP.
4. Working movies and quotes routes returning data back from API calls.
5. Decided and created backend table structures for Movies and Quotes data.

### Day 2

1. Persisted Movie and Quotes data to database.
2. Restructured table for movies to work with quotes data. 
3. Integrated words API without full DB persistence.

### Day 3

1. Full data persistence achieved. Working Movies, Quotes and Words routes.
2. Refactored existing code base.
3. Deployed master branch on Heroku.
4. Implemented API call and data storage for the stretch goal.

### Day 4

1. Integrated the verses data with the front end.
2. Merged dev with master and deployed master on heroku.
3. Website is now online at www.fantasy-wordbook.com
