export type WPEmbedded = {
  "wp:featuredmedia"?: Array<{ source_url?: string }>;
  "wp:term"?: any;
};

export type Post = {
  id: number;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: WPEmbedded;
  categories?: number[];
};

// Re-export movie types for convenience
export * from './movie';
