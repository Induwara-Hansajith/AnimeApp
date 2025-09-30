import React, { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import AnimeDetailsPage from "@/pages/AnimeDetailsPage";
import WatchlistPage from "@/pages/WatchlistPage";
import SeasonalPage from "@/pages/SeasonalPage";
import StatsPage from "@/pages/StatsPage";
import Navigation from "@/components/Navigation";
import { UserProvider } from "@/context/UserContext";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const [currentUser] = useState("user123"); // Simple user simulation

  return (
    <UserProvider value={currentUser}>
      <div className="App min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <BrowserRouter>
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/anime/:id" element={<AnimeDetailsPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/seasonal" element={<SeasonalPage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Routes>
          </main>
          <Toaster />
        </BrowserRouter>
      </div>
    </UserProvider>
  );
}

export default App;