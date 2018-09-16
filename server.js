/** import the necessary node packages */
var express = require('express');
var fs = require('fs');           // allow access to filesystem
var path = require('path');       // allow filepath maninipulation
var request = require('request-promise'); // allow http requests
var querystring = require('querystring');

//this is a parser for request bodies implemented as "middleware"
//see https://expressjs.com/en/4x/api.html#req.body
//see https://www.npmjs.com/package/body-parser
var bodyParser = require('body-parser');

/** the instance of our express app */
var app = express();

/** this is an API key required to send queries to ombd */
var omdbApiKey = "c41ae294";

/** add `./public` as a root for static resources */
app.use(express.static(path.join(__dirname, '/public')));

/** tell our web app to parse urlencoded bodies
 * see https://www.npmjs.com/package/body-parser#bodyparserurlencodedoptions
 */
app.use(bodyParser.urlencoded({ extended: false }));

/** when handling HTTP requests that contain a body parse the data as JSON 
 *
 * see https://expressjs.com/en/4x/api.html#app.use
 */
app.use(bodyParser.json());

/** now that we've setup /public as a static resource 
 * bind the "/" URI of our site to the public directory.
 *
 * By default the `index.html` file will be sent as a response 
 * to the request for the root of our website.
 */
app.use('/', express.static(path.join(__dirname, 'public')));

/** Search for movies by the given text. 
 *
 * This returns a list of movie data or an empty list on error
 */
function searchMovie(searchText) {
	//remove excess white space from search text
	searchText = searchText.trim();

	//if we were given an empty string don't even try to send a request to omdb
	//just return an empty list
  if(searchText === '')
  {
    return Promise.resolve([]);
  }

  //sanitize the search
  var search = querystring.stringify({s: searchText, apikey: omdbApiKey});
  
  //send the request
  return request('http://www.omdbapi.com/?'+search)
    .then((moviesAsJSONString) => {
      return JSON.parse(moviesAsJSONString).Search || [];
    });
}

/** Fetches the full details for a given movie id 
 *
 */
function getMovieDetails(imdbID) {
	
	//same as above. Return an empty list immediately if
	//we were given an invalid string
  if(typeof(imdbID) != 'string' || imdbID === '')
  {
    return Promise.resolve([]);
  }

  //sanitize the search
  var search = querystring.stringify({i: imdbID, apikey: omdbApiKey});
  
  //send the request
  return request('http://www.omdbapi.com/?'+search)
    .then((moviesAsJSONString) => {
      return JSON.parse(moviesAsJSONString);
    });
}

/** Fetches the favorites from our database
 * 
 * This allows us to abstract away the internals of the database we're using
 * 
 */
function getFavoritesDB() {
  //read the the data.json from the filesystem
  return JSON.parse(fs.readFileSync('./data.json'));
}

/** Save the set of favorite movies to the database 
 *
 */
function setFavoritesDB(favorites) {
  //save the new data to our filesystem for persistence
  fs.writeFile('./data.json', JSON.stringify(favorites));
}

/** Adds a movie to the list of favorites.
 *
 * This method is a thin wrapper to guard against saving movies that
 * weren't previously marked as being favorited (`movie.isFavorite === true`)
 */
function addFavoriteMovie(favorites, movie) {
	//make sure the movie is marked as a favorite
	//and that there isn't already a movie with the same id in the db
  if(movie.isFavorite 
    && !favorites.some(favoriteMovie => favoriteMovie.imdbID == movie.imdbID)
  ){
    //append the data from the client to the data file
    favorites.push(movie);
  }

  return favorites;
}

/** Remove a movie from the list of favorites given the movie id */
function removeFavoriteMovie(favorites, imdbID) {
  return favorites.filter(movie => movie.imdbID != imdbID);
}

/** Bind `/search` as a GET handler for searching movies.
 *
 * This sends a list of movie data encoded as JSON in the HTTP response back to
 * the client.
 */
app.get('/search', function(req, res){

  var favorites = getFavoritesDB();

  searchMovie(req.query.name)
    .then(foundMovies => {

      foundMovies.forEach(movie => {
        movie.isFavorite = 
          favorites.some(favoriteMovie => favoriteMovie.imdbID === movie.imdbID);
      });

      res.setHeader('Content-Type', 'application/json');
      res.send(foundMovies);
    });
});

/** Bind `/favorites` as a GET handler to fetch the list of favorites
 *
 * This sends a list of movie data encoded as JSON in the HTTP response.
 */
//TODO: duplicate of function below?
//not sure why this just sends all of the data
app.get('/favorites', function(req, res){
  //setup the response header to notify the client we're sending them JSON data.
  //we do this by setting the Content-Type to application/json
  res.setHeader('Content-Type', 'application/json');

  //send the json data back to the client
  res.send(getFavoritesDB());
}); 

/** bind `/favorites` as a POST handler for adding a movie to the list of
 * favorites 
 *
 * This sends the given movie right back in the HTTP response.
 */
//TODO: this looks like it should be PUT request not a get
app.post('/favorites', function(req, res){

  var movie = req.body;

  if(!movie.imdbID){
    res.send("Error. Request body does not have a valid imdbID");
    return;
  }

  //read in the current data from our file
  var favorites = getFavoritesDB();

  //if the movie is selected to be a favorite and we don't already contain
  //that data in our database then add the data
  if(movie.isFavorite)
    setFavoritesDB(addFavoriteMovie(favorites, movie));
  else
    setFavoritesDB(removeFavoriteMovie(favorites, movie.imdbID));
      
  //return the newly formed data to the client
  res.setHeader('Content-Type', 'application/json');
  res.send(movie);
});

/** Binds `/details` as a GET handler which returns the full details for a
 * given movie
 * 
 * This takes `imdbID` as a query paramenter.
 *
 * Sends a JSON encoded object containing the full details of the given movie.
 *
 */
app.get('/details', function(req, res) {
  getMovieDetails(req.query.imdbID)
    .then(foundMovie => {

      res.setHeader('Content-Type', 'application/json');
      res.send(foundMovie);
    });
});

/** run the webserver. This is like running the main() in a c program 
 * Here we've setup the server to run on port 3000 of the localhost.
 *
 * see https://expressjs.com/en/4x/api.html#app.listen
 */
app.listen(3000, function(){
  console.log("Listening on port 3000");
});
