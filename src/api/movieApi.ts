import { Movie, MovieResponse } from "../types/movie";

const TMDB_URL = "https://api.themoviedb.org/3/";
const TMDB_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YWMxZTk4NTFmYmQ5YWQ1Y2VmNjQ4NTg3NjRjMDQ1NiIsIm5iZiI6MTc2MTQ5MTY5MS44MTYsInN1YiI6IjY4ZmUzYWViMWVhOTFmODU3YTkyNzI1YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.GFHuxD88V-6JNY_gFIBvvZh-9dFRtN8pn1JaC3S56Yg",
  },
};

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500/";

// Helper function to map TMDB genre IDs to genre names
const genreMap: { [key: number]: string } = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// Helper function to transform TMDB movie to our Movie type
function transformTMDBMovie(tmdbMovie: any): Movie {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    releaseDate: tmdbMovie.release_date,
    overview: tmdbMovie.overview,
    posterUrl: tmdbMovie.poster_path
      ? `${POSTER_BASE_URL}${tmdbMovie.poster_path}`
      : "",
    backdropUrl: tmdbMovie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280/${tmdbMovie.backdrop_path}`
      : undefined,
    rating: tmdbMovie.vote_average, // Keep TMDB 10-point scale (e.g., 5.6)
    genre: tmdbMovie.genre_ids
      ? tmdbMovie.genre_ids
          .map((id: number) => genreMap[id])
          .filter(Boolean)
          .slice(0, 3)
      : [],
    popularity: tmdbMovie.popularity || 0,
    featured: tmdbMovie.vote_average >= 8.0, // Mark highly rated movies as featured
  };
}

// Fallback dummy data if API fails
const DUMMY_MOVIES: Movie[] = [
  {
    id: 1,
    title: "Toxic",
    releaseDate: "2025-01-10",
    overview: "An epic action thriller starring Yash in a high-octane story of revenge and redemption.",
    posterUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/tZ8eSBXbza96vzCYeVTG9RBJ78E.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w440_and_h660_face/fhCmyoDQRYwXLFBvDTmbmUF1w7u.jpg",
    rating: 8.9,
    genre: ["Action", "Thriller", "Crime"],
    popularity: 100,
    featured: true,
  },
  {
    id: 2,
    title: "The Raja Shaab",
    releaseDate: "2025-02-14",
    overview: "A majestic period drama featuring Prabhas in the role of a legendary king fighting against colonial forces.",
    posterUrl: "https://media.themoviedb.org/t/p/w440_and_h660_face/w59tiCqfl5rGr9PEtHXEd2oyzCr.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/nvK6gYa4diCnQkDVN42uoYXPrdT.jpg",
    rating: 9.1,
    genre: ["Drama", "Action", "Historical"],
    popularity: 98,
    featured: true,
  },
  {
    id: 3,
    title: "Avatar: Fire and Ash",
    releaseDate: "2025-03-21",
    overview: "The next chapter in the Avatar universe - a breathtaking journey of survival and discovery.",
    posterUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/5bxrxnRaxZooBAxgUVBZ13dpzC7.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/5bxrxnRaxZooBAxgUVBZ13dpzC7.jpg",
    rating: 8.7,
    genre: ["Adventure", "Sci-Fi", "Action"],
    popularity: 96,
    featured: true,
  },
  {
    id: 4,
    title: "Jana Nayagan",
    releaseDate: "2025-04-15",
    overview: "Thalapathy Vijay stars as a common man who becomes a hero of the masses in this powerful social drama.",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BODQ4ZGNkNGEtZDM4NS00ZTI1LThjNmUtNjhlMWM1ZDBlZThmXkEyXkFqcGc@._V1_FMjpg_UX1080_.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/iSPG1IB7KyP8i3gvXzkhP9cFxQi.jpg",
    rating: 8.5,
    genre: ["Action", "Drama", "Thriller"],
    popularity: 95,
    featured: false,
  },
  {
    id: 5,
    title: "Ramayan Part 1",
    releaseDate: "2025-05-12",
    overview: "Ranbir Kapoor stars in this grand mythological epic, bringing the ancient epic to life with stunning visuals.",
    posterUrl: "https://media.themoviedb.org/t/p/w440_and_h660_face/dLMBl3fpFDqxgHrrqq47EGfqYCS.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w440_and_h660_face/qSb13MDWY96bZRyHdSIwjuxaXTC.jpg",
    rating: 8.8,
    genre: ["Epic", "Drama", "Adventure"],
    popularity: 94,
    featured: false,
  },
  {
    id: 6,
    title: "Deadpool & Wolverine",
    releaseDate: "2024-07-26",
    overview: "The merc with a mouth teams up with the best there is for an epic adventure.",
    posterUrl: "https://media.themoviedb.org/t/p/w440_and_h660_face/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w440_and_h660_face/jbwYaoYWZwxtPP76AZnfYKQjCEB.jpg",
    rating: 8.3,
    genre: ["Action", "Comedy", "Superhero"],
    popularity: 92,
    featured: false,
  },
  {
    id: 7,
    title: "Dune: Part Two",
    releaseDate: "2024-03-01",
    overview: "Paul Atreides continues his journey to fulfill his destiny on the desert planet Arrakis.",
    posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/uLDWvVYYdOKO1XQYL5pNkCEs6xw.jpg",
    rating: 9.0,
    genre: ["Sci-Fi", "Adventure", "Epic"],
    popularity: 90,
    featured: false,
  },
  {
    id: 8,
    title: "Inside Out 2",
    releaseDate: "2024-06-14",
    overview: "Riley turns 13 and that means new emotions are moving in and they are not messing around.",
    posterUrl: "https://media.themoviedb.org/t/p/w440_and_h660_face/mmdBbXCs85JxxKyG664KI46rdC3.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w440_and_h660_face/mmdBbXCs85JxxKyG664KI46rdC3.jpg",
    rating: 8.2,
    genre: ["Animation", "Comedy", "Family"],
    popularity: 88,
    featured: false,
  },
  {
    id: 9,
    title: "Bad Boys: Ride or Die",
    releaseDate: "2024-06-07",
    overview: "Detectives Mike Lowrey and Marcus Burnett are back with their guns blazing.",
    posterUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/oGythE98MYleE6mZlGs5oBGkux1.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/oGythE98MYleE6mZlGs5oBGkux1.jpg",
    rating: 7.8,
    genre: ["Action", "Comedy", "Crime"],
    popularity: 87,
    featured: false,
  },
  {
    id: 10,
    title: "Joker: Folie à Deux",
    releaseDate: "2024-10-04",
    overview: "The Joker and Harley Quinn's twisted love story continues in Gotham City.",
    posterUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/if8QiqCI7WAGImKcJCfzp6VTyKA.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/if8QiqCI7WAGImKcJCfzp6VTyKA.jpg",
    rating: 8.4,
    genre: ["Crime", "Drama", "Thriller"],
    popularity: 86,
    featured: false,
  },
  {
    id: 11,
    title: "Gladiator 2",
    releaseDate: "2024-11-22",
    overview: "Thirty years after witnessing the death of Maximus, Lucius returns to the arena as a gladiator.",
    posterUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    rating: 8.1,
    genre: ["Action", "Drama", "Epic"],
    popularity: 85,
    featured: false,
  },
  {
    id: 12,
    title: "Moana 2",
    releaseDate: "2024-11-27",
    overview: "Moana must sail to the farthest seas to save her people in this epic animated musical adventure.",
    posterUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/aLVkiINlIeCkcZIzb7XHzPYgO6L.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/aLVkiINlIeCkcZIzb7XHzPYgO6L.jpg",
    rating: 8.0,
    genre: ["Animation", "Adventure", "Musical"],
    popularity: 84,
    featured: false,
  },
  {
    id: 13,
    title: "Kingdom of the Planet of the Apes",
    releaseDate: "2024-05-10",
    overview: "Many years after Caesar's reign, apes are the dominant species and live harmoniously while humans have been reduced to a feral existence.",
    posterUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
    rating: 7.9,
    genre: ["Action", "Sci-Fi", "Thriller"],
    popularity: 83,
    featured: false,
  },
  {
    id: 14,
    title: "Borderlands",
    releaseDate: "2024-08-09",
    overview: "A group of heroes must recover a missing girl who holds a key to unimaginable power.",
    posterUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/4JGoZu1ZKFpMJTWAP35PCfkMgu8.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/4JGoZu1ZKFpMJTWAP35PCfkMgu8.jpg",
    rating: 7.5,
    genre: ["Action", "Comedy", "Sci-Fi"],
    popularity: 82,
    featured: false,
  },
  {
    id: 15,
    title: "Kalki 2898 AD",
    releaseDate: "2024-06-27",
    overview: "An epic futuristic sci-fi drama featuring an all-star cast in a dystopian world.",
    posterUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg",
    rating: 8.7,
    genre: ["Sci-Fi", "Action", "Drama"],
    popularity: 91,
    featured: false,
  },
  {
    id: 16,
    title: "Pushpa 2: The Rule",
    releaseDate: "2024-12-06",
    overview: "The saga of Pushpa Raj continues as he fights for survival in the red sandalwood smuggling empire.",
    posterUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/gpNcQfQ4YGtFwEcrjcK9HxVM2KF.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/gpNcQfQ4YGtFwEcrjcK9HxVM2KF.jpg",
    rating: 8.9,
    genre: ["Action", "Drama", "Crime"],
    popularity: 93,
    featured: false,
  },
  {
    id: 17,
    title: "KGF Chapter 3",
    releaseDate: "2025-12-12",
    overview: "Rocky's empire faces new challenges as he deals with bigger threats and political conspiracies.",
    posterUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/ex2zyM6LVd31h9TlAi9RaR7QARK.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/ex2zyM6LVd31h9TlAi9RaR7QARK.jpg",
    rating: 9.0,
    genre: ["Action", "Crime", "Thriller"],
    popularity: 97,
    featured: false,
  },
  {
    id: 18,
    title: "Salaar 2",
    releaseDate: "2025-08-15",
    overview: "Deva's journey continues as he faces even greater challenges in the world of gangsters.",
    posterUrl: "https://media.themoviedb.org/t/p/w440_and_h660_face/dKOwWF1AnHM1egxoGXBM9GzMYtW.jpg",
    backdropUrl: "https://media.themoviedb.org/t/p/w440_and_h660_face/dKOwWF1AnHM1egxoGXBM9GzMYtW.jpg",
    rating: 8.8,
    genre: ["Action", "Crime", "Drama"],
    popularity: 95,
    featured: false,
  },
];

export async function fetchMovies(page = 1): Promise<MovieResponse> {
  try {
    console.log(`🔄 Fetching movies from TMDB API (page ${page})...`);
    
    // Fetch real data from TMDB
    const response = await fetch(
      `${TMDB_URL}movie/upcoming?page=${page}&language=en-US`,
      TMDB_OPTIONS
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform TMDB movies to our Movie type
    const transformedMovies = data.results
      .filter((movie: any) => movie.poster_path) // Only include movies with posters
      .map(transformTMDBMovie);

    const movieResponse: MovieResponse = {
      page: data.page,
      results: transformedMovies,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };

    console.log(`✅ Successfully fetched ${transformedMovies.length} real movies from TMDB (page ${page})`);
    return movieResponse;
  } catch (error) {
    console.error("❌ Error fetching movies from TMDB:", error);
    
    // If all else fails, use dummy data
    console.log("⚠️ Using fallback dummy data due to API error");
    const moviesPerPage = 20;
    const startIndex = (page - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;
    const paginatedMovies = DUMMY_MOVIES.slice(startIndex, endIndex);

    return {
      page,
      results: paginatedMovies,
      totalPages: Math.ceil(DUMMY_MOVIES.length / moviesPerPage),
      totalResults: DUMMY_MOVIES.length,
    };
  }
}

export async function clearMovieCache(): Promise<void> {
  // Cache is now handled by React Query persistence
  // This function is kept for backward compatibility
  console.log("Cache is managed by React Query");
}

// Fetch movie trailer URL from TMDB
export async function fetchMovieTrailer(movieId: number): Promise<string | null> {
  try {
    const response = await fetch(
      `${TMDB_URL}movie/${movieId}/videos?language=en-US`,
      TMDB_OPTIONS
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Find the official trailer or a trailer
    const trailer = data.results.find(
      (video: any) => 
        video.type === "Trailer" && 
        video.site === "YouTube" &&
        (video.name.toLowerCase().includes('official') || video.iso_639_1 === 'en')
    ) || data.results.find(
      (video: any) => video.type === "Trailer" && video.site === "YouTube"
    );

    if (trailer) {
      return `https://www.youtube.com/watch?v=${trailer.key}`;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching trailer for movie ${movieId}:`, error);
    return null;
  }
}

