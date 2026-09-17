import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
  Image,
  Vibration,
  ScrollView,
  Alert,
  Share,
  Modal,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Movie } from "../types/movie";
import { fetchMovies, fetchMovieTrailer, discoverMovies, searchMovies } from "../api/movieApi";
import * as Haptics from 'expo-haptics';
// import { scheduleReleaseReminder } from "../utils/notifications";
import { BlurView } from 'expo-blur';
import { useNavigation } from "@react-navigation/native";
import useMovieVotes from "../hooks/useMovieVotes";
import Shimmer from "../components/Shimmer";
import YoutubePlayer from "react-native-youtube-iframe";
import { clearAllCache } from "../utils/clearCache";


const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 64;
const CAROUSEL_HEIGHT = 240;
const AUTOPLAY_DURATION = 4000; // 4 seconds

export default function MoviePoll() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [trailerModalVisible, setTrailerModalVisible] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [trailerVideoId, setTrailerVideoId] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<
    "All" | "Bollywood" | "Tamil" | "Telugu" | "Malayalam" | "Hollywood"
  >("All");
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<FlatList>(null);
  const mainScrollRef = useRef<FlatList>(null);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);
  const currentIndex = useRef(0);
  const { vote, getVote, loaded: votesLoaded } = useMovieVotes();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Query for featured movies (carousel)
  const {
    data: featuredData,
    isLoading: featuredLoading,
  } = useQuery({
    queryKey: ["movies", "featured"],
    queryFn: () => fetchMovies(1),
    staleTime: 15 * 60 * 1000, // 15 minutes (movies don't change often)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours (keep in memory longer)
    // Optimized for fast loading
    placeholderData: (previousData) => previousData, // Keep showing old data while fetching new
  });

  // Mapping for industry → TMDB discover params
  const INDUSTRY_PARAMS: Record<string, { lang: string; region: string }> = {
    Bollywood: { lang: "hi", region: "IN" },
    Tamil: { lang: "ta", region: "IN" },
    Telugu: { lang: "te", region: "IN" },
    Malayalam: { lang: "ml", region: "IN" },
    Hollywood: { lang: "en", region: "US" },
  };

  // Infinite query for all movies (with filter)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["movies", "all", selectedIndustry],
    queryFn: ({ pageParam = 1 }) => {
      if (selectedIndustry === "All") {
        return fetchMovies(pageParam);
      }
      const params = INDUSTRY_PARAMS[selectedIndustry];
      // Default to upcoming: today onward, ascending by release date
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const gte = `${yyyy}-${mm}-${dd}`;
      return discoverMovies({
        page: pageParam,
        withOriginalLanguage: params.lang,
        region: params.region,
        includeAdult: false,
        releaseDateGte: gte,
        sortBy: "release_date.asc",
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    // Optimized for fast loading and infinite scroll
    placeholderData: (previousData) => previousData,
  });

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Search query
  const { data: searchData } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchMovies({ query: debouncedQuery, page: 1 }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60 * 1000,
  });

  const featuredMovies = featuredData?.results.filter((m) => m.featured) || [];
  const featuredMovieIds = new Set(featuredMovies.map(m => m.id));
  
  // Deduplicate across pages in case same movies appear multiple times
  const seenIds = new Set<number>();
  const allMovies = (data?.pages
    .reduce((acc, page) => [...acc, ...page.results], [] as Movie[])
    .filter(m => {
      // Only skip duplicates, not featured movies
      if (seenIds.has(m.id)) {
        return false;
      }
      seenIds.add(m.id);
      return true;
    }) || []) as Movie[];

  // Autoplay carousel
  useEffect(() => {
    if (featuredMovies.length > 1) {
      autoplayTimer.current = setInterval(() => {
        currentIndex.current = (currentIndex.current + 1) % featuredMovies.length;
        // Use scrollToIndex only if index is valid
        if (carouselRef.current && currentIndex.current < featuredMovies.length) {
          carouselRef.current.scrollToIndex({
            index: currentIndex.current,
            animated: true,
          });
        }
      }, AUTOPLAY_DURATION);
    }
    return () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current);
      }
    };
  }, [featuredMovies.length]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleClearCacheAndRefresh = useCallback(async () => {
    try {
      await clearAllCache();
      Alert.alert(
        "Cache Cleared",
        "Cache has been cleared. Pull down to refresh and get fresh data from TMDB.",
        [{ text: "OK", onPress: () => refetch() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to clear cache");
    }
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleVote = useCallback(
    (movieId: number, voteType: "interested" | "not-interested") => {
      if (!votesLoaded) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => Vibration.vibrate(50));
      vote(movieId, voteType);
      if (voteType === 'interested') {
        const movie = allMovies.find(m => m.id === movieId);
        if (movie && movie.releaseDate) {
          scheduleReleaseReminder({
            title: `${movie.title} releases today`,
            body: 'Tap to see details',
            releaseDateISO: movie.releaseDate,
          }).catch(() => {});
        }
      }
    },
    [vote, votesLoaded, allMovies]
  );

  const handleShare = useCallback(async (movie: Movie) => {
    try {
      const result = await Share.share({
        message: `Check out "${movie.title}"! 🎬\n\n${movie.overview}\n\nRating: ${movie.rating}/10`,
        title: movie.title,
      });
      if (result.action === Share.sharedAction) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => Vibration.vibrate(50));
      }
    } catch (error) {
      Alert.alert("Error", "Unable to share movie");
    }
  }, []);

  const handleWatchTrailer = useCallback(async (movie: Movie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLoadingTrailer(true);
    setTrailerModalVisible(true);
    
    try {
      const url = await fetchMovieTrailer(movie.id);
      if (url) {
        // Extract YouTube video ID
        const videoId = url.split('v=')[1]?.split('&')[0];
        if (videoId) {
          setTrailerVideoId(videoId);
          setTrailerUrl(url);
        } else {
          throw new Error("Invalid trailer URL");
        }
      } else {
        Alert.alert("No Trailer", "Trailer not available for this movie.");
        setTrailerModalVisible(false);
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
      Alert.alert("Error", "Unable to load trailer. Please try again later.");
      setTrailerModalVisible(false);
    } finally {
      setLoadingTrailer(false);
    }
  }, []);

  const closeTrailerModal = useCallback(() => {
    setTrailerModalVisible(false);
    setTrailerVideoId("");
    setTrailerUrl(null);
  }, []);

  const renderCarouselItem = useCallback(
    ({ item, index }: { item: Movie; index: number }) => {
      const inputRange = [
        (index - 1) * CARD_WIDTH,
        index * CARD_WIDTH,
        (index + 1) * CARD_WIDTH,
      ];

      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.9, 1, 0.9],
        extrapolate: "clamp",
      });

      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.5, 1, 0.5],
        extrapolate: "clamp",
      });

      return (
        <Animated.View
          style={{
            width: CARD_WIDTH,
            height: CAROUSEL_HEIGHT,
            marginHorizontal: 8,
            opacity,
            transform: [{ scale }],
          }}
        >
                     <View className="rounded-3xl overflow-hidden bg-white dark:bg-[#1f1f1f] shadow-2xl">
             <Image
               source={{ uri: item.posterUrl }}
               style={{ width: "100%", height: CAROUSEL_HEIGHT }}
               resizeMode="cover"
             />
             
             {/* Share Button - Top Right */}
             <TouchableOpacity
               onPress={() => handleShare(item)}
               activeOpacity={0.7}
               style={{
                 position: 'absolute',
                 top: 12,
                 right: 12,
                 backgroundColor: '#e61d1d',
                 borderRadius: 22,
                 width: 35,
                 height: 35,
                 justifyContent: 'center',
                 alignItems: 'center',
                 shadowColor: '#000',
                 shadowOffset: { width: 0, height: 2 },
                 shadowOpacity: 0.25,
                 shadowRadius: 3.84,
                 elevation: 5,
                 zIndex: 10,
               }}
             >
               <Ionicons name="share-social" size={20} color="white" />
             </TouchableOpacity>
            
            <View className="absolute bottom-0 left-0 right-0 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
              <Text
                className="text-white text-2xl font-bold mb-2"
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-4">
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text className="text-white font-semibold ml-1">
                    {item.rating && item.rating > 0 ? Number(item.rating).toFixed(1) : 'N/A'}
                  </Text>
                </View>
                <Text className="text-white text-sm opacity-80">
                  {new Date(item.releaseDate).getFullYear()}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      );
    },
    [scrollX, handleShare]
  );

  const renderMovieCard = useCallback(
    ({ item }: { item: Movie }) => {
      const userVote = getVote(item.id);
      const isInterested = userVote?.vote === "interested";
      const isNotInterested = userVote?.vote === "not-interested";

      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("MovieDetail", { movie: item })}
          className="mb-4 bg-white dark:bg-[#1f1f1f] rounded-2xl overflow-hidden shadow-lg"
        >
          {/* Share Button - Top Right */}
          <TouchableOpacity
            onPress={() => handleShare(item)}
            activeOpacity={0.7}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: '#e61d1d',
              borderRadius: 22,
              width: 35,
              height: 35,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              zIndex: 10,
            }}
          >
            <Ionicons name="share-social" size={20} color="white" />
          </TouchableOpacity>

          <View className="flex-row">
            <Image
              source={{ uri: item.posterUrl }}
              style={{ width: 120, height: 180 }}
              resizeMode="cover"
            />
            <View className="flex-1 p-4 justify-between">
              <View>
                <Text
                  className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 pr-12"
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text
                  className="text-sm text-slate-600 dark:text-slate-400 mb-3"
                  numberOfLines={3}
                >
                  {item.overview}
                </Text>
                <View className="flex-row flex-wrap mb-3">
                  {item.genre.slice(0, 2).map((g, idx) => (
                    <View
                      key={idx}
                      className="bg-red-100 dark:bg-red-900/20 px-3 py-1 rounded-full mr-2 mb-2"
                    >
                      <Text className="text-xs text-red-600 dark:text-red-400 font-semibold">
                        {g}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text className="text-slate-600 dark:text-slate-400 font-semibold ml-1">
                    {item.rating && item.rating > 0 ? Number(item.rating).toFixed(1) : 'N/A'}
                  </Text>
                </View>
                <Text className="text-xs text-slate-500 dark:text-slate-500">
                  {new Date(item.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>
          </View>

          <View className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-slate-700">
            {/* Vote Buttons */}
            <View className="flex-row mb-2">
              <TouchableOpacity
                onPress={() => handleVote(item.id, "interested")}
                className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl mr-2 ${
                  isInterested
                    ? "bg-green-500"
                    : "bg-green-100 dark:bg-green-900/20"
                }`}
              >
                <Text
                  className={`text-lg mr-2 ${
                    isInterested ? "text-white" : "text-green-600"
                  }`}
                >
                  👍
                </Text>
                <Text
                  className={`font-semibold ${
                    isInterested
                      ? "text-white"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  Interested
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleVote(item.id, "not-interested")}
                className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl ml-2 ${
                  isNotInterested
                    ? "bg-red-500"
                    : "bg-red-100 dark:bg-red-900/20"
                }`}
              >
                <Text
                  className={`text-lg mr-2 ${
                    isNotInterested ? "text-white" : "text-red-600"
                  }`}
                >
                  👎
                </Text>
                <Text
                  className={`font-semibold ${
                    isNotInterested
                      ? "text-white"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  Pass
                </Text>
              </TouchableOpacity>
            </View>

            {/* Watch Trailer Button */}
            <TouchableOpacity
              onPress={() => handleWatchTrailer(item)}
              className="flex-row items-center justify-center py-3 px-4 rounded-xl"
              style={{ backgroundColor: '#e61d1d' }}
              activeOpacity={0.7}
            >
              <Ionicons name="play-circle" size={24} color="white" />
              <Text className="text-white font-semibold ml-2 text-lg">
                Watch Trailer
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
         },
     [getVote, handleVote, handleShare, handleWatchTrailer]
   );

  if (isLoading || featuredLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-[#0f0f0f] p-4">
        <View className="mb-6">
          <View className="h-12 bg-gray-200 dark:bg-slate-700 rounded-xl">
            <Shimmer style={{ height: 48 }} />
          </View>
        </View>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            className="mb-4 rounded-2xl overflow-hidden bg-white dark:bg-[#1f1f1f]"
          >
            <View style={{ height: 240 }} className="bg-gray-200 dark:bg-slate-700">
              <Shimmer style={{ height: 240 }} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-[#0f0f0f]">
      {/* Fixed Header */}
      <View
        className="px-4 pb-4"
        style={{ paddingTop: insets.top + 20 }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Image
              source={require("../../assets/logo.png")}
              className="w-12 h-10 mr-3"
              resizeMode="contain"
            />
            <View>
              <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Movie Poll
              </Text>
              <Text className="text-slate-600 dark:text-slate-400 text-sm">
                Share your interest in upcoming movies
              </Text>
            </View>
          </View>
          
          {/* Clear Cache Button */}

          {/* <TouchableOpacity
            onPress={handleClearCacheAndRefresh}
            className="bg-red-500 px-3 py-2 rounded-lg"
          >
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity> */}

        </View>
      </View>

            {/* Main Scrollable Content */}
      <FlatList
        ref={mainScrollRef}
        data={allMovies}
        keyExtractor={(item) => `movie-${item.id}`}
        ListHeaderComponent={() => (
          <View className="mb-6">
            {/* Glassmorphism Search Bar */}
            <View className="px-4 mb-3">
              <BlurView intensity={40} tint={"dark"} style={{ borderRadius: 16, overflow: 'hidden' }}>
                <View className="flex-row items-center px-3 py-2" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
                  <Ionicons name="search" size={18} color="#e61d1d" />
                  <TextInput
                    placeholder="Search movies..."
                    placeholderTextColor="#cbd5e1"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-2 text-white"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}> 
                      <Ionicons name="close-circle" size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                  )}
                </View>
              </BlurView>
            </View>
            {/* Filter Tag Bar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
              className="mt-1"
            >
              {(["All", "Bollywood", "Tamil", "Telugu", "Malayalam", "Hollywood"] as const).map(
                (label) => {
                  const isActive = selectedIndustry === label;
                  return (
                    <TouchableOpacity
                      key={label}
                      onPress={() => setSelectedIndustry(label)}
                      className={`px-4 py-2 rounded-full mr-2 border shadow-sm ${
                        isActive
                          ? "bg-red-500 border-white/30"
                          : "bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/20"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text
                        className={`${
                          isActive
                            ? "text-white"
                            : "text-slate-800 dark:text-slate-100"
                        } font-semibold`}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </ScrollView>
            <View className="flex-row items-center px-4 mb-4">
              <Ionicons name="flame" size={28} color="#e61d1d" style={{ marginRight: 8 }} />
              <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Trending Now: Upcoming Releases
              </Text>
            </View>
            
            {/* Carousel */}
            {featuredMovies.length > 0 && (
              <>
                <Animated.FlatList
                  ref={carouselRef}
                  data={featuredMovies}
                  keyExtractor={(item) => `featured-${item.id}`}
                  renderItem={renderCarouselItem}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={CARD_WIDTH + 16}
                  decelerationRate="fast"
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
                  )}
                  scrollEventThrottle={16}
                  onMomentumScrollEnd={(e) => {
                    const offsetX = e.nativeEvent.contentOffset.x;
                    const index = Math.round(offsetX / (CARD_WIDTH + 16));
                    currentIndex.current = index;
                  }}
                  getItemLayout={(_, index) => ({
                    length: CARD_WIDTH + 16,
                    offset: (CARD_WIDTH + 16) * index,
                    index,
                  })}
                  onScrollToIndexFailed={(info) => {
                    console.warn('Failed to scroll to index:', info);
                    // Fallback: try to scroll to a nearby index
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                      if (carouselRef.current && info.index < featuredMovies.length) {
                        carouselRef.current.scrollToIndex({
                          index: info.index,
                          animated: false,
                        });
                      }
                    });
                  }}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                />
                
                {/* Pagination Dots */}
                <View className="flex-row justify-center items-center mt-4">
                  {featuredMovies.map((_, index) => {
                    const inputRange = [
                      (index - 1) * CARD_WIDTH,
                      index * CARD_WIDTH,
                      (index + 1) * CARD_WIDTH,
                    ];
                    
                    const dotOpacity = scrollX.interpolate({
                      inputRange,
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: 'clamp',
                    });
                    
                    const dotScale = scrollX.interpolate({
                      inputRange,
                      outputRange: [0.8, 1, 0.8],
                      extrapolate: 'clamp',
                    });
                    
                    return (
                      <Animated.View
                        key={`dot-${index}`}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e61d1d',
                          marginHorizontal: 4,
                          opacity: dotOpacity,
                          transform: [{ scale: dotScale }],
                        }}
                      />
                    );
                  })}
                </View>
              </>
            )}
            
            {/* All Movies Section Header */}
            <View className="px-4 mb-4 mt-6">
              <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">
                All Movies ({allMovies.length})
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            {renderMovieCard({ item })}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#e61d1d"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4 items-center">
              <Shimmer style={{ width: 100, height: 20 }} />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Search Results Overlay */}
      {debouncedQuery.length >= 2 && (
        <View className="absolute left-0 right-0" style={{ top: insets.top + 76 }}>
          <View className="mx-4 rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(15,15,15,0.98)' }}>
            <FlatList
              data={searchData?.results || []}
              keyExtractor={(item) => `search-${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    navigation.navigate('MovieDetail', { movie: item });
                  }}
                  className="flex-row items-center px-3 py-2"
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: item.posterUrl }} style={{ width: 40, height: 60, borderRadius: 8 }} />
                  <View className="ml-3 flex-1">
                    <Text className="text-white font-semibold" numberOfLines={1}>{item.title}</Text>
                    <Text className="text-white/70 text-xs mt-1">{item.rating && item.rating > 0 ? `${Number(item.rating).toFixed(1)} · ` : ''}{new Date(item.releaseDate).getFullYear()}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View className="px-4 py-6 items-center">
                  <Text className="text-white/70">No results</Text>
                </View>
              )}
              style={{ maxHeight: 360 }}
            />
          </View>
        </View>
      )}

      {/* Trailer Modal */}
      <Modal
        visible={trailerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeTrailerModal}
      >
        <View className="flex-1 bg-black/95 justify-center items-center px-4">
          {/* Close Button */}
          <TouchableOpacity
            onPress={closeTrailerModal}
            className="absolute top-12 right-4 z-10 bg-red-500 rounded-full w-10 h-10 items-center justify-center"
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          {loadingTrailer ? (
            <View className="items-center justify-center">
              <ActivityIndicator size="large" color="#e61d1d" />
              <Text className="text-white mt-4 text-lg">Loading trailer...</Text>
            </View>
          ) : trailerVideoId ? (
            <YoutubePlayer
              height={300}
              width={SCREEN_WIDTH - 32}
              videoId={trailerVideoId}
              play={true}
              onChangeState={(e: string) => {
                if (e === 'ended') {
                  setTrailerModalVisible(false);
                }
              }}
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
