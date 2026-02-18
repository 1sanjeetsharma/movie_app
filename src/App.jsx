

import { use, useEffect, useState } from 'react'
import './App.css'
import Serach from './components/Serach'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTrendingMessage, setErrorTrendingMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovieList, setTrendingMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  const API_BASE_URL = 'https://api.themoviedb.org/3';
  const API_OPTIONS = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`
    }
  };
  const fetchTrendingMovies = async () => {
    setErrorTrendingMessage("");
    setIsTrendingLoading(true);
    try {
      const endpoint = `${API_BASE_URL}/trending/all/day?language=en-US`
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('failed to fetch trending movies');
      }
      const data = await response.json();
      if (data.response === "False") {
        setErrorTrendingMessage(data.Error || 'Failed to fetch Trending movies');
        setTrendingMovieList([]);
        return;
      }
      setTrendingMovieList(data.results.slice(0, 6));
      console.log("Trending Movies:", data)
    } catch (error) {
      console.log('error Fetching trending movies')
    } finally {
      setIsTrendingLoading(false);
    }
  }
  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query ?
        `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by.desc`
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error("failed to fetch movies");
      }
      const data = await response.json();
      if (data.response === "False") {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);
    } catch (error) {
      console.log(`Error Message ${error}`);
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);
  useEffect(() => {
    fetchTrendingMovies();
  }, [])
  return (
    <>
      <div className='pattern' />
      <div className='wrapper' >
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1> Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle </h1>
        </header>
        <Serach searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <section className='trending'>
          {searchTerm === '' ? (
            <>
              <h2 className='mt-[40px]'>Trending Movies</h2>
              {isTrendingLoading ? (<Spinner />) :
                errorTrendingMessage ? (<p className='text-red-500'>{errorTrendingMessage}</p>) : (
                  (
                    <ul>
                      {
                        trendingMovieList.map((movie, index) => (
                          <li key={movie.id}>
                            <p>{index + 1}</p>
                            <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : '/no-movie.png'} alt={movie.title} />
                          </li>
                        ))}
                    </ul>
                  )
                )}
            </>
          ) : ''}
        </section>
        <section className='all-movies'>
          <h2 className='mt-[40px]'>All Movies</h2>
          {isLoading ? (<Spinner />) :
            errorMessage ? (<p className='text-red-500'>{errorMessage}</p>) : (
              (
                <ul>
                  {
                    movieList.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                </ul>
              )
            )}
        </section>
      </div>

    </>
  )
}

export default App
