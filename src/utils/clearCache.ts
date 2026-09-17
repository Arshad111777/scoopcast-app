import AsyncStorage from "@react-native-async-storage/async-storage";

// Clear all app cache
export async function clearAllCache() {
  try {
    console.log("🧹 Clearing old cache...");
    
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Clear old movie cache
    await AsyncStorage.removeItem("@scoopcast_movie_cache_v8");
    
    // Clear React Query cache (TanStack Query v5)
    const reactQueryKeys = keys.filter(key => 
      key.includes('REACT_QUERY') || 
      key.includes('TANSTACK_QUERY') ||
      key.startsWith('@tanstack')
    );
    if (reactQueryKeys.length > 0) {
      await AsyncStorage.multiRemove(reactQueryKeys);
    }
    
    // Clear other app caches
    await AsyncStorage.removeItem("@scoopcast_posts_cache_v1");
    await AsyncStorage.removeItem("@scoopcast_categories_cache_v1");
    
    console.log(`✅ Cleared ${reactQueryKeys.length + 3} cache entries`);
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
  }
}

