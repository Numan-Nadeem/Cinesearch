import { MdTheaters } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="text-white bg-black/60 py-8 border-t-2 border-[rgba(255,255,255,0.048)] ">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-around">
                    <div className="mb-4 md:mb-0">
                        <div className="flex gap-1 cursor-pointer" onClick={() => navigate("/")}>
                            < MdTheaters size={24} />  <h3 className="text-xl font-bold mb-2">CineSearch</h3>
                        </div>
                        <p className="text-gray-400">Your ultimate movie rating destination</p>
                    </div>
                    <div className="grid grid-cols-1 gap-8">
                        <div>
                            <h4 className="font-semibold mb-3">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link to="/" className="hover:text-red-400">Home</Link></li>
                                <li><Link to="/movies" className="hover:text-red-400">Movies</Link></li>
                                <li><Link to="/about" className="hover:text-red-400">About</Link></li>
                                <li><Link to="/contact" className="hover:text-red-400">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="pt-6 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} CineSearch. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer