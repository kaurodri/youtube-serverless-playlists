import type { VercelRequest, VercelResponse } from "@vercel/node";
import { config } from "../src/config";
import { fetchPlaylist } from "../src/youtube.service";
import type { ApiResponse, PlaylistResult } from "../src/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "X-API-KEY, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      status: "error",
      message: "Metodo nao permitido.",
      timestamp: new Date().toISOString(),
    });
  }

  const apiKey = (req.headers["x-api-key"] as string) ?? "";

  if (!config.apiKey) {
    return res.status(500).json({
      status: "error",
      message: "API_KEY nao configurada no servidor.",
      timestamp: new Date().toISOString(),
    });
  }

  if (apiKey !== config.apiKey) {
    return res.status(401).json({
      status: "error",
      message: "X-API-KEY ausente ou invalida.",
      timestamp: new Date().toISOString(),
    });
  }

  if (!config.youtubeApiKey) {
    return res.status(500).json({
      status: "error",
      message: "YOUTUBE_API_KEY nao configurada.",
      playlists: [],
      timestamp: new Date().toISOString(),
    });
  }

  const results: PlaylistResult[] = await Promise.all(
    config.playlists.map((id) => fetchPlaylist(id))
  );

  const successCount = results.filter((r) => r.status === "success").length;

  let status: ApiResponse["status"];
  if (successCount === results.length) {
    status = "okay";
  } else if (successCount > 0) {
    status = "partial";
  } else {
    status = "error";
  }

  const response: ApiResponse = {
    status,
    playlists: results,
    timestamp: new Date().toISOString(),
  };

  return res.status(200).json(response);
}
