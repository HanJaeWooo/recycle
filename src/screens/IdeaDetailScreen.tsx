import { View, Text, StyleSheet, Image, Platform, Linking, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
let WebViewCmp: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WebViewCmp = require('react-native-webview').WebView;
} catch {}
import { colors, radii } from '@/utils/theme';
import { getIdeasForMaterial } from '@/services/ideas';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { images } from '@/assets/images';

export default function IdeaDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'IdeaDetail'>>();
  const id = route.params.id;
  const item = getIdeasForMaterial('all').find((i) => i.id === id);
  if (!item) return null;
  const toImageSource = () => {
    if (item.image?.startsWith('local:project:')) {
      const key = item.image.split(':').pop() as keyof typeof images.projectIdeas;
      return images.projectIdeas[key] as any;
    }
    return item.image ? ({ uri: item.image } as any) : undefined;
  };
  const preferSearch = !item.video || isPlaceholderVideo(item.video);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(preferSearch ? null : toEmbedUrl(item.video));
  const [primaryVideoId, setPrimaryVideoId] = useState<string | null>(preferSearch ? null : getEmbedId(item.video));
  const [webviewError, setWebviewError] = useState(false);
  const [queryUsed, setQueryUsed] = useState<string | null>(null);
  useEffect(() => {
    if (!preferSearch || resolvedUrl) return;
    const q = `${item.title} tutorial recycling upcycling`;
    setQueryUsed(q);
    const key = (process.env.EXPO_PUBLIC_YT_API_KEY as string | undefined) || '';
    if (key) {
      // Step 1: get top 5 search results (video IDs only)
      fetch(`https://www.googleapis.com/youtube/v3/search?part=id&type=video&maxResults=5&q=${encodeURIComponent(q)}&key=${key}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r)))
        .then(async (json) => {
          const ids: string[] = (json?.items ?? [])
            .map((it: any) => it?.id?.videoId)
            .filter(Boolean);
          if (!ids.length) throw new Error('no_results');
          // Step 2: filter by embeddable flag
          const vidsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status&id=${ids.join(',')}&key=${key}`);
          if (!vidsRes.ok) throw new Error('videos_fetch_failed');
          const vidsJson = await vidsRes.json();
          const embeddable: string[] = (vidsJson?.items ?? [])
            .filter((v: any) => v?.status?.embeddable === true)
            .map((v: any) => v?.id)
            .filter(Boolean);
          if (embeddable.length) {
            const [first, ...rest] = embeddable;
            setResolvedUrl(buildEmbedUrl(first, rest));
            setPrimaryVideoId(first);
          } else {
            // Fallback to a search-embed playlist
            setResolvedUrl(`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}&rel=0&modestbranding=1&playsinline=1`);
          }
        })
        .catch(() =>
          setResolvedUrl(
            `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}&rel=0&modestbranding=1&playsinline=1`
          )
        );
    } else {
      setResolvedUrl(`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}&rel=0&modestbranding=1&playsinline=1`);
    }
  }, [item.title, resolvedUrl, preferSearch]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>STEPS TO BUILD THE PROJECT</Text>
      <Text style={styles.sub}>Materials Needed:</Text>
      {item.steps?.map((s, i) => (
        <Text key={i}>• {s}</Text>
      ))}
      <Text style={[styles.sub, { marginTop: 14 }]}>Video Tutorial</Text>
      {resolvedUrl ? (
        <View style={styles.videoBox}>
          {Platform.OS === 'web' ? (
            // @ts-ignore - iframe is valid on web
            <iframe
              src={resolvedUrl}
              style={{ width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : WebViewCmp && primaryVideoId ? (
            <WebViewCmp
              source={{ uri: `https://www.youtube.com/embed/${primaryVideoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1` }}
              allowsFullscreenVideo
              javaScriptEnabled
              domStorageEnabled
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback
              onError={() => setWebviewError(true)}
              onHttpError={() => setWebviewError(true)}
              style={{ backgroundColor: 'black' }}
            />
          ) : WebViewCmp ? (
            <WebViewCmp source={{ uri: resolvedUrl }} allowsFullscreenVideo style={{ backgroundColor: 'black' }} />
          ) : null}
        </View>
      ) : null}
      {Platform.OS !== 'web' && primaryVideoId ? (
        <Pressable onPress={() => openYoutube(primaryVideoId)} style={styles.openBtn}>
          <Text style={styles.openBtnText}>Open in YouTube app</Text>
        </Pressable>
      ) : null}
      {queryUsed ? (
        <Text style={styles.note} onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(queryUsed!)}`)}>
          Tutorial powered by YouTube search: "{queryUsed}" (tap to open results)
        </Text>
      ) : null}
      {toImageSource() ? (
        <View style={styles.detailImageWrap}>
          <Image source={toImageSource()} style={styles.detailImage} resizeMode="contain" />
        </View>
      ) : null}
    </View>
  );
}

function toEmbedUrl(url?: string) {
  if (!url) return null;
  // Convert common YouTube formats to embed
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = u.pathname.split('/');
      const idx = parts.findIndex((p) => p === 'shorts' || p === 'embed');
      if (idx >= 0 && parts[idx + 1]) return `https://www.youtube.com/embed/${parts[idx + 1]}`;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace('/', '');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {}
  return url;
}

function getEmbedId(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return id;
      const parts = u.pathname.split('/');
      const idx = parts.findIndex((p) => p === 'shorts' || p === 'embed');
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace('/', '');
      if (id) return id;
    }
  } catch {}
  return null;
}

function isPlaceholderVideo(url?: string | null) {
  if (!url) return true;
  const lower = url.toLowerCase();
  return lower.includes('dqw4w9wgxcq') || lower.includes('rick') || lower.includes('astley');
}

function buildEmbedUrl(firstId: string, restIds?: string[]) {
  let url = `https://www.youtube.com/embed/${firstId}?rel=0&modestbranding=1&playsinline=1`;
  if (restIds && restIds.length) {
    url += `&playlist=${restIds.join(',')}`;
  }
  return url;
}

async function openYoutube(videoId: string) {
  const appUrl = `vnd.youtube://${videoId}`;
  const webUrl = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const supported = await Linking.canOpenURL(appUrl);
    if (supported) await Linking.openURL(appUrl);
    else await Linking.openURL(webUrl);
  } catch {
    await Linking.openURL(webUrl);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 14 },
  title: { fontWeight: '800', marginBottom: 10 },
  sub: { fontWeight: '700', marginTop: 6 },
  videoBox: { width: '100%', maxWidth: 720, alignSelf: 'center', aspectRatio: 16/9, borderRadius: radii.l, overflow: 'hidden', backgroundColor: '#000', marginTop: 10 },
  note: { textAlign: 'center', color: '#6b7280', marginTop: 6 },
  detailImageWrap: { width: '100%', maxWidth: 720, alignSelf: 'center', aspectRatio: 16/9, borderRadius: radii.l, overflow: 'hidden', backgroundColor: '#0f0f0f', marginTop: 10, alignItems: 'center', justifyContent: 'center' },
  detailImage: { width: '100%', height: '100%' },
  openBtn: { marginTop: 8, alignSelf: 'center', backgroundColor: '#111827', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  openBtnText: { color: 'white', fontWeight: '700' },
});


