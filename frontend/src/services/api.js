import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const apiClient = axios.create({
  baseURL: API,
  timeout: 30000,
});

// Anime API calls
export const searchAnime = async (params) => {
  const response = await apiClient.get("/anime/search", { params });
  return response.data;
};

export const getAnimeDetails = async (animeId) => {
  const response = await apiClient.get(`/anime/${animeId}`);
  return response.data;
};

export const getAnimeEpisodes = async (animeId, page = 1) => {
  const response = await apiClient.get(`/anime/${animeId}/episodes`, {
    params: { page }
  });
  return response.data;
};

export const getAnimeRecommendations = async (animeId) => {
  const response = await apiClient.get(`/anime/${animeId}/recommendations`);
  return response.data;
};

export const getSeasonalAnime = async (year, season) => {
  const response = await apiClient.get(`/seasons/${year}/${season}`);
  return response.data;
};

export const getCurrentSeason = async () => {
  const response = await apiClient.get("/seasons/current");
  return response.data;
};

export const getTopAnime = async (type = null, page = 1) => {
  const params = { page };
  if (type) params.type = type;
  
  const response = await apiClient.get("/top/anime", { params });
  return response.data;
};

export const getAnimeGenres = async () => {
  const response = await apiClient.get("/genres/anime");
  return response.data;
};

// Watchlist API calls
export const addToWatchlist = async (watchlistItem) => {
  const response = await apiClient.post("/watchlist", watchlistItem);
  return response.data;
};

export const getUserWatchlist = async (userId, status = null) => {
  const params = {};
  if (status) params.status = status;
  
  const response = await apiClient.get(`/watchlist/${userId}`, { params });
  return response.data;
};

export const updateWatchlistItem = async (itemId, updateData) => {
  const response = await apiClient.put(`/watchlist/${itemId}`, updateData);
  return response.data;
};

export const removeFromWatchlist = async (itemId) => {
  const response = await apiClient.delete(`/watchlist/${itemId}`);
  return response.data;
};

export const getUserStats = async (userId) => {
  const response = await apiClient.get(`/stats/${userId}`);
  return response.data;
};

export default apiClient;