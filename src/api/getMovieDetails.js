export const getMoviesDetails = async ({ params }) => {
  try {
    const res = await fetch(
      `/.netlify/functions/omdb-proxy?movieID=${encodeURIComponent(
        params.movieID
      )}`
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Proxy request failed');
    }
    return await res.json();
  } catch (error) {
    console.error(error);
  }
};
