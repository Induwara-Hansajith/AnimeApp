import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimeCard from "@/components/AnimeCard";
import { getTopAnime, getCurrentSeason } from "@/services/api";
import { 
  TrendingUp, 
  Calendar, 
  Search, 
  BookOpen, 
  Sparkles,
  ArrowRight
} from "lucide-react";

const HomePage = () => {
  const [topAnime, setTopAnime] = useState([]);
  const [currentSeasonAnime, setCurrentSeasonAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Fetch top anime and current season in parallel
        const [topResult, seasonalResult] = await Promise.all([
          getTopAnime(null, 1),
          getCurrentSeason()
        ]);

        setTopAnime(topResult?.data?.slice(0, 12) || []);
        setCurrentSeasonAnime(seasonalResult?.data?.slice(0, 12) || []);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const features = [
    {
      icon: Search,
      title: "Discover Anime",
      description: "Search through thousands of anime titles with advanced filters",
      link: "/search",
      color: "bg-blue-500"
    },
    {
      icon: BookOpen,
      title: "Track Progress",
      description: "Keep track of what you're watching and your progress",
      link: "/watchlist",
      color: "bg-green-500"
    },
    {
      icon: Calendar,
      title: "Seasonal Updates",
      description: "Stay updated with the latest seasonal anime releases",
      link: "/seasonal",
      color: "bg-purple-500"
    },
    {
      icon: TrendingUp,
      title: "Your Stats",
      description: "View your anime watching statistics and preferences",
      link: "/stats",
      color: "bg-orange-500"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AnimeTracker</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Discover, track, and explore your favorite anime series. Stay up to date with the latest releases and manage your personal watchlist.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/search">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Search className="w-5 h-5 mr-2" />
              Start Exploring
            </Button>
          </Link>
          <Link to="/seasonal">
            <Button variant="outline" size="lg" className="text-white border-slate-600 hover:bg-slate-800">
              <Calendar className="w-5 h-5 mr-2" />
              Current Season
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} to={feature.link}>
              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                  <ArrowRight className="w-4 h-4 text-purple-400 mx-auto mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Top Anime Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Top Rated Anime</h2>
            <p className="text-slate-400">Highest rated anime of all time</p>
          </div>
          <Link to="/search?sort=score">
            <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-800">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {topAnime.map((anime) => (
            <AnimeCard key={anime.mal_id} anime={anime} />
          ))}
        </div>
      </div>

      {/* Current Season Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">This Season</h2>
            <p className="text-slate-400">Currently airing anime</p>
          </div>
          <Link to="/seasonal">
            <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-800">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {currentSeasonAnime.map((anime) => (
            <AnimeCard key={anime.mal_id} anime={anime} />
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Tracking?</h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Create your personal anime watchlist, track your progress, and discover new series based on your preferences.
          </p>
          <Link to="/watchlist">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <BookOpen className="w-5 h-5 mr-2" />
              Create Your Watchlist
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;