// Discover movies by original language/region with optional release-date filter
export async function discoverMovies(params: {
  page?: number;
  withOriginalLanguage: string; // e.g. 'hi', 'ta', 'te', 'ml', 'en'
  region: string; // e.g. 'IN', 'US'
  includeAdult?: boolean;
  releaseDateGte?: string; // YYYY-MM-DD
  sortBy?: string; // e.g. 'release_date.asc' | 'release_date.desc'
}): Promise<MovieResponse> {
  const {
    page = 1,
    withOriginalLanguage,
    region,
    includeAdult = false,
    releaseDateGte,
    sortBy = "release_date.asc",
  } = params;

  try {
    const query = new URLSearchParams();
    query.set("with_original_language", withOriginalLanguage);
    query.set("region", region);
    query.set("include_adult", includeAdult ? "true" : "false");
    query.set("page", String(page));
    query.set("sort_by", sortBy);
    // Align with upcoming focus: only future releases if provided
    if (releaseDateGte) {
      query.set("primary_release_date.gte", releaseDateGte);
    }

    const url = `${TMDB_URL}discover/movie?${query.toString()}`;
    const response = await fetch(url, TMDB_OPTIONS);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const transformed = (data.results || [])
      .filter((movie: any) => movie.poster_path)
      .map(transformTMDBMovie);

    return {
      page: data.page,
      results: transformed,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error("❌ Error discovering movies from TMDB:", error);
    // Fall back to the same dummy paging behavior
    const moviesPerPage = 20;
    const startIndex = (params.page ? params.page - 1 : 0) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;
    const paginatedMovies = DUMMY_MOVIES.slice(startIndex, endIndex);
    return {
      page: params.page || 1,
      results: paginatedMovies,
      totalPages: Math.ceil(DUMMY_MOVIES.length / moviesPerPage),
      totalResults: DUMMY_MOVIES.length,
    };
  }
}

// Search movies with query (autocomplete support)
export async function searchMovies(params: { query: string; page?: number }): Promise<MovieResponse> {
  const { query, page = 1 } = params;
  try {
    const q = new URLSearchParams();
    q.set("query", query);
    q.set("page", String(page));
    q.set("include_adult", "false");
    const url = `${TMDB_URL}search/movie?${q.toString()}`;

    const response = await fetch(url, TMDB_OPTIONS);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    const transformed = (data.results || [])
      .filter((m: any) => m.poster_path)
      .map(transformTMDBMovie);
    return {
      page: data.page,
      results: transformed,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error("❌ Error searching movies:", error);
    return { page, results: [], totalPages: 0, totalResults: 0 };
  }
}

// Fetch similar movies for a given movie
export async function fetchSimilar(movieId: number, page = 1): Promise<MovieResponse> {
  try {
    const url = `${TMDB_URL}movie/${movieId}/similar?page=${page}`;
    const response = await fetch(url, TMDB_OPTIONS);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    const transformed = (data.results || [])
      .filter((m: any) => m.poster_path)
      .map(transformTMDBMovie);
    return {
      page: data.page,
      results: transformed,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error("❌ Error fetching similar movies:", error);
    return { page, results: [], totalPages: 0, totalResults: 0 };
  }
}

// Fetch credits (cast & crew) for a movie
export type CastMember = {
  id: number;
  name: string;
  character?: string;
  profileUrl?: string;
};

export async function fetchCredits(movieId: number): Promise<{ cast: CastMember[]; crew: any[] }> {
  try {
    const url = `${TMDB_URL}movie/${movieId}/credits`;
    const response = await fetch(url, TMDB_OPTIONS);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    const cast: CastMember[] = (data.cast || []).slice(0, 12).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profileUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185/${c.profile_path}` : undefined,
    }));
    return { cast, crew: data.crew || [] };
  } catch (error) {
    console.error("❌ Error fetching credits:", error);
    return { cast: [], crew: [] };
  }
}

// Watch providers (JustWatch integration via TMDB providers API)
export async function fetchWatchProviders(movieId: number): Promise<any> {
  try {
    const url = `${TMDB_URL}movie/${movieId}/watch/providers`;
    const response = await fetch(url, TMDB_OPTIONS);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    return data.results || {};
  } catch (error) {
    console.error("❌ Error fetching watch providers:", error);
    return {};
  }
}