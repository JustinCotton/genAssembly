function searchMovieByTitle(title) {
  return fetch("/search?name="+title);
}

function submitMovieSearch() {
  searchMovieByTitle(document.getElementById("movieSearchText").value)
    .then((movies) => {
      console.log(movies);
    });
}
