import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Home from "./src/screens/Home";
import Detail from "./src/screens/Detail";
import MoviePoll from "./src/screens/MoviePoll";
import MovieDetail from "./src/screens/MovieDetail";
import Bookmarks from "./src/screens/Bookmarks";
import Profile from "./src/screens/Profile";
import Splash from "./src/screens/Splash";
import FloatingTabBar from "./src/components/FloatingTabBar";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { clearAllCache } from "./src/utils/clearCache";
import { configureNotificationHandler } from "./src/utils/notifications";
import "./global.css"

// Clear old cache on app start (only run once to clear old dummy data)
// Uncomment the line below if you need to clear cache
// clearAllCache().catch(console.error);

// Create async storage persister with optimized settings
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000, // Throttle writes to avoid overwhelming AsyncStorage
  maxAge: 24 * 60 * 60 * 1000, // Persist for 24 hours
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

// Create a React Query client with highly optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh (no refetch)
      staleTime: 10 * 60 * 1000, // 10 minutes (increased for better performance)
      
      // Garbage collection time: how long unused data stays in memory
      gcTime: 60 * 60 * 1000, // 1 hour (extended for offline support)
      
      // Retry settings
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch behavior
      refetchOnWindowFocus: false, // Don't refetch when app comes to focus
      refetchOnMount: false, // Don't refetch on mount if data is fresh
      refetchOnReconnect: true, // Auto refetch when network reconnects
      
      // Network mode
      networkMode: 'online', // Only fetch when online
      
      // Structural sharing for better performance
      structuralSharing: true,
    },
    mutations: {
      retry: 1,
    },
  },
});




const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();





function HomeTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Movie Poll" component={MoviePoll} />
      <Tab.Screen name="Bookmarks" component={Bookmarks} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { theme } = useTheme();

  return (
    <NavigationContainer theme={theme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        <Stack.Screen 
          name="Splash" 
          component={Splash}
          options={{
            animation: 'fade',
            animationDuration: 500,
          }}
        />
        <Stack.Screen 
          name="HomeTabs" 
          component={HomeTabs}
          options={{
            animation: 'slide_from_bottom',
            animationDuration: 400,
          }}
        />
        <Stack.Screen 
          name="Detail" 
          component={Detail}
          options={{
            animation: 'slide_from_right',
            animationDuration: 350,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />
        <Stack.Screen 
          name="MovieDetail" 
          component={MovieDetail}
          options={{
            animation: 'slide_from_right',
            animationDuration: 350,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  // Configure global notification handler once
  configureNotificationHandler();
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ 
        persister: asyncStoragePersister,
        // Optimize what gets persisted
        buster: "", // Add version here if you need to invalidate cache
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: () => true,
        },
      }}
    >
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
