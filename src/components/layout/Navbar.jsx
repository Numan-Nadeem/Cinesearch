import { NavLink, useNavigate } from "react-router-dom";
import { MdTheaters } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, delay } from "framer-motion";
import { RxCross2 } from "react-icons/rx";
const navVariants = {
    open: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
        opacity: 1,
        height: "auto",
    },
    closed: {
        transition: {
            staggerChildren: 0.08,
            staggerDirection: -1,
        },
        opacity: 0,
        height: 0,
    },
};

const itemVariants = {
    open: { opacity: 1, y: 0 },
    closed: { opacity: 0, y: -20 },
};

const Navbar = () => {
    const navigate = useNavigate();
    const [navOptions, setNavOptions] = useState(false);
    const navbarRef = useRef(null);

    const handleToggleNavOptions = () => setNavOptions(!navOptions);

    useEffect(() => {
        if (!navOptions) return;

        const handleClickOutside = (event) => {
            if (
                navbarRef.current &&
                !navbarRef.current.contains(event.target)
            ) {
                setNavOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [navOptions]);

    return (
        <div
            ref={navbarRef}
            className="sticky text-white/85 top-0 z-50 flex p-5 md:px-16 font-semibold justify-between items-center bg-transparent backdrop-blur-md border-b-2 border-b-[rgba(255,255,255,0.048)]"
        >
            <div className="flex justify-center items-center gap-1 cursor-pointer" onClick={() => navigate("/")}>
                <MdTheaters size={24} /><h2>CineSearch</h2>
            </div>

            <AnimatePresence>
                {navOptions && (
                    <motion.ul
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={navVariants}
                        className="flex flex-col bg-[#28282B] w-full absolute top-[4.1rem] left-0 p-4 gap-5 md:hidden "
                    >
                        {[{
                            path: "/",
                            label: "Home"
                        },
                        {
                            path: "/movies",
                            label: "Movies"
                        },
                        {
                            path: "/about",
                            label: "About"
                        },
                        {
                            path: "/contact",
                            label: "Contact"
                        },
                        ].map(({ path, label }) => (
                            <motion.li
                                key={path}
                                variants={itemVariants}
                                className="w-full flex justify-center"
                            >
                                <NavLink
                                    to={path}
                                    className={({ isActive }) =>
                                        `text-center ${isActive ? 'border-b-2 border-white' : ''}`
                                    }
                                    onClick={() => setNavOptions(false)}
                                >
                                    {label}
                                </NavLink>
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>

            <ul className="hidden md:flex md:static md:flex-row md:gap-10">
                {[{
                    path: "/",
                    label: "Home"
                },
                {
                    path: "/movies",
                    label: "Movies"
                },
                {
                    path: "/about",
                    label: "About"
                },
                {
                    path: "/contact",
                    label: "Contact"
                },
                ].map(({ path, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-white/85 after:transform after:scale-x-0 after:origin-left after:transition-transform after:duration-400 hover:after:scale-x-100 ${isActive ? ' after:scale-x-100' : ''}`
                        }
                    >
                        {label}
                    </NavLink>
                ))}
            </ul>

            <div className="block md:hidden" onClick={handleToggleNavOptions}>
                {!navOptions ? <GiHamburgerMenu size={24} /> : <RxCross2 size={24} strokeWidth={1} />}
            </div>
        </div>
    );
};

export default Navbar;
