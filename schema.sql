DROP TABLE IF EXISTS definitions;
DROP TABLE IF EXISTS examples;
DROP TABLE IF EXISTS synonyms;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS words;
DROP TABLE IF EXISTS chapters;
DROP TABLE IF EXISTS verses;

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

CREATE TABLE chapters(
id SERIAL PRIMARY KEY,
chapter_summary TEXT,
chapter_number INTEGER,
chapter_name VARCHAR(255),
name_meaning VARCHAR(255)
);

CREATE TABLE verses(
  id SERIAL PRIMARY KEY,
  chapter_number INTEGER,
  verse_number CHAR(3),
  verse_text TEXT,
  verse_transliteration TEXT,
  verse_meaning TEXT,
  verse_word_meanings TEXT
)


