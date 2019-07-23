DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS movies;

CREATE TABLE movies(
  id SERIAL,
movie_id VARCHAR(255) PRIMARY KEY,
movie_name VARCHAR(255)
);

CREATE TABLE quotes(
id SERIAL PRIMARY KEY,
movie_name VARCHAR(255),
quote TEXT,
movie_id VARCHAR(255) NOT NULL,
  FOREIGN KEY (movie_id) REFERENCES movies (movie_id)
);