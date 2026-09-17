import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Shimmer({ style }: { style?: any }) {
  const translateX = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const inputRange = [-1, 1];
  const outputRange = [-200, 200];
  const x = translateX.interpolate({ inputRange, outputRange });

  return (
    <View style={[styles.container, style]}>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={{ transform: [{ translateX: x }] }}>
          <LinearGradient
            colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.5)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: 200, height: "100%" }}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
});
