import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom"
import AppLayout from "./components/layout/AppLayout"
import Home from "./pages/Home"
import Movie from "./pages/Movie"
import About from "./pages/About"
import Contact from "./pages/Contact"
import NotFound from "./pages/NotFound"
import MovieDetails from "./pages/MovieDetails"
import { getMoviesDetails } from "./api/getMovieDetails"

const App = () => {

    const router = createBrowserRouter(

        createRoutesFromElements(
            <Route path="/" element={<AppLayout />} errorElement={<NotFound />}>
                <Route index element={<Home />} />
                <Route path="movies" element={<Movie />} />
                <Route path="movies/:movieID" element={<MovieDetails />} loader={getMoviesDetails} />
                <Route path="contact" element={<Contact />} />
                <Route path="about" element={<About />} />
            </Route>
        )
    )

    return <RouterProvider router={router} />
}

export default App