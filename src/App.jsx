// import React from "react";
import React,{ useEffect,useLayoutEffect,useState } from "react";
import Search from "./components/Search.jsx";
import Spinner from"./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import{useDebounce} from 'react-use'
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";
const API_BASE_URL='https://api.themoviedb.org/3'

const API_KEY=import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS={
  method:'GET',
  headers:{
    accept:'application/json',
    Authorization:`Bearer ${API_KEY}`
  }
}



const App=()=> {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [movieList, setMovieList] = useState([]);
  
  const [errorMessage, setErrorMessage] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [trendingMovies, setTrendingMovies] = useState([])

 useDebounce(()=> setDebouncedSearchTerm(searchTerm),500,[searchTerm])

//  debounce is search term to prevent making too many API requests
// by waiting for user to stop typing 500ms
  const fetchMovies= async(query='')=>{
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint=query
      ?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      
      const response= await fetch(endpoint,API_OPTIONS);
      
     if(!response.ok){
        throw new Error('Failed to fetch Movie');
      }
      const data= await response.json();
      
      if(data.Response=='False'){
        setErrorMessage(data.Error || 'Failed to fetch Movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);
      
      console.log(data.results);
      if(query && data.results.length>0){
        await updateSearchCount(query,data.results[0]);
      }
      
    } catch (error) {
      console.log(`Error fetching movies : ${error}`);
      setErrorMessage(`Error fetching movies. Please try again later`);
    }
    finally{
      setIsLoading(false);
    }
    
    
  }

  const loadTrendingMovies= async ()=>{
    try {
      const movies=await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.log(`Error fetching trending movies:${error}`);
      
      
    }
  }


  useEffect(() => {
    
  fetchMovies(debouncedSearchTerm);
    
  }, [debouncedSearchTerm]);
  
  useEffect(() => {
    loadTrendingMovies();
  
   
  }, [])
  

  return (
  <main>
    <div className="pattern"></div>

    <div className="wrapper">
      <header>
        <img src="./hero.png" alt="Hero Banner" />
        <h1>Find <span className="text-gradient">Movies </span> You'll Enjoy Without Hassel</h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
      </header>
      
      {trendingMovies.length>0 && (
        <section className="trending">
          <h2>Trending Movies</h2>
          <ul>
            {trendingMovies.map((movie,index)=>(
              <li key={movie.$id}>
                <p>{index+1}</p>
                <img src={movie.poster_url} alt="{movie.title}" />
              </li>
            ))}
          </ul>
        </section>
      ) }


      <section className="all-movies">
        <h2 >All movies</h2>

       {isLoading ?
       (<Spinner />
       ): errorMessage ?(<p className="text-red-500">{errorMessage}</p>
       ):(
        <ul>
          {movieList.map((movie)=>(
            <MovieCard key={movie.id} movie={movie}/>
          ))}
        </ul>
       )

      }
      </section>
    </div>

  </main>
  )
}

export default App
