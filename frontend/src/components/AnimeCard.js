import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Tv } from "lucide-react";

const AnimeCard = ({ anime, showAddToList = false, onAddToList }) => {
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

  return (
    <Card className="group bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 overflow-hidden">
      <Link to={`/anime/${anime.mal_id}`}>
        <div className="relative">
          <img
            src={getImageUrl(anime.images)}
            alt={anime.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Status Badge */}
          {anime.status && (
            <Badge 
              className={`absolute top-2 left-2 ${getStatusColor(anime.status)} text-white`}
            >
              {anime.status}
            </Badge>
          )}

          {/* Score Badge */}
          {anime.score && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md flex items-center space-x-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{anime.score}</span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {anime.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <div className="flex items-center space-x-1">
              <Tv className="w-4 h-4" />
              <span>{anime.type || "Unknown"}</span>
            </div>
            
            {anime.year && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{anime.year}</span>
              </div>
            )}
          </div>

          {anime.episodes && (
            <div className="text-sm text-slate-400 mb-2">
              {anime.episodes} episodes
            </div>
          )}

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {anime.genres.slice(0, 3).map((genre) => (
                <Badge 
                  key={genre.mal_id} 
                  variant="secondary" 
                  className="text-xs bg-slate-700 text-slate-300"
                >
                  {genre.name}
                </Badge>
              ))}
              {anime.genres.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                  +{anime.genres.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Synopsis Preview */}
          {anime.synopsis && (
            <p className="text-slate-400 text-sm line-clamp-2">
              {anime.synopsis}
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
};

export default AnimeCard;