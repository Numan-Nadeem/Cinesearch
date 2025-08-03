export const getMoviesData = async (
  searchTerm,
  year = '',
  type = '',
  page = 1
) => {
  try {
    const params = new URLSearchParams({
      searchTerm,
      page: String(page),
    });
    if (year) params.append('year', year);
    if (type && type !== 'All') params.append('type', type);

    const res = await fetch(
      `/.netlify/functions/omdb-proxy?${params.toString()}`
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Proxy request failed');
    }
    return await res.json();
  } catch (error) {
    console.error(error);
    return { Response: 'False', Error: error.message };
  }
};
