// CineStream - Main JavaScript
let filmsData = null;
let myList = JSON.parse(localStorage.getItem('myList')) || [];

// Load films data on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('data/films.json');
        filmsData = await response.json();
        
        // Initialize the homepage
        initHomepage();
        initEventListeners();
        
    } catch (error) {
        console.error('Erreur lors du chargement des films:', error);
        displayError();
    }
});

function initHomepage() {
    if (!filmsData) return;
    
    // Load featured movie in hero section
    loadFeaturedMovie();
    
    // Load movie carousels
    loadMovieCarousel('popular-movies', getPopularMovies());
    loadMovieCarousel('new-movies', getNewMovies());
    loadMovieCarousel('action-movies', getMoviesByGenre('Action'));
    loadMovieCarousel('scifi-movies', getMoviesByGenre('Science-Fiction'));
    loadMovieCarousel('crime-movies', getMoviesByGenre('Crime'));
}

function initEventListeners() {
    // Search functionality
    const searchBtn = document.getElementById('search-btn');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const searchClose = document.getElementById('search-close');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            searchContainer.style.display = searchContainer.style.display === 'none' ? 'block' : 'none';
            if (searchContainer.style.display === 'block') {
                searchInput.focus();
            }
        });
    }
    
    if (searchClose) {
        searchClose.addEventListener('click', () => {
            searchContainer.style.display = 'none';
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.location.href = `catalogue.html?search=${encodeURIComponent(e.target.value)}`;
            }
        });
    }
    
    // Hero section buttons
    const heroWatch = document.getElementById('hero-watch');
    const heroInfo = document.getElementById('hero-info');
    const heroList = document.getElementById('hero-list');
    
    if (heroWatch) {
        heroWatch.addEventListener('click', () => {
            const featuredMovie = getFeaturedMovie();
            if (featuredMovie) {
                playMovie(featuredMovie);
            }
        });
    }
    
    if (heroInfo) {
        heroInfo.addEventListener('click', () => {
            const featuredMovie = getFeaturedMovie();
            if (featuredMovie) {
                window.location.href = `film-detail.html?id=${featuredMovie.id}`;
            }
        });
    }
    
    if (heroList) {
        heroList.addEventListener('click', () => {
            const featuredMovie = getFeaturedMovie();
            if (featuredMovie) {
                toggleMyList(featuredMovie.id);
                updateHeroListButton();
            }
        });
    }
    
    // Close fullscreen player
    const closePlayer = document.getElementById('close-player');
    if (closePlayer) {
        closePlayer.addEventListener('click', closeFullscreenPlayer);
    }
}

function loadFeaturedMovie() {
    const featuredMovie = getFeaturedMovie();
    if (!featuredMovie) return;
    
    const heroTitle = document.getElementById('hero-title');
    const heroDescription = document.getElementById('hero-description');
    
    if (heroTitle) heroTitle.textContent = featuredMovie.titre;
    if (heroDescription) heroDescription.textContent = featuredMovie.description;
    
    // Set background image if available
    const heroSection = document.getElementById('hero-section');
    if (heroSection && featuredMovie.background) {
        heroSection.style.backgroundImage = `linear-gradient(135deg, rgba(44, 44, 88, 0.8), rgba(108, 46, 183, 0.8)), url('${featuredMovie.background}')`;
    }
    
    updateHeroListButton();
}

function updateHeroListButton() {
    const heroList = document.getElementById('hero-list');
    const featuredMovie = getFeaturedMovie();
    
    if (!heroList || !featuredMovie) return;
    
    const isInList = myList.includes(featuredMovie.id);
    heroList.innerHTML = isInList ? 
        '<i class="icon-check"></i> Dans ma liste' : 
        '<i class="icon-plus"></i> Ma Liste';
}

function loadMovieCarousel(containerId, movies) {
    const container = document.getElementById(containerId);
    if (!container || !movies) return;
    
    container.innerHTML = '';
    
    movies.slice(0, 10).forEach(movie => {
        const movieCard = createMovieCard(movie);
        container.appendChild(movieCard);
    });
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => window.location.href = `film-detail.html?id=${movie.id}`;
    
    card.innerHTML = `
        <div class="movie-poster">
            ${movie.affiche ? 
                `<img src="${movie.affiche}" alt="${movie.titre}" onerror="this.style.display='none'">` : 
                `<span>Image non disponible</span>`
            }
            <div class="play-overlay"></div>
        </div>
        <div class="movie-info">
            <div class="movie-title">${movie.titre}</div>
            <div class="movie-year">${movie.annee}</div>
            <div class="movie-genre">${movie.genre.slice(0, 2).join(', ')}</div>
            <div class="movie-rating">
                ⭐ ${movie.note}/10
            </div>
        </div>
    `;
    
    return card;
}

function getFeaturedMovie() {
    if (!filmsData) return null;
    return filmsData.films.find(film => film.featured) || filmsData.films[0];
}

function getPopularMovies() {
    if (!filmsData) return [];
    return filmsData.films.sort((a, b) => b.note - a.note);
}

function getNewMovies() {
    if (!filmsData) return [];
    return filmsData.films.sort((a, b) => b.annee - a.annee);
}

function getMoviesByGenre(genre) {
    if (!filmsData) return [];
    return filmsData.films.filter(film => film.genre.includes(genre));
}

function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    if (query.length < 2) return;
    
    // Simple search implementation - could be enhanced
    console.log('Recherche:', query);
}

function playMovie(movie) {
    const fullscreenPlayer = document.getElementById('fullscreen-player');
    const iframeContainer = document.getElementById('fullscreen-iframe-container');
    
    if (!fullscreenPlayer || !iframeContainer) return;
    
    // Hide main content
    document.querySelector('header').style.display = 'none';
    document.querySelector('main').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    
    // Show fullscreen player
    fullscreenPlayer.style.display = 'flex';
    
    // Load video
    iframeContainer.innerHTML = `
        <iframe 
            src="${movie.video}" 
            allowfullscreen 
            allow="autoplay" 
            scrolling="no" 
            frameborder="0" 
            style="width:100%;height:100%;border-radius:12px;background:#000;"
            sandbox="allow-scripts allow-same-origin">
        </iframe>
    `;
}

function closeFullscreenPlayer() {
    const fullscreenPlayer = document.getElementById('fullscreen-player');
    const iframeContainer = document.getElementById('fullscreen-iframe-container');
    
    if (!fullscreenPlayer || !iframeContainer) return;
    
    // Hide fullscreen player
    fullscreenPlayer.style.display = 'none';
    iframeContainer.innerHTML = '';
    
    // Show main content
    document.querySelector('header').style.display = '';
    document.querySelector('main').style.display = '';
    document.querySelector('footer').style.display = '';
}

function toggleMyList(movieId) {
    if (myList.includes(movieId)) {
        myList = myList.filter(id => id !== movieId);
    } else {
        myList.push(movieId);
    }
    
    localStorage.setItem('myList', JSON.stringify(myList));
}

function displayError() {
    const content = document.querySelector('.content');
    if (content) {
        content.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #bdbdf7;">
                <h2>Erreur de chargement</h2>
                <p>Impossible de charger le catalogue de films. Veuillez réessayer plus tard.</p>
            </div>
        `;
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for other modules
window.CineStream = {
    filmsData,
    myList,
    toggleMyList,
    playMovie,
    getMoviesByGenre
};