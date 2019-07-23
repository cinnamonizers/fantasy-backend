DROP TABLE IF EXISTS definitions;
DROP TABLE IF EXISTS examples;
DROP TABLE IF EXISTS synonyms;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS words;

CREATE TABLE movies(
  id SERIAL,
movie_id VARCHAR(255) PRIMARY KEY,
movie_name VARCHAR(255)
);

CREATE TABLE words(
  id SERIAL PRIMARY KEY,
  word VARCHAR(255)
);

CREATE TABLE definitions(
  id SERIAL PRIMARY KEY,
  def VARCHAR(255),
  word_id INTEGER NOT NULL,
  FOREIGN KEY (word_id) REFERENCES words (id)
);

CREATE TABLE examples(
  id SERIAL PRIMARY KEY,
  example VARCHAR(255),
  word_id INTEGER NOT NULL,
  FOREIGN KEY (word_id) REFERENCES words (id)
);

CREATE TABLE synonyms(
  id SERIAL PRIMARY KEY,
  syn VARCHAR(255),
  word_id INTEGER NOT NULL,
  FOREIGN KEY (word_id) REFERENCES words (id)
);

CREATE TABLE quotes(
id SERIAL PRIMARY KEY,
movie_name VARCHAR(255),
quote TEXT,
movie_id VARCHAR(255) NOT NULL,
  FOREIGN KEY (movie_id) REFERENCES movies (movie_id)
);