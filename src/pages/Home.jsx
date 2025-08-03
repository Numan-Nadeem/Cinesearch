import { useNavigate } from "react-router-dom";
import bgIntro from "../assets/videos/intro_bg.mp4"

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="relative h-[80vh] flex pt-50 w-full md:h-screen md:pt-0 md:flex md:flex-col md:items-center md:justify-center px-4">
            <video src={bgIntro}
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
            </video>
            <div className="absolute inset-0 bg-black opacity-70 z-10"></div>
            <div className="max-w-xl w-full text-center z-20">
                <h1 className="text-[1.8rem] md:text-[2.5rem] font-bold text-white/85 mb-4">Welcome to CineSearch</h1>
                <p className="text-md md:text-lg text-white/85 mb-8">
                    Discover, explore, and enjoy a world of movies and TV shows.
                </p>
                <div className="py-2 px-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                        onClick={() => navigate("/movies")}
                        className="px-6 py-3 bg-[rgba(0,0,0,0.05)] border-[rgba(255,255,255,0.047)] border-l-2 border-t-2 border-r-1 border-b-1 backdrop-blur-md text-white cursor-pointer rounded-lg font-semibold hover:bg-gray-500/15 transition"
                    >
                        Browse Movies
                    </a>
                    <a
                        onClick={() => navigate("/about")}
                        className="px-6 py-3 bg-white/85 text-[#222] cursor-pointer rounded-lg font-semibold hover:bg-[#ccc] transition"
                    >
                        Learn More
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Home;