import { useQuery } from "@tanstack/react-query";
import { fetchPosts, fetchCategories } from "../api/api";

export default function usePosts() {
  // Query for posts with optimized caching
  const {
    data: posts = [],
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
    isRefetching: postsRefreshing,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 10 * 60 * 1000, // 10 minutes (optimized for performance)
    gcTime: 60 * 60 * 1000, // 1 hour (keep longer for offline)
    placeholderData: (previousData) => previousData, // Smooth transitions
    // Automatically persisted to AsyncStorage
  });

  // Query for categories with optimized caching
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 20 * 60 * 1000, // 20 minutes (categories change very rarely)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    placeholderData: (previousData) => previousData, // Smooth transitions
    // Automatically persisted to AsyncStorage
  });

  const loading = postsLoading || categoriesLoading;
  const error = postsError || categoriesError;
  const errorMessage = error instanceof Error ? error.message : null;

  const refresh = async () => {
    await refetchPosts();
  };

  return {
    posts,
    categories,
    loading,
    refresh,
    refreshing: postsRefreshing,
    error: errorMessage,
  };
}
