import { useLoaderData } from "react-router-dom"
import MovieCard from "../components/ui/MovieCard"
import { Chip, Stack, Typography } from "@mui/material";
import { Banknote, Flame, Star } from "lucide-react";

const MovieDetails = () => {
    const movieData = useLoaderData();
    console.log(movieData);

    const renderTag = (label) =>
        <span className="text-xs px-2 py-1 rounded bg-[#28282b70] font-semibold max-sm:text-[0.7rem] max-sm:font-normal">{movieData?.[label] || "N/A"}</span>

    const renderStats = (IconName, label, rating) => {
        return (<>
            <div className="flex items-center">
                {IconName ? <IconName /> : "N/A"}
                <div className="ml-2">
                    <span className="block text-xs text-white/50">{label}</span>
                    <span className="font-semibold">
                        {movieData?.[rating] || "N/A"}
                    </span>
                </div>
            </div>
        </>)
    }

    const renderCast = (label) => {
        const values = movieData?.[label]?.split(",").map(item => item.trim()).filter(Boolean) || [];

        return (
            <div className="border-b-1 py-3 flex items-start flex-wrap ">
                <span className="font-semibold mr-2">{label}</span>
                {values.length > 1 ? (
                    <ul className="list-none inline-flex flex-wrap ">
                        {values.map((val, idx) => (
                            <li
                                key={idx}
                                className={idx !== 0 ? "before:content-['•'] before:mx-2" : ""}
                            >
                                {val}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <span>{values[0] || "N/A"}</span>
                )}
            </div>
        );
    };

    return (
        <div className="flex m-10 gap-10 max-sm:flex-col max-sm:gap-6 max-sm:m-6">
            <div className="flex-col flex justify-center items-center">
                <figure className="flex-1">
                    <img src={movieData.Poster} alt={movieData.Title} className="w-[18rem] rounded-lg shadow-xl shadow-gray-100/5 max-sm:w-[20rem]" />
                </figure>
            </div>
            <div className="w-full">
                <div className="p-5 rounded-lg flex justify-between text-white/90 bg-[#424242] shadow-sm max-sm:flex-col max-sm:gap-6 ">
                    <div className="flex-col">

                        <h4 className="text-2xl font-bold max-sm:text-xl">
                            {movieData.Title}
                        </h4>

                        <div className="flex gap-5 mt-2 max-sm:gap-3">
                            {renderTag("Year")}
                            {renderTag("Rated")}
                            {renderTag("Runtime")}
                        </div>
                    </div>

                    <div className="flex gap-8 flex-wrap max-sm:justify-between max-sm:gap-4">
                        {renderStats(Star, "IMDb RATING", "imdbRating")}
                        {renderStats(Flame, "Metascore", "Metascore")}
                        {renderStats(Banknote, "Box office", "BoxOffice")}
                    </div>
                </div>

                <div className="flex py-5 flex-col gap-3 text-white/85 max-sm:text-sm">
                    <Stack direction="row" gap={2}>
                        {movieData.Genre?.split(",").map((genre) => (
                            <Chip key={genre.trim()} label={genre.trim()} sx={{ backgroundColor: "#424242", color: "white" }} />
                        ))}
                    </Stack>

                    <p >
                        {movieData.Plot}
                    </p>

                    <Stack direction="column" >
                        {renderCast("Director")}
                        {renderCast("Writer")}
                        {renderCast("Actors")}
                    </Stack>
                </div>
            </div>
        </div >
    )
}

export default MovieDetails
