import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Modal } from "react-native";
import { BlurView } from 'expo-blur';
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Movie, CastMember } from "../types/movie";
import { fetchMovieTrailer, fetchSimilar, fetchCredits, fetchWatchProviders } from "../api/movieApi";
// import ImageColors from 'react-native-image-colors';

type RootStackParamList = {
  MovieDetail: { movie: Movie };
};

type Props = NativeStackScreenProps<RootStackParamList, "MovieDetail">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = Math.round((SCREEN_WIDTH * 9) / 16);
const FS_PLAYER_HEIGHT = HERO_HEIGHT; // keep 16:9 in full-screen modal and center

export default function MovieDetail({ route, navigation }: Props) {
  const { movie } = route.params;
  const [trailerVideoId, setTrailerVideoId] = useState<string>("");
  const [loadingTrailer, setLoadingTrailer] = useState<boolean>(false);
  const playAnim = useRef(new Animated.Value(0)).current; // for subtle button press feedback
  const [fullScreenTrailerVisible, setFullScreenTrailerVisible] = useState<boolean>(false);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [themeColor, setThemeColor] = useState<string>('#e61d1d');
  const [providers, setProviders] = useState<any>(null);

  const releaseDateLabel = useMemo(() => {
    try {
      return new Date(movie.releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return movie.releaseDate;
    }
  }, [movie.releaseDate]);

  useEffect(() => {
    let mounted = true;
    setLoadingTrailer(true);
    fetchMovieTrailer(movie.id)
      .then((url) => {
        if (!mounted) return;
        if (url) {
          const id = url.split("v=")[1]?.split("&")[0];
          if (id) setTrailerVideoId(id);
        }
      })
      .finally(() => mounted && setLoadingTrailer(false));
    return () => {
      mounted = false;
    };
  }, [movie.id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [sim, credits, prov] = await Promise.all([
          fetchSimilar(movie.id, 1),
          fetchCredits(movie.id),
          fetchWatchProviders(movie.id),
        ]);
        if (!mounted) return;
        setSimilar(sim.results || []);
        setCast(credits.cast || []);
        setProviders(prov || null);
      } catch (e) {
        // no-op
      }
    })();
    return () => {
      mounted = false;
    };
  }, [movie.id]);

  // Extract dynamic theme color from poster/backdrop
  // useEffect(() => {
  //   let active = true;
  //   const src = movie.backdropUrl || movie.posterUrl;
  //   if (!src) return;
  //   ImageColors.getColors(src, { fallback: '#e61d1d' })
  //     .then((result: any) => {
  //       if (!active) return;
  //       const c = result.vibrant || result.dominant || result.primary || '#e61d1d';
  //       setThemeColor(c);
  //     })
  //     .catch(() => {})
  //   return () => { active = false; };
  // }, [movie.backdropUrl, movie.posterUrl]);

  return (
    <View className="flex-1 bg-white dark:bg-[#0f0f0f]">
      {/* Header */}
      <View className="absolute top-12 left-4 right-4 z-10 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-red-600/90 rounded-full p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero: trailer thumbnail; tap opens full-screen trailer with blur scrim */}
        <View className="w-full" style={{ height: HERO_HEIGHT }}>
          {loadingTrailer ? (
            <View className="w-full h-full items-center justify-center" style={{ backgroundColor: "#000" }}>
              <ActivityIndicator size="large" color="#e61d1d" />
              <Text className="text-white mt-3">Loading trailer…</Text>
            </View>
          ) : trailerVideoId ? (
            <>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  Animated.sequence([
                    Animated.timing(playAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
                    Animated.timing(playAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
                  ]).start(() => setFullScreenTrailerVisible(true));
                }}
                style={{ width: SCREEN_WIDTH, height: HERO_HEIGHT }}
              >
                <Image
                  source={{ uri: movie.backdropUrl || movie.posterUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                {/* Blur scrim */}
                <BlurView intensity={20} tint="dark" style={{ position: 'absolute', inset: 0 }} />
                {/* Play button */}
                <View className="absolute inset-0 items-center justify-center">
                  <Animated.View
                    style={{
                      transform: [{ scale: playAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] }) }],
                    }}
                  >
                    <View className="bg-white/95 rounded-full" style={{ width: 68, height: 68, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="play" size={30} color="#e61d1d" />
                    </View>
                  </Animated.View>
                  <Text className="text-white mt-3 text-base font-semibold">Play Trailer</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <Image
              source={{ uri: movie.backdropUrl || movie.posterUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          )}
        </View>

        {/* Content card */}
        <View className="-mt-4 rounded-t-3xl bg-white dark:bg-[#0f0f0f] p-4">
          <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2" numberOfLines={2}>
            {movie.title}
          </Text>

          {/* Meta row */}
          <View className="flex-row items-center mb-3">
            <View className="flex-row items-center mr-4">
              <Ionicons name="star" size={18} color="#fbbf24" />
              <View className="px-2 py-0.5 rounded-md ml-1" style={{ backgroundColor: themeColor + '20' }}>
                <Text className="font-semibold" style={{ color: themeColor }}>
                  {movie.rating && movie.rating > 0 ? Number(movie.rating).toFixed(1) : 'N/A'}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={18} color="#e61d1d" />
              <Text className="text-slate-600 dark:text-slate-400 ml-2">{releaseDateLabel}</Text>
            </View>
          </View>

          {/* Genres */}
          {movie.genre?.length > 0 && (
            <View className="flex-row flex-wrap mb-4">
              {movie.genre.map((g, idx) => (
                <View key={`${g}-${idx}`} className="bg-red-100 dark:bg-red-900/20 px-3 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-xs text-red-600 dark:text-red-400 font-semibold">{g}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Overview */}
          {!!movie.overview && (
            <View className="mt-2">
              <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Overview</Text>
              <Text className="text-slate-700 dark:text-slate-300 leading-6">{movie.overview}</Text>
            </View>
          )}

          {/* Cast & Crew strip */}
          {cast.length > 0 && (
            <View className="mt-6">
              <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Top Billed Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cast.map((c) => (
                  <View key={c.id} className="mr-4 items-center" style={{ width: 88 }}>
                    <View className="rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800" style={{ width: 88, height: 120 }}>
                      {c.profileUrl ? (
                        <Image source={{ uri: c.profileUrl }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Ionicons name="person" size={28} color="#9ca3af" />
                        </View>
                      )}
                    </View>
                    <Text className="text-slate-900 dark:text-slate-200 mt-2 text-xs font-semibold" numberOfLines={1}>{c.name}</Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-xs" numberOfLines={1}>{c.character}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Similar movies rail */}
          {similar.length > 0 && (
            <View className="mt-6">
              <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Similar Movies</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {similar.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    className="mr-4"
                    onPress={() => navigation.replace('MovieDetail', { movie: m })}
                    activeOpacity={0.85}
                  >
                    <View className="rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800" style={{ width: 120, height: 180 }}>
                      <Image source={{ uri: m.posterUrl }} className="w-full h-full" resizeMode="cover" />
                    </View>
                    <Text className="text-slate-900 dark:text-slate-200 mt-2 text-xs font-semibold" numberOfLines={2} style={{ width: 120 }}>{m.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Where to Watch */}
          {providers && (providers.IN || providers.US) && (
            <View className="mt-6">
              <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Where to watch</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['IN','US'].map((code) => {
                  const p = providers[code];
                  if (!p) return null;
                  const list = p.flatrate || p.rent || p.buy || [];
                  return list.map((prov: any) => (
                    <View key={`${code}-${prov.provider_id}`} className="mr-4 items-center">
                      <View className="rounded-xl overflow-hidden" style={{ width: 56, height: 56, backgroundColor: themeColor + '22' }}>
                        {prov.logo_path ? (
                          <Image source={{ uri: `https://image.tmdb.org/t/p/w92${prov.logo_path}` }} className="w-full h-full" resizeMode="cover" />
                        ) : null}
                      </View>
                      <Text className="text-slate-700 dark:text-slate-300 text-[10px] mt-1" numberOfLines={1} style={{ width: 64 }}>{prov.provider_name}</Text>
                    </View>
                  ));
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Full-screen Trailer Modal */}
      <Modal
        visible={fullScreenTrailerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setFullScreenTrailerVisible(false)}
      >
        <View className="flex-1 bg-black/100 justify-center items-center">
          {/* Close */}
          <TouchableOpacity
            onPress={() => setFullScreenTrailerVisible(false)}
            className="absolute top-12 right-4 z-10 bg-red-600 rounded-full w-10 h-10 items-center justify-center"
          >
            <Ionicons name="close" size={26} color="white" />
          </TouchableOpacity>
          <View style={{ width: SCREEN_WIDTH, height: FS_PLAYER_HEIGHT }}>
            <YoutubePlayer
              height={FS_PLAYER_HEIGHT}
              width={SCREEN_WIDTH}
              videoId={trailerVideoId}
              play={true}
              forceAndroidAutoplay={true}
              initialPlayerParams={{ controls: true }}
              onChangeState={(e: string) => {
                if (e === 'ended') setFullScreenTrailerVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}


