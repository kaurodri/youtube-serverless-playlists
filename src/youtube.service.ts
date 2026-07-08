import { youtube, type youtube_v3 } from "@googleapis/youtube";
import { parse, toSeconds } from "iso8601-duration";
import { config } from "./config";
import type { Video, PlaylistResult } from "./types";

const client = youtube({ version: "v3", auth: config.youtubeApiKey });

function formatDuration(isoDuration: string): string {
  const totalSeconds = Math.floor(toSeconds(parse(isoDuration)));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${minutes}:${pad(seconds)}`;
}

async function getPlaylistDetails(
  playlistId: string
): Promise<youtube_v3.Schema$PlaylistSnippet> {
  const res = await client.playlists.list({
    part: ["snippet"],
    id: [playlistId],
  });

  const playlist = res.data.items?.[0];
  if (!playlist) {
    throw new Error(`Playlist '${playlistId}' not found`);
  }

  return playlist.snippet!;
}

async function getPlaylistItems(
  playlistId: string
): Promise<youtube_v3.Schema$PlaylistItem[]> {
  const items: youtube_v3.Schema$PlaylistItem[] = [];
  let pageToken: string | undefined;

  do {
    const res = await client.playlistItems.list({
      part: ["snippet", "contentDetails"],
      playlistId,
      maxResults: 50,
      pageToken,
    });

    if (res.data.items) {
      items.push(...res.data.items);
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return items;
}

async function getVideoDurations(
  videoIds: string[]
): Promise<Map<string, string>> {
  const durations = new Map<string, string>();

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const res = await client.videos.list({
      part: ["contentDetails"],
      id: batch,
    });

    for (const video of res.data.items ?? []) {
      durations.set(video.id!, video.contentDetails!.duration!);
    }
  }

  return durations;
}

export async function fetchPlaylist(playlistId: string): Promise<PlaylistResult> {
  try {
    const [details, items] = await Promise.all([
      getPlaylistDetails(playlistId),
      getPlaylistItems(playlistId),
    ]);

    const videoIds = items
      .map((item) => item.contentDetails?.videoId)
      .filter((id): id is string => !!id);

    const durations = await getVideoDurations(videoIds);

    const videos: Video[] = items.map((item) => {
      const videoId = item.contentDetails?.videoId ?? "";
      return {
        title: item.snippet?.title ?? "",
        description: item.snippet?.description ?? "",
        duration: formatDuration(durations.get(videoId) ?? "PT0S"),
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        videoId,
        thumbnail:
          item.snippet?.thumbnails?.high?.url ??
          item.snippet?.thumbnails?.default?.url ??
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        position: item.snippet?.position ?? 0,
      };
    });

    return {
      id: playlistId,
      title: details.title ?? "",
      totalItems: videos.length,
      status: "success",
      videos,
    };
  } catch (err: any) {
    const message =
      err?.response?.data?.error?.message ??
      err?.message ??
      "Erro desconhecido";

    return {
      id: playlistId,
      title: null,
      totalItems: 0,
      status: "error",
      error: {
        code: "PLAYLIST_NOT_FOUND",
        message: `A playlist com o ID '${playlistId}' nao foi encontrada ou e privada. Detalhes: ${message}`,
      },
      videos: [],
    };
  }
}
