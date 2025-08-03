import { Outlet, useNavigation } from "react-router-dom"
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar"
import Footer from "./Footer"
import { CircularProgress } from "@mui/material";

const AppLayout = () => {
    const navigation = useNavigation();
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <>
            <Navbar />
            {navigation.state === "loading" ? (
                <div className="flex w-full min-h-[60vh] justify-center items-center">
                    <CircularProgress size="4rem" sx={{ color: "white" }} />
                </div>
            ) : (
                <Outlet />
            )}
            <Footer />
        </>
    )
}

export default AppLayout