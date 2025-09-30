import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/UserContext";
import { getAnimeDetails, getAnimeEpisodes, getAnimeRecommendations, addToWatchlist } from "@/services/api";
import { toast } from "sonner";
import { 
  Star, 
  Calendar, 
  Tv, 
  Clock, 
  Users, 
  Play,
  Plus,
  ExternalLink,
  Heart
} from "lucide-react";

const AnimeDetailsPage = () => {
  const { id } = useParams();
  const userId = useUser();
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);

  useEffect(() => {
    fetchAnimeData();
  }, [id]);

  const fetchAnimeData = async () => {
    try {
      setLoading(true);
      
      const [animeResponse, episodesResponse, recommendationsResponse] = await Promise.all([
        getAnimeDetails(id),
        getAnimeEpisodes(id, 1),
        getAnimeRecommendations(id)
      ]);

      setAnime(animeResponse);
      setEpisodes(episodesResponse?.data?.slice(0, 24) || []);
      setRecommendations(recommendationsResponse?.data?.slice(0, 12) || []);
    } catch (error) {
      console.error("Error fetching anime data:", error);
      toast.error("Failed to load anime details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (status = "plan_to_watch") => {
    try {
      setAddingToWatchlist(true);
      
      await addToWatchlist({
        user_id: userId,
        mal_id: anime.mal_id,
        anime_title: anime.title,
        status: status
      });
      
      toast.success(`Added "${anime.title}" to your watchlist!`);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("This anime is already in your watchlist");
      } else {
        toast.error("Failed to add to watchlist");
      }
    } finally {
      setAddingToWatchlist(false);
    }
  };

  const getImageUrl = (images) => {
    return images?.webp?.large_image_url || 
           images?.jpg?.large_image_url || 
           images?.webp?.image_url || 
           images?.jpg?.image_url ||
           "/placeholder-anime.jpg";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "airing":
        return "bg-green-500";
      case "finished airing":
        return "bg-blue-500";
      case "not yet aired":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Anime Not Found</h2>
        <Link to="/search">
          <Button>Back to Search</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <img
                src={getImageUrl(anime.images)}
                alt={anime.title}
                className="w-full rounded-lg shadow-2xl"
              />
              
              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => handleAddToWatchlist("plan_to_watch")}
                  disabled={addingToWatchlist}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {addingToWatchlist ? "Adding..." : "Add to Watchlist"}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleAddToWatchlist("watching")}
                    disabled={addingToWatchlist}
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-700"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Watching
                  </Button>
                  <Button
                    onClick={() => handleAddToWatchlist("completed")}
                    disabled={addingToWatchlist}
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-700"
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Completed
                  </Button>
                </div>

                {anime.trailer?.url && (
                  <a href={anime.trailer.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full text-white border-slate-600 hover:bg-slate-700">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Watch Trailer
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{anime.title}</h1>
              {anime.title_english && anime.title_english !== anime.title && (
                <p className="text-xl text-slate-300 mb-2">{anime.title_english}</p>
              )}
              {anime.title_japanese && (
                <p className="text-lg text-slate-400 mb-4">{anime.title_japanese}</p>
              )}

              <div className="flex flex-wrap gap-4 items-center mb-6">
                {anime.score && (
                  <div className="flex items-center space-x-2 bg-slate-800 rounded-lg px-3 py-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-semibold">{anime.score}</span>
                    <span className="text-slate-400 text-sm">({anime.scored_by?.toLocaleString()} users)</span>
                  </div>
                )}

                {anime.rank && (
                  <Badge className="bg-gold-500 text-white">
                    #{anime.rank}
                  </Badge>
                )}

                <Badge className={`${getStatusColor(anime.status)} text-white`}>
                  {anime.status}
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <Tv className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">{anime.type || "Unknown"}</div>
                  <div className="text-slate-400 text-sm">Type</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <Play className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">{anime.episodes || "?"}</div>
                  <div className="text-slate-400 text-sm">Episodes</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">{anime.duration || "Unknown"}</div>
                  <div className="text-slate-400 text-sm">Duration</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">{anime.year || "TBA"}</div>
                  <div className="text-slate-400 text-sm">Year</div>
                </CardContent>
              </Card>
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <Badge key={genre.mal_id} variant="secondary" className="bg-slate-700 text-slate-300">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Synopsis */}
            {anime.synopsis && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Synopsis</h3>
                <p className="text-slate-300 leading-relaxed">{anime.synopsis}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="details" className="data-[state=active]:bg-purple-600">Details</TabsTrigger>
          <TabsTrigger value="episodes" className="data-[state=active]:bg-purple-600">Episodes</TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-purple-600">Similar</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Additional Details */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {anime.source && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Source:</span>
                    <span className="text-white">{anime.source}</span>
                  </div>
                )}
                {anime.rating && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rating:</span>
                    <span className="text-white">{anime.rating}</span>
                  </div>
                )}
                {anime.popularity && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Popularity:</span>
                    <span className="text-white">#{anime.popularity}</span>
                  </div>
                )}
                {anime.aired?.string && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Aired:</span>
                    <span className="text-white">{anime.aired.string}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Studios */}
            {anime.studios && anime.studios.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Studios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {anime.studios.map((studio) => (
                      <Badge key={studio.mal_id} variant="outline" className="text-slate-300 border-slate-600">
                        {studio.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Background */}
          {anime.background && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Background</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">{anime.background}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="episodes">
          {episodes.length > 0 ? (
            <div className="grid gap-3">
              {episodes.map((episode) => (
                <Card key={episode.mal_id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold">
                          Episode {episode.mal_id}: {episode.title || "Untitled"}
                        </h4>
                        {episode.synopsis && (
                          <p className="text-slate-400 text-sm mt-1 line-clamp-2">{episode.synopsis}</p>
                        )}
                      </div>
                      {episode.aired && (
                        <div className="text-slate-400 text-sm">{episode.aired}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">No episode information available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendations.map((rec) => {
                const recAnime = rec.entry;
                return (
                  <Link key={recAnime.mal_id} to={`/anime/${recAnime.mal_id}`}>
                    <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 cursor-pointer">
                      <img
                        src={getImageUrl(recAnime.images)}
                        alt={recAnime.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <CardContent className="p-4">
                        <h4 className="text-white font-semibold text-sm line-clamp-2">{recAnime.title}</h4>
                        <p className="text-slate-400 text-xs mt-2">{rec.votes} recommendations</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">No recommendations available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnimeDetailsPage;