import { Post } from "../types";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = "https://scoopcast.in/wp-json/wp/v2";
const FALLBACK_BASE = "https://jsonplaceholder.typicode.com"; // Fallback for testing

const CACHE_KEYS = {
  POSTS: "@scoopcast_posts_cache_v1",
  CATEGORIES: "@scoopcast_categories_cache_v1",
};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Check network connectivity
const checkNetworkConnection = async () => {
  try {
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Add timeout and better error handling
const fetchWithTimeout = async (url: string, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export async function fetchPosts(): Promise<Post[]> {
  try {
    // Check cache first
    const cached = await AsyncStorage.getItem(CACHE_KEYS.POSTS);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      // Return cached data if it's still fresh
      if (now - timestamp < CACHE_DURATION) {
        console.log("✅ Returning cached posts");
        
        // Still fetch in background to update cache
        fetchPostsInBackground();
        return data;
      }
    }

    // Check network connectivity
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      // Return cached data if available, even if stale
      if (cached) {
        const { data } = JSON.parse(cached);
        console.log("⚠️ No internet, returning stale cache");
        return data;
      }
      throw new Error('No internet connection. Please check your network settings.');
    }

    const res = await fetchWithTimeout(`${BASE}/posts?_embed&per_page=20`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const posts = await res.json();
    
    // Cache the response
    await AsyncStorage.setItem(
      CACHE_KEYS.POSTS,
      JSON.stringify({
        data: posts,
        timestamp: Date.now(),
      })
    );
    
    console.log("✅ Fresh posts fetched and cached");
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    
    // Try to return cached data as fallback
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.POSTS);
      if (cached) {
        const { data } = JSON.parse(cached);
        console.log("✅ Fallback to cached posts");
        return data;
      }
    } catch (e) {
      console.error('Error reading cache:', e);
    }
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    if (error.message.includes('Network request failed') || error.message.includes('No internet connection')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw new Error('Failed to fetch posts. Please try again later.');
  }
}

// Background fetch without cache check
async function fetchPostsInBackground() {
  try {
    const res = await fetchWithTimeout(`${BASE}/posts?_embed&per_page=20`);
    if (res.ok) {
      const posts = await res.json();
      await AsyncStorage.setItem(
        CACHE_KEYS.POSTS,
        JSON.stringify({
          data: posts,
          timestamp: Date.now(),
        })
      );
      console.log("✅ Background posts cache updated");
    }
  } catch (error) {
    console.log("Background fetch failed (silent)");
  }
}

export async function fetchCategories() {
  try {
    // Check cache first
    const cached = await AsyncStorage.getItem(CACHE_KEYS.CATEGORIES);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      // Return cached data if it's still fresh
      if (now - timestamp < CACHE_DURATION * 2) { // Categories cache longer
        console.log("✅ Returning cached categories");
        return data;
      }
    }

    // Check network connectivity
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      // Return cached data if available
      if (cached) {
        const { data } = JSON.parse(cached);
        console.log("⚠️ No internet, returning cached categories");
        return data;
      }
      throw new Error('No internet connection. Please check your network settings.');
    }

    const res = await fetchWithTimeout(`${BASE}/categories`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const categories = await res.json();
    
    // Cache the response
    await AsyncStorage.setItem(
      CACHE_KEYS.CATEGORIES,
      JSON.stringify({
        data: categories,
        timestamp: Date.now(),
      })
    );
    
    console.log("✅ Fresh categories fetched and cached");
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Try to return cached data as fallback
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.CATEGORIES);
      if (cached) {
        const { data } = JSON.parse(cached);
        console.log("✅ Fallback to cached categories");
        return data;
      }
    } catch (e) {
      console.error('Error reading cache:', e);
    }
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    if (error.message.includes('Network request failed') || error.message.includes('No internet connection')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw new Error('Failed to fetch categories. Please try again later.');
  }
}
