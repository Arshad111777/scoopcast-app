export type Movie = {
  id: number;
  title: string;
  releaseDate: string;
  overview: string;
  posterUrl: string;
  backdropUrl?: string;
  rating: number;
  genre: string[];
  popularity: number;
  featured?: boolean;
  trailerUrl?: string;
};

export type MovieVote = {
  movieId: number;
  vote: 'interested' | 'not-interested' | null;
  timestamp: number;
};

export type MovieResponse = {
  page: number;
  results: Movie[];
  totalPages: number;
  totalResults: number;
};

export type CastMember = {
  id: number;
  name: string;
  character?: string;
  profileUrl?: string;
};