import { useNavigate, useRouteError } from "react-router-dom";
import "./not-found.scss";

const NotFound = () => {
    const error = useRouteError();
    const navigate = useNavigate()

    if (error.status === 404)
        return (
            <div className="not-found-page">
                <div className="noise"></div>
                <div className="overlay"></div>
                <div className="terminal">
                    <h1>
                        Error{" "}
                        <span className="errorcode">404</span>
                    </h1>
                    <p className="output">
                        The page you are looking for might have been removed, had its name
                        changed or is temporarily unavailable.
                    </p>
                    <p className="output">
                        Please try to{" "}
                        <button onClick={() => navigate(-1)}>go back</button> or{" "}
                        <button onClick={() => navigate("/")}>return to the homepage</button>.
                    </p>
                    <p className="output">Good luck.</p>
                </div>
            </div>
        );

    return <div>NotFound</div>;
};

export default NotFound;