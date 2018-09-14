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

/** Search for movies by the given text. 
 *
 */
function searchMovie(searchText)
{
  if(typeof(searchText) != 'string')
  {
    return [];
  }

  //sanitize the search
  var search = querystring.stringify({s: searchText, apikey: omdbApiKey});
  
  //send the request
  return request('http://www.omdbapi.com/?'+search)
    .then((moviesAsJSONString) => {
      return JSON.parse(moviesAsJSONString);
    });
}

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

/** Search for a movie by the title
 *
 */
app.get('/search', function(req, res){
  searchMovie(req.query.name)
    .then((foundMovies) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(foundMovies.Search);
    });
});

/** bind a GET handler to the /favorites URI
 *
 */
//TODO: duplicate of function below?
//not sure why this just sends all of the data
app.get('/favorites', function(req, res){
  //read the the data.json from the filesystem
  var data = fs.readFileSync('./data.json');

  //TODO: apply filters the data?

  //setup the response header to notify the client we're sending them JSON data.
  //we do this by setting the Content-Type to application/json
  res.setHeader('Content-Type', 'application/json');

  //send the json data back to the client
  res.send(data);
}); 

/** bind a GET handler to the /favorites URI
 *
 */
//TODO: this looks like it should be PUT request not a get
//app.get('favorites', function(req, res){

  ////if the body doesn't have a name and object ID
  ////then let the client know we have an error
  //if(!req.body.name || !req.body.oid){
    //res.send("Error");
    //return;
  //}
  
  ////append the data from the client to the data file
  //var data = JSON.parse(fs.readFileSync('./data.json'));
  //data.push(req.body);
  //fs.writeFile('./data.json', JSON.stringify(data));
  //res.setHeader('Content-Type', 'application/json');

  ////return the newly formed data to the client
  //res.send(data);
//});

/** run the webserver. This is like running the main() in a c program 
 * Here we've setup the server to run on port 3000 of the localhost.
 *
 * see https://expressjs.com/en/4x/api.html#app.listen
 */
app.listen(3000, function(){
  console.log("Listening on port 3000");
});
