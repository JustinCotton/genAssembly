/** This is the frontend code for the web-app.
 *
 * Here we perform the client-side logic of our program
 * as well as dynamically rendering the page content.
 * 
 * We use Bulma as a CSS framework for making nice looking page components.
 * see https://bulma.io/documentation/ for more information regarding Bulma
 */

/** Fetch a list of movies from our backend */
function searchMovieByTitle(title) {
  return fetch("/search?name="+title)
    .then((res) => { return res.json(); });
}

/** Set/Unset the isFavorite flag in the given movie data 
 * and save it to the backend
 */
function toggleMovieFavorite(movieData) {
  movieData.isFavorite = !movieData.isFavorite;

  //create new request headers. If we don't tell the server we're sending it
  //JSON data then it will throw exceptions
  var reqHeaders = new Headers();
  reqHeaders.append('Content-type', 'application/json');

  return fetch("/favorites", {
    method: "POST",
    headers: reqHeaders,
    body: JSON.stringify(movieData)
  })
  .then(res => { return res.json(); });
}

/** Fetch the list of favorite movies from the backend */
function getMovieFavorites() {
  return fetch("/favorites")
    .then((res) => { return res.json(); });
}

/** Get the full details for the given movie from the backend */
function getMovieDetails(imdbID) {
  return fetch("/details?imdbID="+imdbID)
    .then((res) => { return res.json(); });
}

/** Create the class to use for the favorites icon 
 * given the isFavorite state
 *
 */
function getFavoriteIconClass(isFavorite) {
  return isFavorite ? "fa fa-star" : "fa fa-star-o";
}

/** Creates the button to use for setting whether a movie is a favorite 
 * 
 */
function renderFavoritesButton(movieData) {
  var button = document.createElement("a");
  button.setAttribute("class", "button is-rounded");

  var iconWrapper = document.createElement("span");
  iconWrapper.setAttribute("class", "icon is-small");

  var icon = document.createElement("i");
  icon.setAttribute("class", getFavoriteIconClass(movieData.isFavorite || false));

  iconWrapper.appendChild(icon);
  button.appendChild(iconWrapper);

  //add an onclick event to the button we're creating so that when
  //the user clicks it we can update the movie data in the backend.
  button.onclick = function () { 
    toggleMovieFavorite(movieData)
      .then(newMovieData => {
        icon.setAttribute("class", getFavoriteIconClass(newMovieData.isFavorite));
      }); 

    //return false so the browser doesn't attempt to go to another page.
    return false; 
  };

  return button;
}

/** Creates the Ratings data for a movie as a series of paragraphs */
function renderRatingsList(ratings) {
  var span = document.createElement("span");

  ratings.forEach(rating => {
    var p = document.createElement("p");
    p.textContent = rating.Source + " - " + rating.Value;

    span.appendChild(p);
  });

  return span;
}

/** Creates a table to display the full details of a movie */
function renderMovieDetailsTable(movieData) {
  var table = document.createElement("table");
  table.setAttribute("class", "table");

  //iterate over every immediate key in the movieData object
  //add create a new table row where the key is the first column
  //and the corresponding value is the second column.
  for(key in movieData)
  {
    //if the key isn't a direct attribute of the movie object then skip it
    //(it's something that's inherited and it's data we don't care about)
    if(!movieData.hasOwnProperty(key))
      continue;

    //don't show the Poster URL since we're already showing the poster
    if(key === 'Poster')
      continue;

    var row = table.insertRow();
    var title = row.insertCell();
    var value = row.insertCell();

    title.textContent = key;

    //render the Ratings data differently. Everything else should be plain text
    if(key === 'Ratings')
      value.appendChild(renderRatingsList(movieData[key]));
    else 
      value.textContent = movieData[key];
  }

  return table;
}

/** Creates a container to display the Poster image and full details of a movie
 *
 * see https://bulma.io/documentation/layout/media-object/ for an example media
 * object.
 */
function renderMovieDetails(movieData) {

	//create a container to hold the details data
  var box = document.createElement("div");
  box.setAttribute("class", "box");

  //creaate a container to hold the content
  var content = document.createElement("div");
  content.setAttribute("class", "content");

  //create the image container
  var imgWrapper = document.createElement("p");
  imgWrapper.setAttribute("class", "image is-3by4" );

  //..and the image
  var movieImg = document.createElement("img");
  movieImg.setAttribute("src", movieData.Poster);
  movieImg.setAttribute("alt", movieData.Title);

  //create the title
  var movieCardTitle = document.createElement("p");
  movieCardTitle.setAttribute("class", "title is-5");
  movieCardTitle.textContent = movieData.Title;

  //create the subtitle
  var movieCardSubtitle = document.createElement("p");
  movieCardSubtitle.setAttribute("class", "subtitle is-6");
  movieCardSubtitle.textContent = movieData.Year;

  //nest the HTML nodes (inner to outer)
  content.appendChild(movieCardTitle);
  content.appendChild(movieCardSubtitle);

  imgWrapper.appendChild(movieImg);
  content.appendChild(imgWrapper);

  content.appendChild(renderMovieDetailsTable(movieData));

  box.appendChild(content);

  return box;
}

/** Creates a link for the user to select for displaying the movie details */
function renderDetailsLink(imdbID) {
  var button = document.createElement("a");
  button.setAttribute("class", "level-item");

  var icon = document.createElement("i");
  icon.setAttribute("class", "fa fa-info-circle");

  button.appendChild(icon);
  button.appendChild(document.createTextNode("\u00a0 Details"));

  //create an onclick event that handles displaying the details modal
  button.onclick = function () {
    showMovieDetailsModal(imdbID);

		//tell the event handler to not jump to a new page when we're done
		//handling the event.
    return false;
  };

  return button;
}

