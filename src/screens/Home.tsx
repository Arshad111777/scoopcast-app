import React, { useMemo, useState, useCallback, memo, useEffect, useRef } from "react";
import { View, FlatList, RefreshControl, Text, TouchableOpacity, TextInput, Alert, Image, Animated, Vibration, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import usePosts from "../hooks/usePosts";
import useBookmarks from "../hooks/useBookmarks";
import PostCard from "../components/PostCard";
import Shimmer from "../components/Shimmer";
import { Post } from "../types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = { Detail: { post: Post } };
type Props = NativeStackScreenProps<RootStackParamList, "Detail">;

export default function Home({ navigation }: Props) {
  const { posts, categories, loading, refresh, refreshing, error } = usePosts();
  const { bookmarks, toggle } = useBookmarks();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const scrollY = useRef(new Animated.Value(0)).current;

  // Create animated FlatList
  const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Post>);

  const filtered = useMemo(() => {
    let filteredPosts = posts;
    
    // Filter by category
    if (selectedCategory) {
      filteredPosts = filteredPosts.filter(p => (p.categories || []).includes(selectedCategory));
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredPosts = filteredPosts.filter(p => 
        p.title.rendered.toLowerCase().includes(query) ||
        p.excerpt.rendered.toLowerCase().includes(query)
      );
    }
    
    return filteredPosts;
  }, [posts, selectedCategory, searchQuery]);

  // Get selected category name for display
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return "All";
    return categories.find(cat => cat.id === selectedCategory)?.name || "Unknown";
  }, [selectedCategory, categories]);

  const onPress = useCallback((p: Post) => navigation.navigate("Detail", { post: p }), [navigation]);

  const handleBookmark = useCallback((post: Post) => {
    const wasBookmarked = bookmarks.some(b => b.id === post.id);
    toggle(post);
    
    // Add haptic feedback
    Vibration.vibrate(50);
    
    // Show success message for new bookmarks
    if (!wasBookmarked) {
      Alert.alert(
        "✅ Bookmarked!",
        "Article saved to your bookmarks",
        [{ text: "OK", style: "default" }],
        { cancelable: true }
      );
    }
  }, [toggle, bookmarks]);

  const isBookmarked = useCallback((post: Post) => bookmarks.some(b => b.id === post.id), [bookmarks]);

  const handleShare = useCallback(async (post: Post) => {
    try {
      const result = await Share.share({
        message: `${post.title.rendered}\n\n${post.excerpt.rendered.replace(/<[^>]*>/g, '')}`,
        title: post.title.rendered,
      });
      if (result.action === Share.sharedAction) {
        Vibration.vibrate(50);
      }
    } catch (error) {
      Alert.alert("Error", "Unable to share article");
    }
  }, []);

  // Start animations on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderPost = useCallback(({ item }: { item: Post }) => (
    <PostCard 
      post={item} 
      onPress={onPress}
      onBookmark={handleBookmark}
      onShare={handleShare}
      isBookmarked={isBookmarked(item)}
    />
  ), [onPress, handleBookmark, handleShare, isBookmarked]);

  const keyExtractor = useCallback((item: Post) => item.id.toString(), []);

  if (error) {
    return (
      <View className="flex-1 bg-white dark:bg-[#0f0f0f] justify-center items-center p-4">
        <Ionicons name="wifi-outline" size={64} color="#ef4444" />
        <Text className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2">
          Connection Error
        </Text>
        <Text className="text-slate-600 dark:text-slate-400 text-center mb-2">
          {error}
        </Text>
        <Text className="text-slate-500 dark:text-slate-500 text-center mb-6 text-sm">
          Make sure you're connected to the internet and try again
        </Text>
        <TouchableOpacity
          onPress={refresh}
          className="bg-red-600 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-[#0f0f0f] p-4">
        <View className="mb-6">
          <View className="h-12 bg-gray-200 dark:bg-slate-700 rounded-xl mb-4">
            <Shimmer style={{ height: 48 }} />
          </View>
        </View>
        {[1, 2, 3, 4].map(i => (
          <View key={i} className="mb-4 rounded-2xl overflow-hidden bg-white dark:bg-[#1f1f1f]">
            <View style={{ height: 192 }} className="bg-gray-200 dark:bg-[#272727]">
              <Shimmer style={{ height: 192 }} />
            </View>
            <View className="p-4">
              <View style={{ height: 24, width: "70%" }} className="bg-gray-200 dark:bg-slate-700 mb-2 rounded">
                <Shimmer style={{ height: 24, width: "70%" }} />
              </View>
              <View style={{ height: 16, width: "40%" }} className="bg-gray-200 dark:bg-slate-700 rounded">
                <Shimmer style={{ height: 16, width: "40%" }} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-[#0f0f0f]">
      {/* Modern Header */}
      <Animated.View 
        className="px-4 pb-4"
        style={{ 
          paddingTop: insets.top + 20,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        {/* Logo and Title */}
        <View className="flex-col justify-start mb-6">
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }]
            }}
          >
            <Image 
              source={require('../../assets/logo.png')} 
              className="w-20 h-16"
              resizeMode="contain"
            />
          </Animated.View>
          <View className="">
            <Text className="text-slate-600 dark:text-slate-400 text-sm">
              Latest news, reviews & updates
            </Text>
          </View>
        </View>
        
        {/* Modern Search Bar */}
        <View className="flex-row items-center bg-gray-50 dark:bg-[#181818] rounded-3xl px-4 py-1 mb-6 border border-gray-200 dark:border-gray-800">
          <Ionicons name="search-outline" size={22} color="#e61d1d" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search articles..."
            placeholderTextColor="#64748b"
            className="flex-1 ml-3 text-slate-900 dark:text-slate-100 text-base"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} className="ml-2">
              <Ionicons name="close-circle" size={22} color="#e61d1d" />
            </TouchableOpacity>
          )}
        </View>

        {/* Modern Categories Section */}
        <View className="mb-0">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Categories
            </Text>
            {selectedCategory && (
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                className="bg-red-100 dark:bg-red-900/20 px-4 py-2 rounded-full"
              >
                <Text className="text-sm text-red-600 dark:text-red-400 font-semibold">
                  Clear Filter
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {selectedCategory && (
            <View className="mb-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800">
              <Text className="text-sm text-red-600 dark:text-red-400 font-medium">
                Showing articles from: <Text className="font-bold">{selectedCategoryName}</Text>
              </Text>
            </View>
          )}
          
          <FlatList
            horizontal
            data={[{ id: 0, name: "All", icon: "grid-outline" }, ...categories.map((cat, index) => ({
              ...cat,
              icon: ["film-outline", "star-outline", "heart-outline", "flash-outline", "trophy-outline", "musical-notes-outline"][index % 6]
            }))]}
            keyExtractor={(c: any) => c.id?.toString() ?? c.name}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4 }}
            renderItem={({ item, index }) => {
              const isSelected = selectedCategory === item.id;

              return (
                <TouchableOpacity
                  onPress={() => setSelectedCategory(item.id === 0 ? null : item.id)}
                  className={`mr-3 items-center  ${
                    isSelected 
                      ? "" 
                      : "bg-white dark:bg-[#181818]"
                  } rounded-2xl p-4 px-0 ${
                    isSelected 
                      ? "" 
                      : ""
                  }`}
                  style={{
                    shadowColor: isSelected ? '#e61d1d' : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    // shadowOpacity: isSelected ? 0.3 : 0.1,
                    // shadowRadius: 8,
                    // elevation: isSelected ? 8 : 2,
                  }}
                >
                  <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-3 ${
                    isSelected 
                      ? "bg-red-500" 
                      : "bg-red-50 dark:bg-red-900/20"
                  }`}>
                    <Ionicons 
                      name={item.icon as any} 
                      size={26} 
                      color={isSelected ? "white" : "#e61d1d"} 
                    />
                  </View>
                  <Text className={`text-sm font-semibold text-center ${
                    isSelected 
                      ? "text-slate-900" 
                      : "text-slate-900 dark:text-slate-200"
                  }`} numberOfLines={2}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Animated.View>

      {/* Posts List */}
      {filtered.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6 py-12">
          <Ionicons name="search-outline" size={72} color="#94a3b8" />
          <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3">
            No articles found
          </Text>
          <Text className="text-slate-600 dark:text-slate-400 text-center text-base leading-6">
            {searchQuery ? "Try adjusting your search terms" : "No articles in this category"}
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <AnimatedFlatList
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderPost}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { 
                useNativeDriver: true,
                listener: (event: any) => {
                  const scrollY = event.nativeEvent.contentOffset.y;
                  // Trigger navigation animation
                  if ((global as any).handleTabBarScroll) {
                    (global as any).handleTabBarScroll(scrollY);
                  }
                }
              }
            )}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={refresh}
                tintColor="#e61d1d"
              />
            }
            contentContainerStyle={{ 
              paddingHorizontal: 16, 
              paddingBottom: 100, // Space for floating navigation
              paddingTop: 8
            }}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={5}
            showsVerticalScrollIndicator={false}
            getItemLayout={(data, index) => ({
              length: 200,
              offset: 200 * index,
              index,
            })}
          />
        </View>
      )}
    </View>
  );
}
