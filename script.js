const API_URL = "https://www.omdbapi.com/";
const API_KEY = "thewdb";

const form = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-input");
const sortSelect = document.querySelector(".sort-select");
const movieGrid = document.querySelector(".movie-grid");
const resultsTitle = document.querySelector(".results-title");
const resultsCount = document.querySelector(".results-count");

let movies = [];
let lastSearch = "";

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const searchTerm = searchInput.value.trim();

  if (!searchTerm) {
    return;
  }

  await searchMovies(searchTerm);
});

sortSelect.addEventListener("change", () => {
  renderMovies(sortMovies(movies));
});

async function searchMovies(searchTerm) {
  setLoading(true);
  lastSearch = searchTerm;
  resultsTitle.textContent = `Results for "${searchTerm}"`;
  resultsCount.textContent = "";
  renderMessage("Searching OMDb...", "empty-state");

  try {
    const url = `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(
      searchTerm
    )}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "False") {
      movies = [];
      resultsCount.textContent = "";
      renderMessage(data.Error || "No movies found.", "error-state");
      return;
    }

    movies = data.Search || [];
    renderMovies(sortMovies(movies));
  } catch (error) {
    movies = [];
    resultsCount.textContent = "";
    renderMessage("Something went wrong while searching OMDb.", "error-state");
  } finally {
    setLoading(false);
  }
}

function sortMovies(movieList) {
  const sortedMovies = [...movieList];

  sortedMovies.sort((firstMovie, secondMovie) => {
    const firstTitle = firstMovie.Title.toLowerCase();
    const secondTitle = secondMovie.Title.toLowerCase();
    const firstYear = getSortableYear(firstMovie.Year);
    const secondYear = getSortableYear(secondMovie.Year);

    switch (sortSelect.value) {
      case "title-desc":
        return secondTitle.localeCompare(firstTitle);
      case "year-desc":
        return secondYear - firstYear;
      case "year-asc":
        return firstYear - secondYear;
      case "type-asc":
        return firstMovie.Type.localeCompare(secondMovie.Type);
      case "title-asc":
      default:
        return firstTitle.localeCompare(secondTitle);
    }
  });

  return sortedMovies;
}

function renderMovies(movieList) {
  if (!movieList.length) {
    resultsCount.textContent = "";
    renderMessage("No movies to show yet.", "empty-state");
    return;
  }

  resultsTitle.textContent = `Results for "${lastSearch}"`;
  resultsCount.textContent = `${movieList.length} result${
    movieList.length === 1 ? "" : "s"
  }`;

  movieGrid.innerHTML = movieList.map((movie) => movieHTML(movie)).join("");
}

function movieHTML(movie) {
  const poster =
    movie.Poster && movie.Poster !== "N/A"
      ? `<img src="${movie.Poster}" alt="${escapeHTML(movie.Title)} poster" />`
      : `<span>No poster available</span>`;

  return `
    <article class="movie-card">
      <div class="movie-card__poster">
        ${poster}
      </div>

      <div class="movie-card__content">
        <h3 class="movie-card__title">${escapeHTML(movie.Title)}</h3>
        <div class="movie-card__meta">
          <span>${escapeHTML(movie.Year)}</span>
          <span>${escapeHTML(movie.Type)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderMessage(message, className) {
  movieGrid.innerHTML = `<p class="${className}">${message}</p>`;
}

function setLoading(isLoading) {
  const button = form.querySelector("button");

  button.disabled = isLoading;
  button.textContent = isLoading ? "Searching..." : "Search";
}

function getSortableYear(year) {
  const match = year.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}