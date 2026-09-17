import React from "react";
import { ScrollView, View, Text, Image, Dimensions, TouchableOpacity, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RenderHTML from "react-native-render-html";
import useBookmarks from "../hooks/useBookmarks";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Post } from "../types";

type RootStackParamList = { Detail: { post: Post } };
type Props = NativeStackScreenProps<RootStackParamList, "Detail">;

export default function Detail({ route, navigation }: Props) {
  const { post } = route.params;
  const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const contentWidth = Dimensions.get("window").width - 32;
  const { bookmarks, toggle } = useBookmarks();
  const isBookmarked = bookmarks.some(b => b.id === post.id);
  const title = post.title.rendered.replace(/(<([^>]+)>)/gi, "");

  const handleBookmark = () => {
    toggle(post);
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0f0f0f]">
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" translucent />
      
      {/* Header with back button and bookmark */}
      <View className="absolute top-12 left-4 right-4 z-10 flex-row justify-between items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-red-600/90 rounded-full p-2"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleBookmark}
          className="bg-red-600/90 rounded-full p-2"
        >
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {image && (
          <Image 
            source={{ uri: image }} 
            className="w-full h-64" 
            resizeMode="cover"
          />
        )}
        
        <View className="p-4 -mt-2 bg-white dark:bg-[#0f0f0f] rounded-t-3xl">
          <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
            {title}
          </Text>
          
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#e61d1d" />
              <Text className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                {new Date(post.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#e61d1d" />
              <Text className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                {Math.ceil(Math.random() * 5 + 3)} min read
              </Text>
            </View>
          </View>

          <View className="border-t border-gray-200 dark:border-slate-700 pt-4">
            <RenderHTML 
              contentWidth={contentWidth} 
              source={{ html: post.content.rendered }}
              tagsStyles={{
                p: { 
                  color: '#334155',
                  fontSize: 16,
                  lineHeight: 24,
                  marginBottom: 16
                },
                h1: { 
                  color: '#1e293b',
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginBottom: 16,
                  marginTop: 24
                },
                h2: { 
                  color: '#1e293b',
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginBottom: 12,
                  marginTop: 20
                },
                h3: { 
                  color: '#1e293b',
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 8,
                  marginTop: 16
                },
                a: { 
                  color: '#e61d1d',
                  textDecorationLine: 'underline'
                },
                ul: { marginBottom: 16 },
                ol: { marginBottom: 16 },
                li: { 
                  color: '#334155',
                  fontSize: 16,
                  lineHeight: 24,
                  marginBottom: 4
                }
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
