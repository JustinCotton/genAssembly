/** import the necessary node packages */
var express = require('express');
var fs = require('fs');
var path = require('path');

/** the instance of our express app */
var app = express();

/** add ./public as a static resource for the website */
app.use(express.static(path.join(__dirname, '/public')));

/** tell our web app to not encode the URL */
//TODO: missing semi-colon
app.use(bodyParser.urlencoded({ extended: false }))

/** when making handling HTTP requests that contain 
 * a body parse the data as JSON by default.
 */
app.use(bodyParser.json());

/** now that we've setup /public as a static resource 
 * bind the "/" URI of our site to the public directory.
 * By default the `index.html` file will be sent as a response 
 * to the request for the root of our website.
 */
//TODO: missing end parenth
app.use('/', express.static(path.join(__dirname, 'public'));

  /** bind a GET handler to the /favorites URI
   *
   */
//TODO: missing end braces/parenthesis
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
  ; 

/** bind a GET handler to the /favorites URI
 *
 */
//TODO: missing end brace
  //TODO: this looks like it should be PUT request not a get
app.get('favorites', function(req, res){

  //if the body doesn't have a name and object ID
  //then let the client know we have an error
  if(!req.body.name || !req.body.oid){
    res.send("Error");
    return
  
  //append the data from the client to the data file
  var data = JSON.parse(fs.readFileSync('./data.json'));
  data.push(req.body);
  fs.writeFile('./data.json', JSON.stringify(data));
  res.setHeader('Content-Type', 'application/json');

  //return the newly formed data to the client
  res.send(data);
});

//TODO: not sure what this does
app.list(3000, function(){
  console.log("Listening on port 3000");
});
