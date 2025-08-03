import { useNavigate } from "react-router-dom";
import MovieCard from "../components/ui/MovieCard";
import { Typography, CircularProgress, Select, MenuItem, InputLabel, FormControl, FormHelperText } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { getMoviesData } from "../api/getMoviesData";
import { FiSearch } from "react-icons/fi";
import movieBg from "../assets/images/movie_bg.jpg"
import { PiPopcornDuotone, PiSmileySad } from "react-icons/pi";

const Movie = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [year, setYear] = useState("");
    const [type, setType] = useState("movie")
    const [movieData, setMovieData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searched, setSearched] = useState(false);
    const [yearError, setYearError] = useState("");
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const observer = useRef();
    const lastMovieElementRef = useRef(null);

    useEffect(() => {
        const fetchMoreMovies = async () => {
            if (loadingMore || !searched) return;

            const totalPages = Math.ceil(totalResults / 10);
            if (page >= totalPages) return;

            setLoadingMore(true);
            const nextPage = page + 1;
            const data = await getMoviesData(search, year, type, nextPage);

            if (data.Response === "True") {
                setMovieData(prev => [...prev, ...data.Search]);
                setPage(nextPage);
            }
            setLoadingMore(false);
        };

        const currentObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                fetchMoreMovies();
            }
        }, { threshold: 1.0 });

        if (lastMovieElementRef.current) {
            currentObserver.observe(lastMovieElementRef.current);
        }
        observer.current = currentObserver;

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [loadingMore, searched, page, totalResults, search, year, type]);


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const trimmedSearch = search.trim();
        if (!trimmedSearch) return;

        if (year && (year.length !== 4 || year < 1880 || year > new Date().getFullYear())) {
            setYearError(`Year must be 4 digits between 1880 and ${new Date().getFullYear()}`);
            return;
        } else {
            setYearError("");
        }

        setLoading(true);
        setSearched(true);
        setPage(1);
        const data = await getMoviesData(trimmedSearch, year, type, 1);

        if (data.Response === "True") {
            setMovieData(data.Search);
            setTotalResults(parseInt(data.totalResults, 10));
        } else {
            setMovieData([]);
            setTotalResults(0);
        }
        setLoading(false);

        sessionStorage.setItem("movieSearch", trimmedSearch);
        sessionStorage.setItem("movieYear", year);
        sessionStorage.setItem("movieType", type);
        sessionStorage.setItem("movieResults", JSON.stringify(data.Search || []));
        sessionStorage.setItem("totalResults", data.totalResults || 0);

    };

    useEffect(() => {
        const savedSearch = sessionStorage.getItem("movieSearch");
        const savedYear = sessionStorage.getItem("movieYear");
        const savedType = sessionStorage.getItem("movieType");
        const savedResults = sessionStorage.getItem("movieResults");
        const savedTotalResults = sessionStorage.getItem("totalResults");
        if (
            savedSearch &&
            savedResults &&
            savedResults !== "undefined" &&
            savedResults !== ""
        ) {
            try {
                setSearch(savedSearch);
                setYear(savedYear || "");
                setType(savedType || "movie");
                setMovieData(JSON.parse(savedResults));
                setTotalResults(parseInt(savedTotalResults, 10));
                setSearched(true);
                setPage(Math.ceil(JSON.parse(savedResults).length / 10));
            } catch (e) {
                console.error(e)
                sessionStorage.clear();
            }
        }
    }, []);

    return (
        <>
            <div
                className="relative h-120 bg-cover bg-center rounded-b-4xl bg-[#212121] max-sm:h-110 max-sm:rounded-b-2xl shadow-2xl"
                style={{ backgroundImage: `url(${movieBg})` }}
            >
                <div className="absolute inset-0 bg-black opacity-50 z-0 rounded-b-4xl max-sm:rounded-b-2xl"></div >
                <form
                    className="w-full h-full flex flex-col gap-5 justify-center items-center z-10 relative max-sm:px-10 max-sm:gap-2"
                    onSubmit={(e) => handleFormSubmit(e)}
                >

                    <h1 className="text-white text-4xl font-bold max-sm:text-2xl max-sm:py-5 max-sm:text-center">
                        Find your next favorite film...
                    </h1>


                    <div className="w-full flex justify-center gap-2">
                        <div className="relative w-[55%] max-sm:w-full ">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <FiSearch />
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Type here..."
                                className="pl-10 text-white bg-gray-800 rounded-xl p-3 w-full focus:outline-none focus:ring-1 focus:ring-inset focus:ring-red-400 focus:shadow-[0_0_8px_2px_rgba(239,68,68,0.5)] transition-all duration-300 ease-in-out"
                            />
                        </div>
                        <button type="submit" className="px-6 bg-[rgba(255,54,54,0.5)] border-[rgba(255,255,255,0.047)] border-l-2 border-t-2 border-r-1 border-b-1 backdrop-blur-md text-white cursor-pointer rounded-lg font-semibold hover:bg-gray-500/15 transition max-sm:hidden">Search</button>
                    </div>

                    <div className="flex gap-4 max-sm:w-full max-sm:justify-center max-sm:gap-2">
                        <FormControl error={!!yearError} className="w-36 max-sm:w-1/2" variant="standard">
                            <input
                                type="number"
                                min="1880"
                                max={new Date().getFullYear()}
                                value={year}
                                onChange={e => {
                                    const val = e.target.value.slice(0, 4);
                                    setYear(val);
                                    if (val && (val.length !== 4 || val < 1880 || val > new Date().getFullYear())) {
                                        setYearError(`Year must be 4 digits between 1880 and ${new Date().getFullYear()}`);
                                    } else {
                                        setYearError("");
                                    }
                                }}
                                placeholder="Released Year"
                                maxLength={4}
                                className="w-full h-12 p-3 text-white bg-gray-800 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-red-400 transition-all duration-300 ease-in-out
                                    [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                    [appearance:textfield]"
                            />

                        </FormControl>


                        <Select
                            value={type}
                            className="max-sm:w-1/2"
                            onChange={(e) => setType(e.target.value)}
                            displayEmpty
                            sx={{
                                minWidth: "150px",
                                height: "48px",
                                color: "white",
                                backgroundColor: "#1f2937",
                                borderRadius: "0.75rem",
                                fontSize: "1rem",
                                '& .MuiOutlinedInput-notchedOutline': {
                                    border: "none",
                                },
                                transition: "all 0.3s ease-in-out",
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    border: "1px solid oklch(70.4% 0.191 22.216)",
                                },
                                '& .MuiSelect-icon': {
                                    color: 'white',
                                },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backgroundColor: "#1f2937",
                                        color: "white",
                                    }
                                }
                            }}
                        >
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="movie">Movie</MenuItem>
                            <MenuItem value="series">Series</MenuItem>
                            <MenuItem value="episode">Episode</MenuItem>
                        </Select>
                    </div>

                    <FormHelperText
                        className={`
                                    transition-all duration-300 ease-in-out
                                    overflow-hidden
                                    ${yearError ? "opacity-100 max-h-10 mt-1 text-white! bg-red-500 p-1 rounded-md" : "opacity-0 max-h-0 mt-0"}
                                `}
                    >
                        {yearError}
                    </FormHelperText>

                    <button type="submit" className="hidden py-2 w-full bg-[rgba(255,54,54,0.5)] border-[rgba(255,255,255,0.047)] border-l-2 border-t-2 border-r-1 border-b-1 backdrop-blur-md text-white cursor-pointer rounded-lg font-semibold hover:bg-gray-500/15 transition mt-2 max-sm:block ">Search</button>
                </form>
            </div>

            <div className=" text-white">

                {loading ? (
                    <div className="flex bg w-full min-h-[60vh] justify-center items-center">
                        <CircularProgress size="4rem" color="white" />
                    </div >
                ) : searched ? (
                    movieData.length > 0 ? (
                        <>
                            <div className="grid grid-cols-4 p-10 gap-8 max-sm:grid-cols-2 max-sm:place-items-center max-sm:p-6 max-sm:gap-3">
                                {movieData.map((curMovie, index) => {
                                    if (movieData.length === index + 1) {
                                        return (
                                            <div ref={lastMovieElementRef} key={curMovie.imdbID}>
                                                <MovieCard
                                                    curMovie={curMovie}
                                                    navigateToMovie={() => navigate(`/movies/${curMovie.imdbID}`)}
                                                />
                                            </div>
                                        );
                                    }
                                    return (
                                        <MovieCard
                                            key={curMovie.imdbID}
                                            curMovie={curMovie}
                                            navigateToMovie={() => navigate(`/movies/${curMovie.imdbID}`)}
                                        />
                                    );
                                })}
                            </div>
                            {loadingMore && page < Math.ceil(totalResults / 10) && (
                                <div className="flex w-full justify-center items-center my-4">
                                    <CircularProgress size="2rem" color="inherit" />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex w-full min-h-[40vh] justify-center items-center gap-2 max-sm:flex-col max-sm:gap-4 max-sm:text-md">
                            <PiSmileySad size={48} />
                            <p>
                                No movies found for your search
                            </p>
                        </div>
                    )
                ) : (
                    <div className="flex w-full min-h-[50vh] justify-center items-center gap-2 max-sm:flex-col max-sm:gap-4 max-sm:text-md">
                        <PiPopcornDuotone size={48} />
                        <p >
                            Start by searching for a movie above
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Movie;
