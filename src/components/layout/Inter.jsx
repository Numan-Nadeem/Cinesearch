Perfect — let’s integrate the ** OMDb API with infinite scrolling ** using the ** Intersection Observer API in React **.

---

## 🛠️ ** Goal:**

    Fetch ** movies from OMDb API ** and ** load the next page ** automatically when the user scrolls near the bottom(infinite scroll).

---

## ✅ ** Step - by - Step Plan **

### 1. OMDb API Basics:

OMDb API returns paginated results:

```http
https://www.omdbapi.com/?apikey=YOUR_API_KEY&s=batman&page=1
```

    * `s` = search query
        * `page` = results page
            * Each page returns max ** 10 results **
* `totalResults` = total number of results

---

## ⚛️ ** React Implementation – Infinite Scroll With OMDb **

### ✅ 1. Basic Setup

    ```jsx
import React, { useEffect, useState } from 'react';
import useIntersectionObserver from './useIntersectionObserver'; // from earlier
```

### ✅ 2. Component

    ```jsx
const OMDBInfiniteScroll = () => {
  const API_KEY = 'your_api_key'; // Replace with your OMDb API key
  const SEARCH_TERM = 'batman';

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ref, isVisible] = useIntersectionObserver({
    rootMargin: '200px',
    threshold: 1,
  });

  const fetchMovies = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${SEARCH_TERM}&page=${page}`
      );
const data = await res.json();

if (data.Search) {
    setMovies((prev) => [...prev, ...data.Search]);
    setTotalResults(parseInt(data.totalResults, 10));
}
    } catch (error) {
    console.error('Error fetching movies:', error);
} finally {
    setLoading(false);
}
  };

useEffect(() => {
    fetchMovies();
}, [page]);

useEffect(() => {
    const totalPages = Math.ceil(totalResults / 10);
    if (isVisible && page < totalPages) {
        setPage((prev) => prev + 1);
    }
}, [isVisible]);

return (
    <div style={{ padding: '20px' }}>
        <h2>OMDb Movies: {SEARCH_TERM}</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
            {movies.map((movie) => (
                <div key={movie.imdbID} style={{ border: '1px solid #ccc', padding: '10px' }}>
                    <strong>{movie.Title}</strong> ({movie.Year})
                    <br />
                    <img src={movie.Poster !== 'N/A' ? movie.Poster : ''} alt={movie.Title} height="150" />
                </div>
            ))}
        </div>
        {loading && <p>Loading more...</p>}
        <div ref={ref} style={{ height: '1px' }} />
    </div>
);
};

export default OMDBInfiniteScroll;
```

---

## 🧩 `useIntersectionObserver.js`

```jsx
import { useState, useRef, useEffect } from 'react';

function useIntersectionObserver(options = {}) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [options.root, options.rootMargin, options.threshold]);

    return [ref, isIntersecting];
}

export default useIntersectionObserver;
```

---

## 🔐 OMDb API Key Note

To use the OMDb API:

* Register for a free key: [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)
* Replace `your_api_key` in the code above with your actual key.

---

## ✅ Result: What You’ve Built

* A React component that:

  * Fetches movies from OMDb API based on a search term
  * Displays results as you scroll
  * Uses Intersection Observer to auto-fetch the next page

---

Would you like to add:

* Search input for dynamic terms?
* Debounce search input?
* A loading skeleton?

Let me know, and I can help extend it.
