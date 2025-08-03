import { Avatar, Box, Typography, Link, Stack, Paper } from "@mui/material";
import { FaEnvelope, FaGithub, FaFacebook, FaLinkedin } from "react-icons/fa";
import contactBg from "../assets/images/contact_bg2.jpg"

const Contact = () => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={2}
            sx={{
                background: `url(${contactBg})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center center",
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    maxWidth: 500,
                    width: "100%",
                    p: 6,
                    m: 8,
                    textAlign: "center",
                    borderRadius: 5,
                    bgcolor: "transparent",
                    backdropFilter: "blur(10px)",
                    mx: "auto",
                    borderTop: "3px solid rgba(255,255,255,0.047)",
                    borderLeft: "3px solid rgba(255,255,255,0.047)",
                    borderBottom: "2px solid rgba(255,255,255,0.037)",
                    borderRight: "2px solid rgba(255,255,255,0.037)",
                    '@media (max-width: 640px)': { p: 3 }

                }}
            >
                <Avatar
                    src="https://avatars.githubusercontent.com/Numan-Nadeem"
                    alt="Numan Nadeem"
                    sx={{
                        width: 96,
                        height: 96,
                        mx: "auto",
                        mb: 2,
                        border: "2px solid #e0e0e0",
                        display: "block",
                    }}
                />
                <Typography variant="h5" fontWeight={700} color="white" mb={3} fontFamily="inherit">
                    Numan Nadeem
                </Typography>
                <Stack spacing={1.5} alignItems="center">
                    <Link
                        href="mailto:noman.mughal256@gmail.com"
                        color="white"
                        underline="none"
                        fontWeight={600}
                        display="flex"
                        alignItems="center"
                        width="100%"
                        p="1rem"
                        gap={1.5}
                        sx={{ borderRadius: 5, backgroundColor: "rgba(66, 66, 66, 0.50)" }}
                    >
                        <FaEnvelope style={{ fontSize: 22 }} />
                        Email
                    </Link>
                    <Link
                        href="https://github.com/Numan-Nadeem"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="white"
                        underline="none"
                        fontWeight={600}
                        display="flex"
                        alignItems="center"
                        width="100%"
                        p="1rem"
                        gap={1.5}
                        sx={{ borderRadius: 5, backgroundColor: "rgba(66, 66, 66, 0.50)" }}
                    >
                        <FaGithub style={{ fontSize: 22 }} />
                        GitHub
                    </Link>
                    <Link
                        href="https://www.linkedin.com/in/numannadeem/"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="white"
                        underline="none"
                        fontWeight={600}
                        display="flex"
                        alignItems="center"
                        width="100%"
                        p="1rem"
                        gap={1.5}
                        sx={{ borderRadius: 5, backgroundColor: "rgba(66, 66, 66, 0.50)" }}
                    >
                        <FaLinkedin style={{ fontSize: 22 }} />
                        LinkedIn
                    </Link>
                    <Link
                        href="https://www.facebook.com/share/1E6hq7DJD6/"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="white"
                        underline="none"
                        fontWeight={600}
                        display="flex"
                        alignItems="center"
                        width="100%"
                        p="1rem"
                        gap={1.5}
                        sx={{ borderRadius: 5, backgroundColor: "rgba(66, 66, 66, 0.50)" }}
                    >
                        <FaFacebook style={{ fontSize: 22 }} />
                        Facebook
                    </Link>
                </Stack>
            </Paper>
        </Box>
    );
};

export default Contact