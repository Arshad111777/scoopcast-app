import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions, Animated, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import usePosts from "../hooks/usePosts";

export default function Categories() {
  const { categories, loading, refresh, refreshing } = usePosts();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [animatedValues] = useState(() => 
    categories.map(() => new Animated.Value(0))
  );
  const insets = useSafeAreaInsets();
  
  const screenWidth = Dimensions.get('window').width;
  const isTablet = screenWidth > 768;

  const categoryIcons = [
    'film-outline', 'star-outline', 'heart-outline', 'flash-outline', 
    'trophy-outline', 'musical-notes-outline', 'game-controller-outline', 
    'book-outline', 'camera-outline', 'pulse-outline'
  ];

  const categoryColors = [
    '#e61d1d', '#ff6b6b', '#4ecdc4', '#45b7d1', 
    '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'
  ];

  const getCategoryIcon = (index: number) => {
    return categoryIcons[index % categoryIcons.length];
  };

  const getCategoryColor = (index: number) => {
    return categoryColors[index % categoryColors.length];
  };

  const handleCategoryPress = useCallback((item: any, index: number) => {
    // Animate the selection
    Animated.spring(animatedValues[index] || new Animated.Value(0), {
      toValue: selectedCategory?.id === item.id ? 0 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    setSelectedCategory(selectedCategory?.id === item.id ? null : item);
  }, [selectedCategory, animatedValues]);

  const renderCategoryItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedCategory?.id === item.id;
    const animatedValue = animatedValues[index] || new Animated.Value(0);
    
    const scale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.95],
    });

    const rotateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '5deg'],
    });

    return (
      <Animated.View
        style={{
          transform: [{ scale }, { rotateY }],
        }}
      >
        <TouchableOpacity
          onPress={() => handleCategoryPress(item, index)}
          style={{
            marginHorizontal: isTablet ? 16 : 12,
            marginBottom: 16,
            padding: isTablet ? 24 : 20,
            borderRadius: 24,
            backgroundColor: isSelected ? '#fef2f2' : '#ffffff',
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? '#e61d1d' : '#f0f0f0',
            shadowColor: '#000',
            shadowOffset: { 
              width: 0, 
              height: isSelected ? 12 : 6 
            },
            shadowOpacity: isSelected ? 0.2 : 0.1,
            shadowRadius: isSelected ? 20 : 12,
            elevation: isSelected ? 12 : 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View 
              style={{
                width: isTablet ? 72 : 64,
                height: isTablet ? 72 : 64,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: getCategoryColor(index) + '15',
                marginRight: 16,
                shadowColor: getCategoryColor(index),
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons 
                name={getCategoryIcon(index) as any} 
                size={isTablet ? 32 : 28} 
                color={getCategoryColor(index)} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: isTablet ? 22 : 18,
                fontWeight: 'bold',
                color: isSelected ? '#e61d1d' : '#1f2937',
                marginBottom: 4,
              }}>
                {item.name}
              </Text>
              <Text style={{
                fontSize: isTablet ? 16 : 14,
                color: '#6b7280',
                marginBottom: 4,
              }}>
                {item.count || 0} articles
              </Text>
              {isSelected && (
                <Text style={{
                  fontSize: isTablet ? 14 : 12,
                  color: '#e61d1d',
                  fontWeight: '600',
                }}>
                  ✓ Selected
                </Text>
              )}
            </View>
            <View style={{ alignItems: 'center' }}>
              <Ionicons 
                name={isSelected ? "checkmark-circle" : "add-circle-outline"} 
                size={isTablet ? 28 : 24} 
                color={isSelected ? "#e61d1d" : "#9ca3af"} 
              />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [selectedCategory, animatedValues, isTablet, handleCategoryPress]);

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#ffffff',
        padding: isTablet ? 24 : 16 
      }}>
        <View style={{ marginBottom: 24 }}>
          <View style={{
            height: isTablet ? 32 : 28,
            backgroundColor: '#f3f4f6',
            borderRadius: 12,
            marginBottom: 16,
          }} />
        </View>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <View key={i} style={{
            marginBottom: 16,
            padding: isTablet ? 24 : 20,
            backgroundColor: '#ffffff',
            borderRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <View style={{
              height: isTablet ? 24 : 20,
              backgroundColor: '#f3f4f6',
              borderRadius: 8,
              marginBottom: 8,
            }} />
            <View style={{
              height: isTablet ? 16 : 14,
              backgroundColor: '#f3f4f6',
              borderRadius: 6,
              width: '75%',
            }} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#ffffff',
    }}>
      <View style={{
        paddingHorizontal: isTablet ? 24 : 16,
        paddingTop: insets.top + (isTablet ? 24 : 16),
        paddingBottom: isTablet ? 16 : 12,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={{ width: isTablet ? 48 : 40, height: isTablet ? 48 : 40, marginRight: 12 }}
            resizeMode="contain"
          />
          <View>
            <Text style={{
              fontSize: isTablet ? 36 : 28,
              fontWeight: 'bold',
              color: '#1f2937',
            }}>
              Categories
            </Text>
            <Text style={{
              fontSize: isTablet ? 18 : 16,
              color: '#6b7280',
            }}>
              Explore articles by category
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategoryItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refresh}
            tintColor="#e61d1d"
          />
        }
        contentContainerStyle={{ 
          paddingBottom: isTablet ? 32 : 24,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={8}
      />
    </View>
  );
}
