import type { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { config } from "./config";
import { fetchPlaylist } from "./youtube.service";
import type { ApiResponse, PlaylistResult } from "./types";

function buildResponse(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

export const getPlaylists: APIGatewayProxyHandler = async (event) => {
  const apiKey = event.headers?.["X-API-KEY"] ?? event.headers?.["x-api-key"] ?? "";

  if (!config.apiKey) {
    return buildResponse(500, {
      status: "error",
      message: "API_KEY nao configurada no servidor.",
      timestamp: new Date().toISOString(),
    });
  }

  if (apiKey !== config.apiKey) {
    return buildResponse(401, {
      status: "error",
      message: "X-API-KEY ausente ou invalida.",
      timestamp: new Date().toISOString(),
    });
  }

  if (!config.youtubeApiKey) {
    return buildResponse(500, {
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

  return buildResponse(200, response);
};
