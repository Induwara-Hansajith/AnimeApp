from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from jikanpy import AioJikan
import asyncio
import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize Jikan API client
aio_jikan = AioJikan()

# Rate limiting variables
last_request_time = 0
request_interval = 0.34  # ~3 requests per second

# Create the main app
app = FastAPI(
    title="Anime Discovery App",
    description="Comprehensive anime discovery and tracking application powered by Jikan API",
    version="1.0.0"
)

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class AnimeBase(BaseModel):
    mal_id: int
    title: str
    title_english: Optional[str] = None
    title_japanese: Optional[str] = None
    type: Optional[str] = None
    episodes: Optional[int] = None
    status: Optional[str] = None
    year: Optional[int] = None
    season: Optional[str] = None
    score: Optional[float] = None
    scored_by: Optional[int] = None
    rank: Optional[int] = None
    popularity: Optional[int] = None
    synopsis: Optional[str] = None
    background: Optional[str] = None
    images: Optional[Dict[str, Any]] = None
    genres: Optional[List[Dict[str, Any]]] = None
    themes: Optional[List[Dict[str, Any]]] = None
    demographics: Optional[List[Dict[str, Any]]] = None

class AnimeDetails(AnimeBase):
    trailer: Optional[Dict[str, Any]] = None
    aired: Optional[Dict[str, Any]] = None
    duration: Optional[str] = None
    rating: Optional[str] = None
    source: Optional[str] = None
    studios: Optional[List[Dict[str, Any]]] = None
    producers: Optional[List[Dict[str, Any]]] = None
    licensors: Optional[List[Dict[str, Any]]] = None

class AnimeSearchResult(BaseModel):
    data: List[AnimeBase]
    pagination: Optional[Dict[str, Any]] = None

class WatchlistItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    mal_id: int
    anime_title: str
    status: str  # "watching", "completed", "plan_to_watch", "dropped", "on_hold"
    current_episode: int = 0
    total_episodes: Optional[int] = None
    score: Optional[int] = None
    start_date: Optional[datetime] = None
    finish_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WatchlistItemCreate(BaseModel):
    user_id: str
    mal_id: int
    anime_title: str
    status: str = "plan_to_watch"
    current_episode: int = 0
    score: Optional[int] = None
    notes: Optional[str] = None

class WatchlistItemUpdate(BaseModel):
    status: Optional[str] = None
    current_episode: Optional[int] = None
    score: Optional[int] = None
    notes: Optional[str] = None
    finish_date: Optional[datetime] = None

class UserStats(BaseModel):
    user_id: str
    total_anime: int
    watching: int
    completed: int
    plan_to_watch: int
    dropped: int
    on_hold: int
    episodes_watched: int
    average_score: Optional[float] = None
    genres_distribution: Dict[str, int]

# Utility functions
async def safe_jikan_request(coro):
    """Wrapper for Jikan API requests with rate limiting and error handling"""
    global last_request_time
    try:
        # Simple rate limiting
        current_time = time.time()
        time_since_last = current_time - last_request_time
        if time_since_last < request_interval:
            await asyncio.sleep(request_interval - time_since_last)
        
        last_request_time = time.time()
        return await coro
    except Exception as e:
        logging.error(f"Jikan API error: {str(e)}")
        raise HTTPException(status_code=503, detail=f"External API error: {str(e)}")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Anime Discovery API is running!"}

