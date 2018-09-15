function searchMovieByTitle(title) {
  return fetch("/search?name="+title)
    .then((res) => { return res.json(); });
}

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

function getMovieFavorites() {
  return fetch("/favorites")
    .then((res) => { return res.json(); });
}

function makeFavoriteIconClass(isFavorite) {
  return isFavorite ? "fa fa-star" : "fa fa-star-o";
}

function createFavoritesButton(movieData) {
  var button = document.createElement("a");
  button.setAttribute("class", "button is-rounded");

  var iconWrapper = document.createElement("span");
  iconWrapper.setAttribute("class", "icon is-small");

  var icon = document.createElement("i");
  icon.setAttribute("class", makeFavoriteIconClass(movieData.isFavorite || false));

  iconWrapper.appendChild(icon);
  button.appendChild(iconWrapper);

  button.onclick = function () { 
    toggleMovieFavorite(movieData)
      .then(newMovieData => {
        icon.setAttribute("class", makeFavoriteIconClass(newMovieData.isFavorite));
      }); 

    return false; 
  };

  return button;
}

function createMovieMediaObject(movieData) {
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
  mediaContent.appendChild(contentWrapper);
  article.appendChild(mediaContent);

  mediaRight.appendChild(createFavoritesButton(movieData));
  article.appendChild(mediaRight);

  return article;
}

function createMovieTile(movieMediaObject) {
  var tile = document.createElement("div");
  tile.setAttribute("class", "tile is-child box");

  tile.appendChild(movieMediaObject);

  return tile;
}

function makeMovieTileRow(movieTiles) {
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

function renderMovieTiles(movies) {
  var movieCardsContainer = document.getElementById("movieCards");

  movieCardsContainer.innerHTML = '';

  while(movies.length > 0)
  {
    movieCardsContainer.appendChild(
      makeMovieTileRow(
        movies.splice(0, 3).map(movie => 
          createMovieTile(createMovieMediaObject(movie))
        )
      )
    );
  }
}

function submitMovieSearch() {
  searchMovieByTitle(document.getElementById("movieSearchText").value)
    .then((movies) => {
      renderMovieTiles(movies);
    });
}

function showFavorites() {
  getMovieFavorites()
    .then(favorites => {
      renderMovieTiles(favorites);
    });
}
