export interface Video {
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  videoId: string;
  thumbnail: string;
  position: number;
}

export interface PlaylistSuccess {
  id: string;
  title: string;
  totalItems: number;
  status: "success";
  videos: Video[];
}

export interface PlaylistError {
  id: string;
  title: null;
  totalItems: 0;
  status: "error";
  error: {
    code: string;
    message: string;
  };
  videos: [];
}

export type PlaylistResult = PlaylistSuccess | PlaylistError;

export interface ApiResponse {
  status: "okay" | "partial" | "error";
  playlists: PlaylistResult[];
  timestamp: string;
}
