import { getYouTubeApiKey } from '@/config/env';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  videoId: string;
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[];
  error?: string;
}

/**
 * Search YouTube for videos based on a query
 * Returns top 5 results
 */
export async function searchYouTubeVideos(query: string): Promise<YouTubeSearchResponse> {
  const apiKey = getYouTubeApiKey();
  
  if (!apiKey) {
    return {
      videos: [],
      error: 'YouTube API key not configured. Please add EXPO_PUBLIC_YOUTUBE_API_KEY to your .env file.',
    };
  }

  try {
    // Add "DIY tutorial" to the search query for better results
    const searchQuery = `${query} DIY tutorial upcycling`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // YouTube Data API v3 - Search endpoint
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedQuery}&type=video&maxResults=5&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch YouTube videos');
    }
    
    const data = await response.json();
    
    // Transform the response to our format
    const videos: YouTubeVideo[] = data.items.map((item: any) => ({
      id: item.id.videoId,
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));
    
    return { videos };
  } catch (error) {
    console.error('YouTube API Error:', error);
    return {
      videos: [],
      error: error instanceof Error ? error.message : 'Failed to search YouTube videos',
    };
  }
}

/**
 * Get the YouTube video URL for embedding or opening
 */
export function getYouTubeVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Get the YouTube embed URL for the video
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}
