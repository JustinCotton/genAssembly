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

/** Creates the button to use for setting whether a movie is a favorite */
function renderFavoritesButton(movieData) {
  var button = document.createElement("a");
  button.setAttribute("class", "button is-rounded");

  var iconWrapper = document.createElement("span");
  iconWrapper.setAttribute("class", "icon is-small");

  var icon = document.createElement("i");
  icon.setAttribute("class", getFavoriteIconClass(movieData.isFavorite || false));

  iconWrapper.appendChild(icon);
  button.appendChild(iconWrapper);

  button.onclick = function () { 
    toggleMovieFavorite(movieData)
      .then(newMovieData => {
        icon.setAttribute("class", getFavoriteIconClass(newMovieData.isFavorite));
      }); 

    return false; 
  };

  return button;
}

/** Creates the Ratings data for a movie as a series of paragraphs */
function renderRatingsList(ratings) {
  var list = document.createElement("span");

  ratings.forEach(rating => {
    var ol = document.createElement("p");
    ol.textContent = rating.Source + " - " + rating.Value;

    list.appendChild(ol);
  });

  return list;
}

/** Creates a table to display the full details of a movie */
function renderMovieDetailsTable(movieData) {
  var table = document.createElement("table");
  table.setAttribute("class", "table");

  for(key in movieData)
  {
    if(!movieData.hasOwnProperty(k))
      continue;

    if(key === 'Poster')
      continue;

    var row = table.insertRow();
    var title = row.insertCell();
    var value = row.insertCell();

    title.textContent = key;

    if(key === 'Ratings')
      value.appendChild(renderRatingsList(movieData[k]));
    else 
      value.textContent = movieData[key];
  }

  return table;
}

/** Creates a container to display the Poster image and full details of a movie */
function renderMovieDetails(movieData) {
  var box = document.createElement("div");
  box.setAttribute("class", "box");

  var columns = document.createElement("div");
  columns.setAttribute("class", "columns");

  var figure = document.createElement("div");
  figure.setAttribute("class", "column");

  var imgWrapper = document.createElement("p");
  imgWrapper.setAttribute("class", "image is-3by4");

  var movieImg = document.createElement("img");
  movieImg.setAttribute("src", movieData.Poster);
  movieImg.setAttribute("alt", movieData.Title);

  var mediaContent = document.createElement("div");
  mediaContent.setAttribute("class", "column");

  var contentWrapper = document.createElement("div");
  contentWrapper.setAttribute("class", "content");

  var movieCardTitle = document.createElement("p");
  movieCardTitle.setAttribute("class", "title is-5");
  movieCardTitle.textContent = movieData.Title;

  var movieCardSubtitle = document.createElement("p");
  movieCardSubtitle.setAttribute("class", "subtitle is-6");
  movieCardSubtitle.textContent = movieData.Year;

  imgWrapper.appendChild(movieImg);
  figure.appendChild(imgWrapper);
  columns.appendChild(figure);

  contentWrapper.appendChild(movieCardTitle);
  contentWrapper.appendChild(movieCardSubtitle);
  contentWrapper.appendChild(renderMovieDetailsTable(movieData));
  mediaContent.appendChild(contentWrapper);
  columns.appendChild(mediaContent);

  box.appendChild(columns);

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

  button.onclick = function () {
    showMovieDetailsModal(imdbID);

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
 */
function renderMovieMediaObject(movieData) {
  var article = document.createElement("article");
  article.setAttribute("class", "media");

  var figure = document.createElement("figure");
  figure.setAttribute("class", "media-left");

  var imgWrapper = document.createElement("p");
  imgWrapper.setAttribute("class", "image is-64x64 is-3by4");

  var movieImg = document.createElement("img");
  movieImg.setAttribute("src", movieData.Poster);
  movieImg.setAttribute("alt", movieData.Title);

  var mediaContent = document.createElement("div");
  mediaContent.setAttribute("class", "media-content");

  var contentWrapper = document.createElement("div");
  contentWrapper.setAttribute("class", "content");

  var movieCardTitle = document.createElement("p");
  movieCardTitle.setAttribute("class", "title is-5");
  movieCardTitle.textContent = movieData.Title;

  var movieCardSubtitle = document.createElement("p");
  movieCardSubtitle.setAttribute("class", "subtitle is-6");
  movieCardSubtitle.textContent = movieData.Year;

  var mediaRight = document.createElement("div");
  mediaRight.setAttribute("class", "media-right");

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
