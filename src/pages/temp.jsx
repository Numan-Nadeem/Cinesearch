// Make sure to install Tailwind CSS in your project
// npm install -D tailwindcss
// npx tailwindcss init
// And configure your tailwind.config.js and index.css

import React, { useState, useEffect } from 'react';

// IMPORTANT: The 'process' object is not available in this environment.
// Please replace "YOUR_API_KEY" below with your actual OMDb API key.
const API_KEY = "YOUR_API_KEY";

// Individual Movie Card Component
const MovieCard = ({ movie }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
        <img
            src={movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/300x450/e2e8f0/a0aec0?text=No+Image'}
            alt={`${movie.Title} Poster`}
            className="w-full h-96 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x450/e2e8f0/a0aec0?text=No+Image'; }}
        />
        <div className="p-4">
            <h3 className="font-bold text-lg truncate" title={movie.Title}>{movie.Title}</h3>
            <p className="text-gray-600">{movie.Year} <span className="text-sm font-medium bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full ml-2 capitalize">{movie.Type}</span></p>
        </div>
    </div>
);

// Main App Component
function App() {
    const [searchTerm, setSearchTerm] = useState('avengers');
    const [year, setYear] = useState('');
    const [type, setType] = useState('movie');

    const [results, setResults] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialSearch, setInitialSearch] = useState(true);

    // Function to fetch data from OMDb API
    const fetchMovies = async (currentPage) => {
        if (API_KEY === "YOUR_API_KEY") {
            setError("Please replace 'YOUR_API_KEY' with your actual OMDb API key in the code.");
            setResults([]);
            setTotalResults(0);
            setLoading(false);
            return;
        }
        if (!searchTerm) {
            setError('Please enter a search term.');
            setResults([]);
            setTotalResults(0);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Construct the API URL with all parameters, including pagination
            let apiUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&page=${currentPage}&apikey=${API_KEY}`;
            if (year) {
                apiUrl += `&y=${year}`;
            }
            if (type) {
                apiUrl += `&type=${type}`;
            }

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.Response === "True") {
                setResults(data.Search);
                setTotalResults(parseInt(data.totalResults, 10));
            } else {
                setResults([]);
                setTotalResults(0);
                // Don't show "Movie not found!" on initial load
                if (!initialSearch) {
                    setError(data.Error);
                }
            }
        } catch (err) {
            setError('An error occurred while fetching data. Please check your network or API key.');
        } finally {
            setLoading(false);
            if (initialSearch) setInitialSearch(false);
        }
    };

    // Trigger a search when the component mounts for an initial display
    useEffect(() => {
        fetchMovies(1);
    }, []); // Empty dependency array means this runs once on mount


    // Handle form submission
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Reset to first page for a new search
        fetchMovies(1);
    };

    // Handle page changes
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= Math.ceil(totalResults / 10)) {
            setPage(newPage);
            fetchMovies(newPage);
        }
    }

    const totalPages = Math.ceil(totalResults / 10);

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Advanced Movie Search 🎬</h1>
                    <p className="text-gray-600">Find any movie, series, or episode</p>
                </header>

                {/* Search Form */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                id="search-term"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="e.g., The Matrix"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <input
                                id="year"
                                type="text"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="e.g., 1999"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All</option>
                                <option value="movie">Movie</option>
                                <option value="series">Series</option>
                                <option value="episode">Episode</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className="md:col-start-4 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                <main>
                    {loading ? (
                        <div className="text-center text-gray-500">
                            <p>Loading results...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                            <p>{error}</p>
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {results.map((item) => (
                                    <MovieCard key={item.imdbID} movie={item} />
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex justify-between items-center mt-8">
                                <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Previous
                                </button>
                                <span className="text-gray-700">Page {page} of {totalPages}</span>
                                <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Next
                                </button>
                            </div>
                        </>
                    ) : !initialSearch && (
                        <div className="text-center text-gray-500 mt-8">
                            <p>No results found. Try adjusting your search.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
