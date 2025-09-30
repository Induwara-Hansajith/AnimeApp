import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnimeCard from "@/components/AnimeCard";
import { searchAnime, getAnimeGenres } from "@/services/api";
import { Search, Filter, X } from "lucide-react";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchResults, setSearchResults] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minScore, setMinScore] = useState(searchParams.get("min_score") || "");
  const [showFilters, setShowFilters] = useState(false);

  const animeTypes = [
    { value: "tv", label: "TV Series" },
    { value: "movie", label: "Movie" },
    { value: "ova", label: "OVA" },
    { value: "special", label: "Special" },
    { value: "ona", label: "ONA" },
    { value: "music", label: "Music" }
  ];

  const animeStatuses = [
    { value: "airing", label: "Airing" },
    { value: "complete", label: "Completed" },
    { value: "upcoming", label: "Upcoming" }
  ];

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    if (searchQuery || selectedType || selectedStatus || selectedGenres.length > 0 || minScore) {
      handleSearch(1);
    }
  }, [selectedType, selectedStatus, selectedGenres, minScore]);

  const fetchGenres = async () => {
    try {
      const response = await getAnimeGenres();
      setGenres(response?.data || []);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const handleSearch = async (page = currentPage) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: 24
      };

      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedType) params.type = selectedType;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedGenres.length > 0) params.genres = selectedGenres.join(",");
      if (minScore) params.min_score = parseFloat(minScore);

      // Update URL params
      const newSearchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value && key !== "page" && key !== "limit") {
          newSearchParams.set(key, value.toString());
        }
      });
      setSearchParams(newSearchParams);

      const response = await searchAnime(params);
      setSearchResults(response?.data || []);
      setPagination(response?.pagination || {});
      setCurrentPage(page);
    } catch (error) {
      console.error("Error searching anime:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const clearFilters = () => {
    setSelectedType("");
    setSelectedStatus("");
    setSelectedGenres([]);
    setMinScore("");
    setSearchQuery("");
    setSearchResults([]);
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    handleSearch(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Discover Anime</h1>
        <p className="text-slate-400">Search through thousands of anime titles</p>
      </div>

      {/* Search Bar */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search anime titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch(1)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleSearch(1)} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="text-white border-slate-600 hover:bg-slate-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-600 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any type</SelectItem>
                      {animeTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any status</SelectItem>
                      {animeStatuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Score Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Min Score</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    placeholder="e.g., 7.5"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full text-white border-slate-600 hover:bg-slate-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>

              {/* Genre Filter */}
              {genres.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Genres</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {genres.map(genre => (
                      <Badge
                        key={genre.mal_id}
                        variant={selectedGenres.includes(genre.mal_id) ? "default" : "secondary"}
                        className={`cursor-pointer ${
                          selectedGenres.includes(genre.mal_id)
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                        }`}
                        onClick={() => handleGenreToggle(genre.mal_id)}
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Filters */}
      {(selectedType || selectedStatus || selectedGenres.length > 0 || minScore) && (
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-slate-400">Active filters:</span>
              {selectedType && (
                <Badge variant="outline" className="text-slate-300 border-slate-600">
                  Type: {animeTypes.find(t => t.value === selectedType)?.label}
                </Badge>
              )}
              {selectedStatus && (
                <Badge variant="outline" className="text-slate-300 border-slate-600">
                  Status: {animeStatuses.find(s => s.value === selectedStatus)?.label}
                </Badge>
              )}
              {minScore && (
                <Badge variant="outline" className="text-slate-300 border-slate-600">
                  Score: {minScore}+
                </Badge>
              )}
              {selectedGenres.map(genreId => {
                const genre = genres.find(g => g.mal_id === genreId);
                return genre ? (
                  <Badge key={genreId} variant="outline" className="text-slate-300 border-slate-600">
                    {genre.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {searchResults.length > 0 ? (
            <>
              {/* Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {searchResults.map(anime => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.has_next_page && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Load More Results
                  </Button>
                </div>
              )}
            </>
          ) : (
            !loading && (searchQuery || selectedType || selectedStatus || selectedGenres.length > 0 || minScore) && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <div className="text-slate-400 mb-4">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
                    <p>Try adjusting your search criteria or filters</p>
                  </div>
                  <Button variant="outline" onClick={clearFilters} className="text-white border-slate-600 hover:bg-slate-700">
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;