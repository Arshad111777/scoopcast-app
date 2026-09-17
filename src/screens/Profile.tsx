import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useBookmarks from "../hooks/useBookmarks";
import { useTheme } from "../context/ThemeContext";

export default function Profile() {
  const { bookmarks } = useBookmarks();
  const { theme, themeMode, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [showThemeModal, setShowThemeModal] = useState(false);

  const menuItems = [
    {
      icon: "bookmark-outline",
      title: "My Bookmarks",
      subtitle: `${bookmarks.length} saved articles`,
      onPress: () => Alert.alert("Bookmarks", "Navigate to bookmarks tab")
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      subtitle: "Manage your notifications",
      onPress: () => Alert.alert("Notifications", "Feature coming soon")
    },
    {
      icon: "settings-outline",
      title: "Settings",
      subtitle: "App preferences and options",
      onPress: () => Alert.alert("Settings", "Feature coming soon")
    },
    {
      icon: "color-palette-outline",
      title: "Appearance",
      subtitle: `Current: ${themeMode === "system" ? "System" : theme === "dark" ? "Dark" : "Light"}`,
      onPress: () => setShowThemeModal(true)
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      onPress: () => Alert.alert("Help", "Feature coming soon")
    },
    {
      icon: "information-circle-outline",
      title: "About",
      subtitle: "App version and information",
      onPress: () => Alert.alert("About", "ScoopCast v1.0.0\nA modern news reader app")
    }
  ];

  return (
    <ScrollView className="flex-1 bg-white dark:bg-[#0f0f0f]">
      {/* Header */}
      <View className="px-4 pb-6" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Profile
        </Text>
        <Text className="text-slate-600 dark:text-slate-400">
          Your news preferences & stats
        </Text>
      </View>

      {/* User Info Card */}
      <View className="mx-4 mb-6 p-6 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl">
        <View className="flex-row items-center">
          <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mr-4">
            <Ionicons name="newspaper" size={32} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-white mb-1">
              Welcome to ScoopCast
            </Text>
            <Text className="text-white/80">
              Your ultimate news destination
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="mx-4 mb-6">
        <View className="flex-row justify-between">
          <View className="flex-1 bg-white dark:bg-[#1f1f1f] p-4 rounded-xl mr-2">
            <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {bookmarks.length}
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400">
              Bookmarks
            </Text>
          </View>
          <View className="flex-1 bg-white dark:bg-[#1f1f1f] p-4 rounded-xl ml-2">
            <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              0
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400">
              Articles Read Today
            </Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View className="px-4">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            className="flex-row items-center p-4 bg-white dark:bg-[#1f1f1f] rounded-xl mb-3"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full items-center justify-center mr-4">
              <Ionicons name={item.icon as any} size={20} color="#e61d1d" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {item.title}
              </Text>
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                {item.subtitle}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </TouchableOpacity>
        ))}
      </View>

      {/* App Info */}
      <View className="mx-4 mt-6 mb-8 p-4 bg-slate-50 dark:bg-[#181818] rounded-xl">
        <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
          ScoopCast v1.0.0
        </Text>
        <Text className="text-center text-xs text-slate-400 dark:text-slate-500 mt-1">
          Made with ❤️ for news enthusiasts
        </Text>
      </View>

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white dark:bg-[#181818] rounded-3xl w-full max-w-sm overflow-hidden">
            <View className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Choose Appearance
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 mt-1">
                Select your preferred theme
              </Text>
            </View>

            <View className="p-4">
              {[
                { mode: "light" as const, label: "Light", icon: "sunny" },
                { mode: "dark" as const, label: "Dark", icon: "moon" },
                { mode: "system" as const, label: "System", icon: "phone-portrait" },
              ].map(({ mode, label, icon }) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => {
                    setThemeMode(mode);
                    setShowThemeModal(false);
                  }}
                  className={`flex-row items-center p-4 rounded-xl mb-3 ${
                    themeMode === mode
                      ? "bg-red-100 dark:bg-red-900/20 border-2 border-red-500"
                      : "bg-gray-50 dark:bg-[#272727]"
                  }`}
                >
                  <View className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-white dark:bg-[#1f1f1f]">
                    <Ionicons 
                      name={icon as any} 
                      size={24} 
                      color={themeMode === mode ? "#e61d1d" : "#64748b"} 
                    />
                  </View>
                  <Text className={`text-lg font-semibold flex-1 ${
                    themeMode === mode 
                      ? "text-red-600 dark:text-red-400" 
                      : "text-slate-900 dark:text-slate-100"
                  }`}>
                    {label}
                  </Text>
                  {themeMode === mode && (
                    <Ionicons name="checkmark-circle" size={24} color="#e61d1d" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowThemeModal(false)}
              className="px-6 py-4 border-t border-gray-200 dark:border-gray-800"
            >
              <Text className="text-center text-red-600 dark:text-red-400 font-semibold text-lg">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
