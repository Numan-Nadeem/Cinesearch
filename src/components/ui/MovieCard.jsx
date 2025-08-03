import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Chip } from '@mui/material';

const MovieCard = ({ curMovie, navigateToMovie }) => {

    return (
        <>
            <Card
                sx={{
                    bgcolor: "#424242",
                    cursor: "pointer",
                    borderRadius: "0.5rem",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                        transform: "scale(1.01)",
                        boxShadow: 6,
                    },
                }}
                className='max-sm:w-full max-sm:h-[320px]'
                onClick={navigateToMovie}
            >
                <CardMedia
                    component="img"
                    alt={curMovie.Title}
                    image={curMovie.Poster}
                    sx={{
                        objectFit: "cover",
                        borderRadius: "8px",
                    }}
                    className='h-[350px] max-sm:h-[200px]'
                />
                <CardContent sx={{ color: "white" }}>
                    <Typography gutterBottom component="div" sx={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", minHeight: "3rem", '@media (max-width: 640px)': { fontSize: '1rem', height: "3rem", overflow: "hidden" } }}>
                        {curMovie.Title}
                    </Typography>

                    <div className='flex gap-2 max-sm:gap-1'>

                        <Chip
                            label={curMovie.Type.charAt(0).toUpperCase() + curMovie.Type.slice(1)}
                            sx={{ color: "white", bgcolor: "#2b2b2b" }}
                            size="small"
                        />
                        <Chip label={curMovie.Year} sx={{ color: "white", bgcolor: "#2b2b2b" }} size="small" />
                    </div>
                </CardContent>
            </Card >
        </>
    )
}

export default MovieCard