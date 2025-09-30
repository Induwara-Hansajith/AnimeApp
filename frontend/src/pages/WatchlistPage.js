import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/context/UserContext";
import { getUserWatchlist, updateWatchlistItem, removeFromWatchlist } from "@/services/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Play, 
  Check, 
  Clock, 
  X, 
  Star,
  Edit3,
  Trash2,
  Plus
} from "lucide-react";

const WatchlistPage = () => {
  const userId = useUser();
  const [watchlist, setWatchlist] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [editingItem, setEditingItem] = useState(null);
  const [editData, setEditData] = useState({});

  const statusOptions = [
    { value: "watching", label: "Watching", icon: Play, color: "bg-green-500" },
    { value: "completed", label: "Completed", icon: Check, color: "bg-blue-500" },
    { value: "plan_to_watch", label: "Plan to Watch", icon: BookOpen, color: "bg-yellow-500" },
    { value: "on_hold", label: "On Hold", icon: Clock, color: "bg-orange-500" },
    { value: "dropped", label: "Dropped", icon: X, color: "bg-red-500" }
  ];

  useEffect(() => {
    fetchWatchlist();
  }, [userId]);

  useEffect(() => {
    filterWatchlist();
  }, [watchlist, activeTab]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const data = await getUserWatchlist(userId);
      setWatchlist(data || []);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      toast.error("Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  };

  const filterWatchlist = () => {
    if (activeTab === "all") {
      setFilteredList(watchlist);
    } else {
      setFilteredList(watchlist.filter(item => item.status === activeTab));
    }
  };

  const getStatusCounts = () => {
    const counts = { all: watchlist.length };
    statusOptions.forEach(option => {
      counts[option.value] = watchlist.filter(item => item.status === option.value).length;
    });
    return counts;
  };

  const handleUpdateItem = async (itemId, updateData) => {
    try {
      await updateWatchlistItem(itemId, updateData);
      await fetchWatchlist();
      toast.success("Watchlist updated!");
      setEditingItem(null);
      setEditData({});
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleDeleteItem = async (itemId, title) => {
    if (window.confirm(`Remove "${title}" from your watchlist?`)) {
      try {
        await removeFromWatchlist(itemId);
        await fetchWatchlist();
        toast.success("Removed from watchlist");
      } catch (error) {
        console.error("Error removing item:", error);
        toast.error("Failed to remove item");
      }
    }
  };

  const startEditing = (item) => {
    setEditingItem(item.id);
    setEditData({
      status: item.status,
      current_episode: item.current_episode,
      score: item.score || "",
      notes: item.notes || ""
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditData({});
  };

  const getStatusOption = (status) => {
    return statusOptions.find(option => option.value === status);
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">My Watchlist</h1>
        <p className="text-slate-400">Track your anime watching progress</p>
        <Link to="/search">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Anime
          </Button>
        </Link>
      </div>

      {watchlist.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h3>
            <p className="text-slate-400 mb-6">Start adding anime to track your progress</p>
            <Link to="/search">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Find Anime to Watch
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{statusCounts.all}</div>
                <div className="text-slate-400 text-sm">Total</div>
              </CardContent>
            </Card>

            {statusOptions.map((option) => (
              <Card key={option.value} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{statusCounts[option.value]}</div>
                  <div className="text-slate-400 text-sm">{option.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 bg-slate-800">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-purple-600"
              >
                All ({statusCounts.all})
              </TabsTrigger>
              {statusOptions.map((option) => (
                <TabsTrigger 
                  key={option.value}
                  value={option.value} 
                  className="data-[state=active]:bg-purple-600 text-xs lg:text-sm"
                >
                  {option.label} ({statusCounts[option.value]})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredList.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-8 text-center">
                    <p className="text-slate-400">No anime found in this category</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredList.map((item) => {
                    const statusOption = getStatusOption(item.status);
                    const isEditing = editingItem === item.id;

                    return (
                      <Card key={item.id} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Anime Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <Link 
                                    to={`/anime/${item.mal_id}`}
                                    className="text-xl font-semibold text-white hover:text-purple-400 transition-colors"
                                  >
                                    {item.anime_title}
                                  </Link>
                                  <div className="flex items-center gap-3 mt-2">
                                    <Badge className={`${statusOption?.color} text-white`}>
                                      {statusOption?.label}
                                    </Badge>
                                    {item.score && (
                                      <div className="flex items-center space-x-1 text-slate-400">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span>{item.score}/10</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditing(item)}
                                    className="text-slate-400 hover:text-white"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteItem(item.id, item.anime_title)}
                                    className="text-slate-400 hover:text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Progress & Notes */}
                              <div className="space-y-3">
                                {item.current_episode > 0 && (
                                  <div className="text-slate-400">
                                    Progress: {item.current_episode}
                                    {item.total_episodes ? `/${item.total_episodes}` : ""} episodes
                                  </div>
                                )}

                                {item.notes && (
                                  <div className="text-slate-300 bg-slate-700/50 rounded p-3">
                                    <strong>Notes:</strong> {item.notes}
                                  </div>
                                )}

                                <div className="text-sm text-slate-500">
                                  Added: {new Date(item.created_at).toLocaleDateString()}
                                  {item.updated_at !== item.created_at && (
                                    <> • Updated: {new Date(item.updated_at).toLocaleDateString()}</>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Edit Form */}
                            {isEditing && (
                              <div className="lg:w-80 space-y-4 bg-slate-700/50 rounded-lg p-4">
                                <h4 className="text-white font-semibold">Edit Entry</h4>
                                
                                <div>
                                  <label className="block text-sm text-slate-300 mb-1">Status</label>
                                  <Select value={editData.status} onValueChange={(value) => setEditData({...editData, status: value})}>
                                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <label className="block text-sm text-slate-300 mb-1">Current Episode</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={editData.current_episode}
                                    onChange={(e) => setEditData({...editData, current_episode: parseInt(e.target.value) || 0})}
                                    className="bg-slate-600 border-slate-500 text-white"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm text-slate-300 mb-1">Score (1-10)</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={editData.score}
                                    onChange={(e) => setEditData({...editData, score: parseInt(e.target.value) || ""})}
                                    className="bg-slate-600 border-slate-500 text-white"
                                    placeholder="Optional"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm text-slate-300 mb-1">Notes</label>
                                  <Input
                                    value={editData.notes}
                                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                                    className="bg-slate-600 border-slate-500 text-white"
                                    placeholder="Your thoughts..."
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleUpdateItem(item.id, editData)}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={cancelEditing}
                                    className="flex-1 text-white border-slate-600 hover:bg-slate-700"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default WatchlistPage;