@api_router.get("/anime/search", response_model=AnimeSearchResult)
async def search_anime(
    q: Optional[str] = Query(None, description="Search query"),
    type: Optional[str] = Query(None, description="Anime type (tv, movie, ova, special, ona, music)"),
    status: Optional[str] = Query(None, description="Airing status (airing, complete, upcoming)"),
    genres: Optional[str] = Query(None, description="Comma-separated genre IDs"),
    min_score: Optional[float] = Query(None, description="Minimum score"),
    max_score: Optional[float] = Query(None, description="Maximum score"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(25, description="Results per page")
):
    """Search anime with various filters"""
    try:
        # Prepare search parameters
        params = {"page": page, "limit": limit}
        if q:
            params["q"] = q
        if type:
            params["type"] = type
        if status:
            params["status"] = status
        if genres:
            params["genres"] = genres
        if min_score:
            params["min_score"] = min_score
        if max_score:
            params["max_score"] = max_score

        # Make API request with rate limiting
        response = await safe_jikan_request(aio_jikan.search("anime", **params))
        
        # Transform response data
        anime_list = []
        for anime in response.get("data", []):
            anime_data = AnimeBase(
                mal_id=anime.get("mal_id"),
                title=anime.get("title", ""),
                title_english=anime.get("title_english"),
                title_japanese=anime.get("title_japanese"),
                type=anime.get("type"),
                episodes=anime.get("episodes"),
                status=anime.get("status"),
                year=anime.get("year"),
                season=anime.get("season"),
                score=anime.get("score"),
                scored_by=anime.get("scored_by"),
                rank=anime.get("rank"),
                popularity=anime.get("popularity"),
                synopsis=anime.get("synopsis"),
                background=anime.get("background"),
                images=anime.get("images"),
                genres=anime.get("genres", []),
                themes=anime.get("themes", []),
                demographics=anime.get("demographics", [])
            )
            anime_list.append(anime_data)

        return AnimeSearchResult(
            data=anime_list,
            pagination=response.get("pagination")
        )

    except Exception as e:
        logging.error(f"Search anime error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/anime/{anime_id}", response_model=AnimeDetails)
async def get_anime_details(anime_id: int):
    """Get detailed information about a specific anime"""
    try:
        response = await safe_jikan_request(aio_jikan.anime(anime_id))
        anime = response.get("data", {})
        
        return AnimeDetails(
            mal_id=anime.get("mal_id"),
            title=anime.get("title", ""),
            title_english=anime.get("title_english"),
            title_japanese=anime.get("title_japanese"),
            type=anime.get("type"),
            episodes=anime.get("episodes"),
            status=anime.get("status"),
            year=anime.get("year"),
            season=anime.get("season"),
            score=anime.get("score"),
            scored_by=anime.get("scored_by"),
            rank=anime.get("rank"),
            popularity=anime.get("popularity"),
            synopsis=anime.get("synopsis"),
            background=anime.get("background"),
            images=anime.get("images"),
            genres=anime.get("genres", []),
            themes=anime.get("themes", []),
            demographics=anime.get("demographics", []),
            trailer=anime.get("trailer"),
            aired=anime.get("aired"),
            duration=anime.get("duration"),
            rating=anime.get("rating"),
            source=anime.get("source"),
            studios=anime.get("studios", []),
            producers=anime.get("producers", []),
            licensors=anime.get("licensors", [])
        )

    except Exception as e:
        logging.error(f"Get anime details error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/anime/{anime_id}/episodes")
async def get_anime_episodes(anime_id: int, page: int = Query(1, description="Page number")):
    """Get episodes list for a specific anime"""
    try:
        response = await safe_jikan_request(aio_jikan.anime(anime_id, extension="episodes", page=page))
        return response
    except Exception as e:
        logging.error(f"Get anime episodes error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/anime/{anime_id}/recommendations")
async def get_anime_recommendations(anime_id: int):
    """Get recommendations for a specific anime"""
    try:
        response = await safe_jikan_request(aio_jikan.anime(anime_id, extension="recommendations"))
        return response
    except Exception as e:
        logging.error(f"Get anime recommendations error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/seasons/{year}/{season}")
async def get_seasonal_anime(year: int, season: str):
    """Get anime for a specific season and year"""
    try:
        response = await safe_jikan_request(aio_jikan.seasons(year=year, season=season))
        return response
    except Exception as e:
        logging.error(f"Get seasonal anime error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/seasons/current")
async def get_current_season():
    """Get current seasonal anime"""
    try:
        response = await safe_jikan_request(aio_jikan.seasons(extension="now"))
        return response
    except Exception as e:
        logging.error(f"Get current season error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/top/anime")
async def get_top_anime(
    type: Optional[str] = Query(None, description="Anime type filter"),
    page: int = Query(1, description="Page number")
):
    """Get top-rated anime"""
    try:
        params = {"page": page}
        if type:
            params["type"] = type
        
        response = await safe_jikan_request(aio_jikan.top("anime", **params))
        return response
    except Exception as e:
        logging.error(f"Get top anime error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/genres/anime")
async def get_anime_genres():
    """Get all anime genres"""
    try:
        response = await safe_jikan_request(aio_jikan.genres("anime"))
        return response
    except Exception as e:
        logging.error(f"Get anime genres error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Watchlist endpoints
@api_router.post("/watchlist", response_model=WatchlistItem)
async def add_to_watchlist(item: WatchlistItemCreate):
    """Add anime to user's watchlist"""
    try:
        # Check if item already exists
        existing = await db.watchlist.find_one({
            "user_id": item.user_id,
            "mal_id": item.mal_id
        })
        
        if existing:
            raise HTTPException(status_code=400, detail="Anime already in watchlist")
        
        # Create new watchlist item
        watchlist_item = WatchlistItem(**item.dict())
        
        # Insert into database
        await db.watchlist.insert_one(watchlist_item.dict())
        
        return watchlist_item
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Add to watchlist error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/watchlist/{user_id}", response_model=List[WatchlistItem])
async def get_user_watchlist(
    user_id: str,
    status: Optional[str] = Query(None, description="Filter by status")
):
    """Get user's watchlist"""
    try:
        query = {"user_id": user_id}
        if status:
            query["status"] = status
        
        items = await db.watchlist.find(query).sort("updated_at", -1).to_list(1000)
        return [WatchlistItem(**item) for item in items]
        
    except Exception as e:
        logging.error(f"Get user watchlist error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/watchlist/{item_id}", response_model=WatchlistItem)
async def update_watchlist_item(item_id: str, update_data: WatchlistItemUpdate):
    """Update watchlist item"""
    try:
        # Prepare update data
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()
        
        # Update in database
        result = await db.watchlist.update_one(
            {"id": item_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Watchlist item not found")
        
        # Get updated item
        updated_item = await db.watchlist.find_one({"id": item_id})
        return WatchlistItem(**updated_item)
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Update watchlist item error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/watchlist/{item_id}")
async def remove_from_watchlist(item_id: str):
    """Remove anime from watchlist"""
    try:
        result = await db.watchlist.delete_one({"id": item_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Watchlist item not found")
        
        return {"message": "Item removed from watchlist"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Remove from watchlist error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/stats/{user_id}", response_model=UserStats)
async def get_user_stats(user_id: str):
    """Get user's anime watching statistics"""
    try:
        # Get all watchlist items for user
        items = await db.watchlist.find({"user_id": user_id}).to_list(1000)
        
        if not items:
            return UserStats(
                user_id=user_id,
                total_anime=0,
                watching=0,
                completed=0,
                plan_to_watch=0,
                dropped=0,
                on_hold=0,
                episodes_watched=0,
                average_score=None,
                genres_distribution={}
            )
        
        # Calculate statistics
        stats = {
            "watching": 0,
            "completed": 0,
            "plan_to_watch": 0,
            "dropped": 0,
            "on_hold": 0
        }
        
        episodes_watched = 0
        scores = []
        genres_count = {}
        
        for item in items:
            status = item.get("status", "plan_to_watch")
            stats[status] = stats.get(status, 0) + 1
            
            episodes_watched += item.get("current_episode", 0)
            
            if item.get("score"):
                scores.append(item["score"])
        
        average_score = sum(scores) / len(scores) if scores else None
        
        return UserStats(
            user_id=user_id,
            total_anime=len(items),
            watching=stats["watching"],
            completed=stats["completed"],
            plan_to_watch=stats["plan_to_watch"],
            dropped=stats["dropped"],
            on_hold=stats["on_hold"],
            episodes_watched=episodes_watched,
            average_score=average_score,
            genres_distribution=genres_count
        )
        
    except Exception as e:
        logging.error(f"Get user stats error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Anime Discovery API started successfully!")
    logger.info("Jikan API client initialized")

@app.on_event("shutdown")
async def shutdown_event():
    await aio_jikan.close()
    client.close()
    logger.info("Anime Discovery API shut down")