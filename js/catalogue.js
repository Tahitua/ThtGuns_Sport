// CineStream - Catalogue JavaScript
let currentPage = 1;
const itemsPerPage = 12;
let filteredMovies = [];
let currentFilters = {
    genre: '',
    year: '',
    search: '',
    sort: 'title'
};

document.addEventListener('DOMContentLoaded', function() {
    // Wait for main.js to load films data
    const checkForData = setInterval(() => {
        if (window.CineStream && window.CineStream.filmsData && window.CineStream.filmsData.films) {
            clearInterval(checkForData);
            initCatalogPage();
        }
    }, 100);

    // Initialize search functionality from main.js
    initSearchFunctionality();
});

function initCatalogPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const searchQuery = urlParams.get('search');

    // Update page title based on type
    const pageTitle = document.getElementById('page-title');
    if (type === 'series') {
        pageTitle.textContent = 'Catalogue des Séries';
        // For now, show same content as films since we don't have series data
    } else {
        pageTitle.textContent = 'Catalogue des Films';
    }

    // Set initial search if provided
    if (searchQuery) {
        currentFilters.search = searchQuery;
        document.getElementById('search-filter').value = searchQuery;
    }

    // Initialize filters
    initializeFilters();
    
    // Load movies
    applyFilters();
    
    // Setup event listeners
    setupEventListeners();
}

function initializeFilters() {
    const films = window.CineStream.filmsData.films;
    
    // Populate genre filter
    const genreFilter = document.getElementById('genre-filter');
    const genres = [...new Set(films.flatMap(film => film.genre))].sort();
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
    
    // Populate year filter
    const yearFilter = document.getElementById('year-filter');
    const years = [...new Set(films.map(film => film.annee))].sort((a, b) => b - a);
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

function setupEventListeners() {
    // Filter change listeners
    document.getElementById('genre-filter').addEventListener('change', handleFilterChange);
    document.getElementById('year-filter').addEventListener('change', handleFilterChange);
    document.getElementById('sort-filter').addEventListener('change', handleFilterChange);
    
    // Search input with debounce
    document.getElementById('search-filter').addEventListener('input', 
        debounce(handleSearchChange, 300));
    
    // View toggle
    document.getElementById('grid-view').addEventListener('click', () => setView('grid'));
    document.getElementById('list-view').addEventListener('click', () => setView('list'));
    
    // Close fullscreen player
    const closePlayer = document.getElementById('close-player');
    if (closePlayer) {
        closePlayer.addEventListener('click', closeFullscreenPlayer);
    }
}

function handleFilterChange(event) {
    const filterType = event.target.id.replace('-filter', '');
    currentFilters[filterType] = event.target.value;
    currentPage = 1; // Reset to first page
    applyFilters();
}

function handleSearchChange(event) {
    currentFilters.search = event.target.value.toLowerCase();
    currentPage = 1; // Reset to first page
    applyFilters();
}

function applyFilters() {
    const films = window.CineStream.filmsData.films;
    
    // Apply filters
    filteredMovies = films.filter(film => {
        // Genre filter
        if (currentFilters.genre && !film.genre.includes(currentFilters.genre)) {
            return false;
        }
        
        // Year filter
        if (currentFilters.year && film.annee.toString() !== currentFilters.year) {
            return false;
        }
        
        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            return film.titre.toLowerCase().includes(searchTerm) ||
                   film.description.toLowerCase().includes(searchTerm) ||
                   film.genre.some(g => g.toLowerCase().includes(searchTerm)) ||
                   film.acteurs.some(a => a.toLowerCase().includes(searchTerm)) ||
                   film.realisateur.toLowerCase().includes(searchTerm) ||
                   film.motscles.some(m => m.toLowerCase().includes(searchTerm));
        }
        
        return true;
    });
    
    // Apply sorting
    sortMovies();
    
    // Update results count
    updateResultsCount();
    
    // Display movies
    displayMovies();
    
    // Update pagination
    updatePagination();
}

function sortMovies() {
    switch (currentFilters.sort) {
        case 'title':
            filteredMovies.sort((a, b) => a.titre.localeCompare(b.titre));
            break;
        case 'year':
            filteredMovies.sort((a, b) => b.annee - a.annee);
            break;
        case 'rating':
            filteredMovies.sort((a, b) => b.note - a.note);
            break;
        case 'popularity':
            // For now, sort by rating as a proxy for popularity
            filteredMovies.sort((a, b) => b.note - a.note);
            break;
    }
}

function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    const totalResults = filteredMovies.length;
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalResults);
    
    if (totalResults === 0) {
        resultsCount.textContent = 'Aucun film trouvé';
    } else {
        resultsCount.textContent = `${startIndex}-${endIndex} sur ${totalResults} films`;
    }
}

function displayMovies() {
    const catalogGrid = document.getElementById('catalog-grid');
    catalogGrid.innerHTML = '';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const moviesToShow = filteredMovies.slice(startIndex, endIndex);
    
    moviesToShow.forEach(movie => {
        const movieCard = createMovieCard(movie);
        catalogGrid.appendChild(movieCard);
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
            <div class="play-overlay" onclick="event.stopPropagation(); playMovie(${JSON.stringify(movie).replace(/"/g, '&quot;')})"></div>
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

function updatePagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
    
    if (totalPages <= 1) return;
    
    // Previous button
    if (currentPage > 1) {
        const prevBtn = createPaginationButton('‹ Précédent', currentPage - 1);
        pagination.appendChild(prevBtn);
    }
    
    // Page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        pagination.appendChild(createPaginationButton('1', 1));
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.color = '#bdbdf7';
            ellipsis.style.padding = '10px 5px';
            pagination.appendChild(ellipsis);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const btn = createPaginationButton(i.toString(), i);
        if (i === currentPage) btn.classList.add('active');
        pagination.appendChild(btn);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.color = '#bdbdf7';
            ellipsis.style.padding = '10px 5px';
            pagination.appendChild(ellipsis);
        }
        pagination.appendChild(createPaginationButton(totalPages.toString(), totalPages));
    }
    
    // Next button
    if (currentPage < totalPages) {
        const nextBtn = createPaginationButton('Suivant ›', currentPage + 1);
        pagination.appendChild(nextBtn);
    }
}

function createPaginationButton(text, page) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = () => {
        currentPage = page;
        displayMovies();
        updatePagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return button;
}

function setView(viewType) {
    const gridBtn = document.getElementById('grid-view');
    const listBtn = document.getElementById('list-view');
    const catalogGrid = document.getElementById('catalog-grid');
    
    if (viewType === 'grid') {
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
        catalogGrid.className = 'catalog-grid';
    } else {
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
        catalogGrid.className = 'catalog-list';
    }
}

function initSearchFunctionality() {
    // Reuse search functionality from main.js
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
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value;
                document.getElementById('search-filter').value = query;
                currentFilters.search = query.toLowerCase();
                currentPage = 1;
                applyFilters();
                searchContainer.style.display = 'none';
            }
        });
    }
}

function playMovie(movie) {
    if (window.CineStream && window.CineStream.playMovie) {
        window.CineStream.playMovie(movie);
    }
}

function closeFullscreenPlayer() {
    const fullscreenPlayer = document.getElementById('fullscreen-player');
    const iframeContainer = document.getElementById('fullscreen-iframe-container');
    
    if (!fullscreenPlayer || !iframeContainer) return;
    
    fullscreenPlayer.style.display = 'none';
    iframeContainer.innerHTML = '';
    
    document.querySelector('header').style.display = '';
    document.querySelector('main').style.display = '';
    document.querySelector('footer').style.display = '';
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