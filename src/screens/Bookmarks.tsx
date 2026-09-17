import React, { useEffect, useState } from "react";
import { View, FlatList, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useBookmarks from "../hooks/useBookmarks";
import PostCard from "../components/PostCard";
import { Post } from "../types";

export default function Bookmarks() {
  const { bookmarks, toggle } = useBookmarks();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const onPress = (post: Post) => {
    navigation.navigate("Detail" as never, { post } as never);
  };

  const handleBookmark = (post: Post) => {
    toggle(post);
  };

  const isBookmarked = (post: Post) => bookmarks.some(b => b.id === post.id);

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
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-white dark:bg-[#0f0f0f]">
      {/* Header */}
      <Animated.View 
        className="px-4 pb-2" 
        style={{ 
          paddingTop: insets.top + 16,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Bookmarks
        </Text>
        <Text className="text-slate-600 dark:text-slate-400 mb-4">
          {bookmarks.length} saved article{bookmarks.length !== 1 ? 's' : ''}
        </Text>
      </Animated.View>

      {bookmarks.length === 0 ? (
        <Animated.View 
          className="flex-1 justify-center items-center px-4"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: fadeAnim }]
          }}
        >
          <Ionicons name="bookmark-outline" size={64} color="#e61d1d" />
          <Text className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4 mb-2">
            No articles saved yet
          </Text>
          <Text className="text-slate-600 dark:text-slate-400 text-center mb-6">
            Save articles you want to read later
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Home" as never)}
            className="bg-red-600 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Browse Articles</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={bookmarks}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <PostCard 
                post={item} 
                onPress={onPress}
                onBookmark={handleBookmark}
                isBookmarked={isBookmarked(item)}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          />
        </Animated.View>
      )}
    </View>
  );
}
