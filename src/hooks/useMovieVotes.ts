import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MovieVote } from "../types/movie";

const KEY = "@scoopcast_movie_votes_v1";

export default function useMovieVotes() {
  const [votes, setVotes] = useState<Record<number, MovieVote>>({});
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        setVotes(JSON.parse(raw));
      }
    } catch (error) {
      console.error("Error loading votes:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const vote = useCallback(
    async (movieId: number, voteType: "interested" | "not-interested" | null) => {
      const currentVote = votes[movieId];
      
      // Toggle logic: if clicking the same vote type, remove it (null)
      const newVote: MovieVote = {
        movieId,
        vote:
          currentVote?.vote === voteType ? null : voteType,
        timestamp: Date.now(),
      };

      const updated = {
        ...votes,
        [movieId]: newVote,
      };

      // Remove null votes from storage
      if (newVote.vote === null) {
        delete updated[movieId];
      }

      setVotes(updated);
      await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    },
    [votes]
  );

  const getVote = useCallback(
    (movieId: number): MovieVote | null => {
      return votes[movieId] || null;
    },
    [votes]
  );

  const clearVotes = useCallback(async () => {
    setVotes({});
    await AsyncStorage.removeItem(KEY);
  }, []);

  return {
    votes,
    vote,
    getVote,
    clearVotes,
    loaded,
  };
}