/** Creates a container to hold the link for showing the details 
 *
 * The container is implemented as a Bulma level.
 *
 */
function renderDetailsLevel(movieData) { 
  var level = document.createElement("nav");
  level.setAttribute("class", "level");

  var levelLeft = document.createElement("div");
  levelLeft.setAttribute("class", "level-left");

  levelLeft.append(renderDetailsLink(movieData.imdbID));
  level.append(levelLeft);

  return level;
}

/** Creates a Bulma media object to show the basic information for a given movie
 *
 * This displays a mini-image of the Poster, the Title, and year. 
 * It also contains the favorites button and the details level.
 *
 * see https://bulma.io/documentation/layout/media-object/ for more information
 * on media objects
 */
function renderMovieMediaObject(movieData) {
	//the Bulma uses the article HTML element to contain the content for a media
  //object
  var article = document.createElement("article");
  article.setAttribute("class", "media");

  //create a wrapper to contain the image
  var figure = document.createElement("figure");
  figure.setAttribute("class", "media-left");

  //...and another wrapper (per the Bulma documentation)
  var imgWrapper = document.createElement("p");
  imgWrapper.setAttribute("class", "image is-64x64 is-3by4");

  //...now create the image
  var movieImg = document.createElement("img");
  movieImg.setAttribute("src", movieData.Poster);
  movieImg.setAttribute("alt", movieData.Title);

  //create a wrapper to contain the title and year
  var mediaContent = document.createElement("div");
  mediaContent.setAttribute("class", "media-content");

  //...and another wrapper to make the display have enough
  //padding. Again, a Bulma thing.
  var contentWrapper = document.createElement("div");
  contentWrapper.setAttribute("class", "content");

  //a display for the movie title
  var movieCardTitle = document.createElement("p");
  movieCardTitle.setAttribute("class", "title is-5");
  movieCardTitle.textContent = movieData.Title;

  //a display for the movie subtitle
  var movieCardSubtitle = document.createElement("p");
  movieCardSubtitle.setAttribute("class", "subtitle is-6");
  movieCardSubtitle.textContent = movieData.Year;

  //a container to hold the favorites button
  var mediaRight = document.createElement("div");
  mediaRight.setAttribute("class", "media-right");

  //nest the HTML nodes (starting with the most inner)
  imgWrapper.appendChild(movieImg);
  figure.appendChild(imgWrapper);
  article.appendChild(figure);

  contentWrapper.appendChild(movieCardTitle);
  contentWrapper.appendChild(movieCardSubtitle);
  contentWrapper.appendChild(renderDetailsLevel(movieData));
  mediaContent.appendChild(contentWrapper);
  article.appendChild(mediaContent);

  mediaRight.appendChild(renderFavoritesButton(movieData));
  article.appendChild(mediaRight);

  return article;
}

/** Creates a container for a movie mediaObject
 *
 */
function renderMovieTile(movieMediaObject) {
  var tile = document.createElement("div");
  tile.setAttribute("class", "tile is-child box");

  tile.appendChild(movieMediaObject);

  return tile;
}


/** Creates a single row of 3 movie tiles (using renderMovieTile) */
function renderMovieTileRow(movieTiles) {
  var ancenstor = document.createElement("div");
  ancenstor.setAttribute("class", "tile is-ancestor");

  movieTiles.forEach((tile) => {
    var parent = document.createElement("div");
    parent.setAttribute("class", "tile is-parent");

    parent.appendChild(tile);
    ancenstor.appendChild(parent);
  });

  return ancenstor;
}

/** Creates a message to notify the user that there are not movies to show */
function renderNoMoviesMsg() {
  var title = document.createElement("h1");
  title.setAttribute("class", "title is-1");

  title.textContent = "There are no movies to display";

  return title;
}

/** 
 *
 */
function renderMovieTitles(movies) {
  var movieCardsContainer = document.getElementById("movieCards");

  movieCardsContainer.innerHTML = '';

  if(movies.length == 0)
  {
    movieCardsContainer.appendChild(renderNoMoviesMsg());
    movieCardsContainer.setAttribute("class", "has-text-centered");
  }

  while(movies.length > 0)
  {
    movieCardsContainer.appendChild(
      renderMovieTileRow(
        movies.splice(0, 3).map(movie => 
          renderMovieTile(renderMovieMediaObject(movie))
        )
      )
    );
  }
}

/** Callback that is used to send of a movie search to the back-end and display
 * the results 
 *
 */
function submitMovieSearch() {
  var searchText = document.getElementById("movieSearchText").value.trim();

  if(!searchText || searchText === '')
  {
    return;
  }

  searchMovieByTitle(searchText)
    .then((movies) => {
      renderMovieTitles(movies);
    });
}

/** Callback used to display the list of favorites */
function showFavorites() {
  getMovieFavorites()
    .then(favorites => {
      renderMovieTitles(favorites);
    });
}

/** Callback used to display fetch the full details and display the details
 * modal for a movie 
 *
 */
function showMovieDetailsModal(imdbID) {
  getMovieDetails(imdbID)
    .then(movieData => {
      var detailsContent = document.getElementById("movieDetails");

      detailsContent.innerHTML = '';

      detailsContent.appendChild(renderMovieDetails(movieData));

      document.getElementById("detailsModal")
        .setAttribute("class", "modal is-active");
    });
}

/** Callback used to hide the details modal */
function hideDetailsModal() {
  document.getElementById("detailsModal")
    .setAttribute("class", "modal");
}
