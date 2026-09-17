import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Post } from "../types";

const KEY = "@scoopcast_bookmarks_v1";

export default function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Post[]>([]);

  const load = useCallback(async () => {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) setBookmarks(JSON.parse(raw));
  }, []);

  useEffect(() => {
    load();
  }, []);

  const toggle = async (post: Post) => {
    const exists = bookmarks.find(b => b.id === post.id);
    let next;
    if (exists) next = bookmarks.filter(b => b.id !== post.id);
    else next = [post, ...bookmarks];
    setBookmarks(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  };

  return { bookmarks, toggle, reload: load };
}
