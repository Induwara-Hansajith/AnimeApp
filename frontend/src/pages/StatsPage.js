import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/context/UserContext";
import { getUserStats, getUserWatchlist } from "@/services/api";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Star, 
  Play,
  Check,
  BookOpen,
  Pause,
  X,
  Calendar,
  Trophy,
  Target
} from "lucide-react";

const StatsPage = () => {
  const userId = useUser();
  const [stats, setStats] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [statsData, watchlistData] = await Promise.all([
        getUserStats(userId),
        getUserWatchlist(userId)
      ]);
      
      setStats(statsData);
      setWatchlist(watchlistData || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTopGenres = () => {
    const genreCounts = {};
    watchlist.forEach(item => {
      // In a real app, you'd have genre data for each anime
      // For demo purposes, we'll simulate some genres
      const mockGenres = ["Action", "Drama", "Comedy", "Romance", "Fantasy"];
      const randomGenre = mockGenres[Math.floor(Math.random() * mockGenres.length)];
      genreCounts[randomGenre] = (genreCounts[randomGenre] || 0) + 1;
    });

    return Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));
  };

  const getRecentActivity = () => {
    return watchlist
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5);
  };

  const getCompletionRate = () => {
    if (stats?.total_anime === 0) return 0;
    return Math.round((stats?.completed / stats?.total_anime) * 100);
  };

  const getWatchingStreak = () => {
    // Simulate a watching streak
    return Math.floor(Math.random() * 30) + 1;
  };

  const statusIcons = {
    watching: { icon: Play, color: "text-green-400", bg: "bg-green-500" },
    completed: { icon: Check, color: "text-blue-400", bg: "bg-blue-500" },
    plan_to_watch: { icon: BookOpen, color: "text-yellow-400", bg: "bg-yellow-500" },
    on_hold: { icon: Pause, color: "text-orange-400", bg: "bg-orange-500" },
    dropped: { icon: X, color: "text-red-400", bg: "bg-red-500" }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const topGenres = getTopGenres();
  const recentActivity = getRecentActivity();
  const completionRate = getCompletionRate();
  const watchingStreak = getWatchingStreak();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white">Your Anime Stats</h1>
        <p className="text-slate-400">Track your anime watching journey</p>
      </div>

      {stats?.total_anime === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-white mb-2">No stats yet</h3>
            <p className="text-slate-400">Start adding anime to your watchlist to see your statistics</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-500/30">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats?.total_anime}</div>
                <div className="text-purple-200">Total Anime</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-500/30">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats?.episodes_watched}</div>
                <div className="text-blue-200">Episodes Watched</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500/30">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{completionRate}%</div>
                <div className="text-green-200">Completion Rate</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-500/30">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{watchingStreak}</div>
                <div className="text-orange-200">Day Streak</div>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(statusIcons).map(([status, config]) => {
                  const Icon = config.icon;
                  const count = stats?.[status] || 0;
                  const percentage = stats?.total_anime ? (count / stats.total_anime) * 100 : 0;

                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className="text-white capitalize">
                            {status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-slate-400">{count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Average Score */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Scoring Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {stats?.average_score ? stats.average_score.toFixed(1) : "N/A"}
                  </div>
                  <div className="text-slate-400">Average Score</div>
                </div>

                {stats?.average_score && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Rating Distribution</span>
                    </div>
                    <Progress value={(stats.average_score / 10) * 100} className="h-3" />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>1</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-600">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">
                      {watchlist.filter(item => item.score >= 8).length}
                    </div>
                    <div className="text-slate-400 text-sm">High Rated (8+)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">
                      {watchlist.filter(item => item.score && item.score <= 5).length}
                    </div>
                    <div className="text-slate-400 text-sm">Low Rated (≤5)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Genres & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Genres */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Top Genres
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topGenres.length > 0 ? (
                  <div className="space-y-3">
                    {topGenres.map((item, index) => (
                      <div key={item.genre} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-slate-400 text-sm w-4">#{index + 1}</div>
                          <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                            {item.genre}
                          </Badge>
                        </div>
                        <div className="text-white font-semibold">{item.count}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No genre data available</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((item) => {
                      const statusConfig = statusIcons[item.status];
                      const Icon = statusConfig?.icon || BookOpen;
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Icon className={`w-4 h-4 ${statusConfig?.color || 'text-slate-400'}`} />
                            <div>
                              <div className="text-white text-sm font-medium line-clamp-1">
                                {item.anime_title}
                              </div>
                              <div className="text-slate-400 text-xs">
                                {item.status.replace('_', ' ')}
                              </div>
                            </div>
                          </div>
                          <div className="text-slate-400 text-xs">
                            {new Date(item.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Goals Card */}
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-white text-xl font-semibold">🎯 Keep Going!</h3>
                <p className="text-slate-300">
                  You're doing great! You've watched {stats?.episodes_watched} episodes across {stats?.total_anime} anime series. 
                  {stats?.completed > 0 && ` You've completed ${stats.completed} series with an average rating of ${stats?.average_score?.toFixed(1) || 'N/A'}.`}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.ceil((stats?.episodes_watched || 0) / 24)}
                    </div>
                    <div className="text-slate-400 text-sm">Days of Content</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{watchingStreak}</div>
                    <div className="text-slate-400 text-sm">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{completionRate}%</div>
                    <div className="text-slate-400 text-sm">Completion Rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default StatsPage;