import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnimeCard from "@/components/AnimeCard";
import { getCurrentSeason, getSeasonalAnime } from "@/services/api";
import { Calendar, Sparkles } from "lucide-react";

const SeasonalPage = () => {
  const [currentSeasonData, setCurrentSeasonData] = useState([]);
  const [customSeasonData, setCustomSeasonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customLoading, setCustomLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSeason, setSelectedSeason] = useState("spring");

  const seasons = [
    { value: "winter", label: "Winter" },
    { value: "spring", label: "Spring" },
    { value: "summer", label: "Summer" },
    { value: "fall", label: "Fall" }
  ];

  const years = [];
  for (let year = new Date().getFullYear(); year >= 1970; year--) {
    years.push(year);
  }

  useEffect(() => {
    fetchCurrentSeason();
  }, []);

  const fetchCurrentSeason = async () => {
    try {
      setLoading(true);
      const response = await getCurrentSeason();
      setCurrentSeasonData(response?.data || []);
    } catch (error) {
      console.error("Error fetching current season:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomSeason = async () => {
    try {
      setCustomLoading(true);
      const response = await getSeasonalAnime(selectedYear, selectedSeason);
      setCustomSeasonData(response?.data || []);
    } catch (error) {
      console.error("Error fetching custom season:", error);
      setCustomSeasonData([]);
    } finally {
      setCustomLoading(false);
    }
  };

  const getCurrentSeasonInfo = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    
    let season = "spring";
    if (month >= 12 || month <= 2) season = "winter";
    else if (month >= 3 && month <= 5) season = "spring";
    else if (month >= 6 && month <= 8) season = "summer";
    else if (month >= 9 && month <= 11) season = "fall";
    
    return {
      season: season.charAt(0).toUpperCase() + season.slice(1),
      year: now.getFullYear()
    };
  };

  const currentInfo = getCurrentSeasonInfo();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <Calendar className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white">Seasonal Anime</h1>
        <p className="text-slate-400">Discover the latest anime releases by season</p>
      </div>

      {/* Current Season */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <h2 className="text-3xl font-bold text-white">
            Current Season - {currentInfo.season} {currentInfo.year}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {currentSeasonData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {currentSeasonData.slice(0, 24).map((anime) => (
                    <AnimeCard key={anime.mal_id} anime={anime} />
                  ))}
                </div>

                {currentSeasonData.length > 24 && (
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      className="text-white border-slate-600 hover:bg-slate-700"
                    >
                      View All {currentSeasonData.length} Anime
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-400">No seasonal anime data available</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Browse Other Seasons */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Browse Other Seasons</h2>

        {/* Season Selector */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Year</label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Season</label>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season.value} value={season.value}>
                        {season.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={fetchCustomSeason}
                disabled={customLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {customLoading ? "Loading..." : "Load Season"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Season Results */}
        {customSeasonData.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">
              {seasons.find(s => s.value === selectedSeason)?.label} {selectedYear}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {customSeasonData.slice(0, 24).map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>

            {customSeasonData.length > 24 && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="text-white border-slate-600 hover:bg-slate-700"
                >
                  View All {customSeasonData.length} Anime
                </Button>
              </div>
            )}
          </div>
        )}

        {customLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Season Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {seasons.map((season) => (
          <Card key={season.value} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">{season.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                {season.value === "winter" && "December - February"}
                {season.value === "spring" && "March - May"}
                {season.value === "summer" && "June - August"}
                {season.value === "fall" && "September - November"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSeason(season.value);
                  setSelectedYear(new Date().getFullYear());
                }}
                className="w-full text-white border-slate-600 hover:bg-slate-700"
              >
                Browse {season.label}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips Card */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
        <CardContent className="p-6">
          <h3 className="text-white text-lg font-semibold mb-2">💡 Pro Tip</h3>
          <p className="text-slate-300">
            Seasonal anime typically follow a quarterly schedule. New series usually start airing at the beginning 
            of each season, making it the perfect time to discover fresh content and join ongoing discussions 
            in the anime community.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeasonalPage;