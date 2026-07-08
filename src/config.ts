import dotenv from "dotenv";
dotenv.config();

export const config = {
  apiKey: process.env.API_KEY ?? "",
  youtubeApiKey: process.env.YOUTUBE_API_KEY ?? "",
  playlists: [
    "PLTLinV8qAfvpUkHkimZEnm7RBkTkXHDeK",
    "PLTLinV8qAfvoCnUjAnVyN4JGU2zve-Svc",
    "PLTLinV8qAfvogi5n2WgZhMRb6uB1Ptcxt",
  ],
};
