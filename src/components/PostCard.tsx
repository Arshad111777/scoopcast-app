import React, { memo, useState, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Post } from "../types";

type Props = {
  post: Post;
  onPress: (p: Post) => void;
  onBookmark?: (p: Post) => void;
  onShare?: (p: Post) => void;
  isBookmarked?: boolean;
};

const PostCard = memo(function PostCard({ post, onPress, onBookmark, onShare, isBookmarked = false }: Props) {
  const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const title = post.title.rendered.replace(/(<([^>]+)>)/gi, "");
  const excerpt = post.excerpt.rendered.replace(/(<([^>]+)>)/gi, "").substring(0, 100) + "...";
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBookmark = () => {
    if (onBookmark) {
      // Scale animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Success animation
      if (!isBookmarked) {
        setShowSuccess(true);
        Animated.sequence([
          Animated.timing(successAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(1000),
          Animated.timing(successAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowSuccess(false);
        });
      }

      onBookmark(post);
    }
  };

  return (
    <Pressable
      onPress={() => onPress(post)}
      className="mb-4 rounded-2xl bg-white dark:bg-[#1f1f1f] shadow-lg overflow-hidden active:scale-95 transition-transform"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
                {image && (
        <View className="relative">
          <Image 
            source={{ uri: image }} 
            className="h-48 w-full" 
            resizeMode="cover"
          />
          <View className="absolute top-3 right-3 flex-row gap-2">
            {onShare && (
              <TouchableOpacity
                onPress={() => onShare(post)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: '#e61d1d',
                  borderRadius: 22,
                  width: 35,
                  height: 35,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="share-social" size={20} color="white" />
              </TouchableOpacity>
            )}
            {onBookmark && (
              <Animated.View
                style={{
                  transform: [{ scale: scaleAnim }]
                }}
              >
                <TouchableOpacity
                  onPress={handleBookmark}
                  className={`rounded-full p-2 ${
                    isBookmarked 
                      ? "bg-red-600" 
                      : "bg-red-600/90"
                  }`}
                >
                  <Ionicons
                    name={isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
          
          {/* Success Animation Overlay */}
          {showSuccess && (
            <Animated.View
              className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center"
              style={{
                opacity: successAnim,
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.2],
                    }),
                  },
                ],
              }}
            >
              <View className="bg-green-500 rounded-full p-3">
                <Ionicons name="checkmark" size={24} color="white" />
              </View>
            </Animated.View>
          )}
        </View>
      )}
      <View className="p-4">
        <Text className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2" numberOfLines={2}>
          {title}
        </Text>
        <Text className="text-sm text-slate-600 dark:text-slate-400 mb-3" numberOfLines={2}>
          {excerpt}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={12} color="#e61d1d" />
            <Text className="text-xs text-slate-500 dark:text-slate-400 ml-1">
              {Math.ceil(Math.random() * 5 + 2)} min read
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

export default PostCard;
