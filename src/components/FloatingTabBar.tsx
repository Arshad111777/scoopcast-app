import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();
  
  // Animation for hide/show
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);
  const isVisible = useRef(true);

  // Listen to scroll events from Home screen
  useEffect(() => {
    const handleScroll = (scrollY: number) => {
      const scrollDelta = scrollY - lastScrollY.current;
      const threshold = 10; // Minimum scroll distance to trigger animation
      
      if (Math.abs(scrollDelta) > threshold) {
        if (scrollDelta > 0 && isVisible.current) {
          // Scrolling down - hide navigation
          isVisible.current = false;
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 100,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        } else if (scrollDelta < 0 && !isVisible.current) {
          // Scrolling up - show navigation
          isVisible.current = true;
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }
      
      lastScrollY.current = scrollY;
    };

    // Expose the handler globally so Home screen can call it
    (global as any).handleTabBarScroll = handleScroll;
  }, []);

  return (
    <Animated.View 
      className="absolute left-6 right-6" 
      style={{ 
        bottom: insets.bottom + 5,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View 
        className="flex-row justify-around items-center rounded-3xl px-0 py-2"
        style={{
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 12,
          },
          shadowOpacity: isDark ? 0.4 : 0.2,
          shadowRadius: 20,
          elevation: 20,
          borderWidth: 1,
          borderColor: isDark ? '#333333' : '#f0f0f0',
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = isFocused ? 'home' : 'home-outline';
          } else if (route.name === 'Movie Poll') {
            iconName = isFocused ? 'film' : 'film-outline';
          } else if (route.name === 'Bookmarks') {
            iconName = isFocused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Profile') {
            iconName = isFocused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center justify-center py-1"
            >
              <View className="items-center">
                <View className={`w-12 h-10 rounded-2xl items-center justify-center mb-1 ${
                  isFocused ? 'bg-red-600 rounded-3xl' : 'bg-transparent'
                }`}>
                  <Ionicons
                    name={iconName}
                    size={22}
                    color={isFocused ? '#ffffff' : (isDark ? '#64748b' : '#94a3b8')}
                  />
                </View>
                <Text
                  className="text-xs font-semibold"
                  style={{
                    color: isFocused ? '#e61d1d' : (isDark ? '#64748b' : '#94a3b8'),
                  }}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}
