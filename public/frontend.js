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

function getMovieDetails(imdbID) {
  return fetch("/details?imdbID="+imdbID)
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

function createRatingsList(ratings) {
  var list = document.createElement("span");

  ratings.forEach(rating => {
    var ol = document.createElement("p");
    ol.textContent = rating.Source + " - " + rating.Value;

    list.appendChild(ol);
  });

  return list;
}

function createMovieDetailsTable(obj) {
  var table = document.createElement("table");
  table.setAttribute("class", "table");

  for(k in obj)
  {
    if(obj.hasOwnProperty(k))
    {
      if(k === 'Poster')
        continue;

      var row = table.insertRow();
      var title = row.insertCell();
      var value = row.insertCell();

      title.textContent = k;

      if(k === 'Ratings') {
        value.appendChild(createRatingsList(obj[k]));
      }
      else {
        value.textContent = obj[k];
      }
    }
  }

  return table;
}

function createMovieDetails(movieData) {
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
  contentWrapper.appendChild(createMovieDetailsTable(movieData));
  mediaContent.appendChild(contentWrapper);
  columns.appendChild(mediaContent);

  box.appendChild(columns);

  return box;
}

function showMovieDetailsModal(imdbID) {
  getMovieDetails(imdbID)
    .then(movieData => {
      var detailsContent = document.getElementById("movieDetails");

      detailsContent.innerHTML = '';

      detailsContent.appendChild(createMovieDetails(movieData));

      document.getElementById("detailsModal")
        .setAttribute("class", "modal is-active");
    });
}

function hideDetailsModal() {
  document.getElementById("detailsModal")
    .setAttribute("class", "modal");
}

function createDetailsLink(imdbID) {
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

function createDetailsLevel(movieData) { 
  var level = document.createElement("nav");
  level.setAttribute("class", "level");

  var levelLeft = document.createElement("div");
  levelLeft.setAttribute("class", "level-left");

  levelLeft.append(createDetailsLink(movieData.imdbID));
  level.append(levelLeft);

  return level;
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
  contentWrapper.appendChild(createDetailsLevel(movieData));
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

function createNoMoviesHero() {
  //var hero = document.createElement("div");
  //hero.setAttribute("class", "hero");

  //var heroBody = document.createElement("div");
  //heroBody.setAttribute("class", "hero-body");

  //var contentContainer = document.createElement("div");
  //contentContainer.setAttribute("class", "container");

  var title = document.createElement("h1");
  title.setAttribute("class", "title is-1");

  title.textContent = "There are no movies to display";

  //var subTitle = document.createElement("div");
  //contentContainer.setAttribute("class", "container");

  return title;
}

function createMovieTitles(movies) {
  var movieCardsContainer = document.getElementById("movieCards");

  movieCardsContainer.innerHTML = '';

  if(movies.length == 0)
  {
    movieCardsContainer.appendChild(createNoMoviesHero());
    movieCardsContainer.setAttribute("class", "has-text-centered");
  }

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
  var searchText = document.getElementById("movieSearchText").value.trim();

  if(!searchText || searchText === '')
  {
    return;
  }

  searchMovieByTitle()
    .then((movies) => {
      createMovieTitles(movies);
    });
}

function showFavorites() {
  getMovieFavorites()
    .then(favorites => {
      createMovieTitles(favorites);
    });
}
