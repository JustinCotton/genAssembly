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

/** add `./public` as a static resource for the website */
app.use(express.static(path.join(__dirname, '/public')));

/** tell our web app to only parse urlencoded request bodies 
 * see https://www.npmjs.com/package/body-parser#bodyparserurlencodedoptions
 */
app.use(bodyParser.urlencoded({ extended: false }));

/** when handling HTTP requests that contain the body parse the data as JSON 
 *
 * see https://expressjs.com/en/4x/api.html#app.use
 */
app.use(bodyParser.json());

/** now that we've setup /public as a static resource 
 * bind the "/" URI of our site to the public directory.
 * By default the `index.html` file will be sent as a response 
 * to the request for the root of our website.
 */
app.use('/', express.static(path.join(__dirname, 'public')));

/** Search for movies by the given text. 
 *
 */
function searchMovie(searchText) {
  if(typeof(searchText) != 'string' || searchText === '')
  {
    return Promise.resolve([]);
  }

  //sanitize the search
  var search = querystring.stringify({s: searchText, apikey: omdbApiKey});
  
  //send the request
  return request('http://www.omdbapi.com/?'+search)
    .then((moviesAsJSONString) => {
      return JSON.parse(moviesAsJSONString).Search;
    });
}

function getMovieDetails(imdbID) {
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

function getFavoritesDB() {
  //read the the data.json from the filesystem
  return JSON.parse(fs.readFileSync('./data.json'));
}

function setFavoritesDB(favorites) {
  //save the new data to our filesystem for persistence
  fs.writeFile('./data.json', JSON.stringify(favorites));
}

function addFavoriteMovie(favorites, movie) {
  if(movie.isFavorite 
    && !favorites.some(favoriteMovie => favoriteMovie.imdbID == movie.imdbID)
  ){
    //append the data from the client to the data file
    favorites.push(movie);
  }

  return favorites;
}

function removeFavoriteMovie(favorites, imdbID) {
  return favorites.filter(movie => movie.imdbID != imdbID);
}

/** Search for a movie by the title
 *
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

/** bind a GET handler to the /favorites URI
 *
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

/** bind a GET handler to the /favorites URI
 *
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
