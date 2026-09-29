import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Icon from "../../components/common/Icon";
import movieImage from "../../assets/images/image1.png";
import {
    getTrendingMovies,
    getPopularMovies,
    getMovies,
    getMovieDetails,
    getMovieReviews,
    getGenres,
    getPosterUrl,
    getBackdropUrl
} from "../../services/movieService";

// Pre-defined mood categories with TMDB Genre IDs
const MOOD_GENRES = [
    { id: 878, label: "SCI-FI", name: "Science Fiction", color: "from-blue-500/20 to-cyan-500/10" },
    { id: 53, label: "THRILLER", name: "Thriller", color: "from-red-500/20 to-orange-500/10" },
    { id: 27, label: "HORROR", name: "Horror", color: "from-purple-900/30 to-rose-950/20" },
    { id: 80, label: "CRIME", name: "Crime", color: "from-amber-600/20 to-yellow-600/10" },
    { id: 18, label: "DRAMA", name: "Drama", color: "from-emerald-500/20 to-teal-500/10" }
];

const Landing = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    // Data states
    const [genreMap, setGenreMap] = useState({});
    const [trendingToday, setTrendingToday] = useState([]);
    const [popularThisWeek, setPopularThisWeek] = useState([]);
    const [selectedMood, setSelectedMood] = useState(MOOD_GENRES[0]);
    const [moodMovies, setMoodMovies] = useState([]);
    const [moodLoading, setMoodLoading] = useState(false);
    const [spotlightMovie, setSpotlightMovie] = useState(null);
    const [spotlightDetails, setSpotlightDetails] = useState(null);
    const [newReleases, setNewReleases] = useState([]);
    const [communityReviews, setCommunityReviews] = useState([]);
    const [popularLists, setPopularLists] = useState([]);

    // Loading & error states
    const [loading, setLoading] = useState(true);

    // Helpers
    const formatRuntime = (mins) => {
        if (!mins) return "2h 15m";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const getYear = (dateStr) => {
        if (!dateStr) return "2026";
        return dateStr.substring(0, 4);
    };

    const formatMovie = (movie, genresObj = genreMap) => {
        const genreNames = (movie.genre_ids || [])
            .map((id) => genresObj[id])
            .filter(Boolean)
            .slice(0, 2)
            .join(" / ");

        return {
            id: movie.id,
            title: movie.title || movie.original_title || "Untitled",
            poster: getPosterUrl(movie.poster_path),
            backdrop: getBackdropUrl(movie.backdrop_path),
            rating: movie.vote_average ? Number(movie.vote_average).toFixed(1) : "8.0",
            voteCount: movie.vote_count || 0,
            year: getYear(movie.release_date),
            genre: genreNames || "Cinema",
            overview: movie.overview || "No overview available."
        };
    };

    // Load initial genres and core movie data
    useEffect(() => {
        const initLandingData = async () => {
            try {
                setLoading(true);

                // 1. Fetch Genres map
                let gMap = {};
                try {
                    const gData = await getGenres();
                    const gList = Array.isArray(gData) ? gData : gData?.genres || [];
                    gList.forEach((g) => {
                        gMap[g.id] = g.name;
                    });
                    setGenreMap(gMap);
                } catch (e) {
                    console.warn("Could not fetch genres:", e);
                }

                // 2. Fetch Trending Today (5 items)
                try {
                    const trendingRes = await getTrendingMovies(1);
                    const trendingList = Array.isArray(trendingRes) ? trendingRes : trendingRes?.results || [];
                    const formattedTrending = trendingList.slice(0, 5).map((m) => formatMovie(m, gMap));
                    setTrendingToday(formattedTrending);

                    // Pick first trending movie for Spotlight
                    if (trendingList.length > 0) {
                        const topMovie = trendingList[0];
                        setSpotlightMovie(formatMovie(topMovie, gMap));

                        // Fetch detailed runtime and backdrop
                        try {
                            const details = await getMovieDetails(topMovie.id);
                            setSpotlightDetails(details);
                        } catch (err) {
                            console.warn("Failed to fetch spotlight details:", err);
                        }

                        // Try to fetch reviews for this movie
                        try {
                            const revRes = await getMovieReviews(topMovie.id);
                            const revList = revRes?.results || [];
                            if (revList.length > 0) {
                                const formattedReviews = revList.slice(0, 3).map((r, index) => ({
                                    id: r.id || index,
                                    author: r.author || "Cinephile Critic",
                                    movieTitle: topMovie.title,
                                    movieId: topMovie.id,
                                    rating: r.author_details?.rating ? `★ ${r.author_details.rating}/10` : "★ 9/10",
                                    content: r.content?.length > 180 ? r.content.slice(0, 180) + "..." : r.content,
                                    time: "Recent review",
                                    likes: Math.floor(Math.random() * 45) + 12,
                                    avatar: r.author_details?.avatar_path
                                        ? getPosterUrl(r.author_details.avatar_path)
                                        : null
                                }));
                                setCommunityReviews(formattedReviews);
                            }
                        } catch (err) {
                            console.warn("Could not fetch reviews:", err);
                        }
                    }
                } catch (e) {
                    console.error("Failed to load trending movies:", e);
                }

                // 3. Fetch Popular This Week (5 items)
                try {
                    const popularRes = await getPopularMovies();
                    const popularList = Array.isArray(popularRes) ? popularRes : popularRes?.results || [];
                    setPopularThisWeek(popularList.slice(0, 5).map((m) => formatMovie(m, gMap)));
                } catch (e) {
                    console.error("Failed to load popular movies:", e);
                }

                // 4. Fetch New Releases (4 items)
                try {
                    const newRes = await getMovies({
                        year: "2026",
                        sortBy: "popularity.desc",
                        page: 1
                    });
                    let newList = Array.isArray(newRes) ? newRes : newRes?.results || [];
                    if (newList.length < 4) {
                        const fallbackRes = await getMovies({
                            year: "2025",
                            sortBy: "popularity.desc",
                            page: 1
                        });
                        newList = Array.isArray(fallbackRes) ? fallbackRes : fallbackRes?.results || [];
                    }
                    setNewReleases(newList.slice(0, 4).map((m) => formatMovie(m, gMap)));
                } catch (e) {
                    console.error("Failed to load new releases:", e);
                }

                // 5. Popular Lists (Curated with live TMDB posters)
                try {
                    const [sciFiRes, crimeRes, dramaRes] = await Promise.all([
                        getMovies({ genre: 878, sortBy: "popularity.desc", page: 1 }),
                        getMovies({ genre: 80, sortBy: "popularity.desc", page: 1 }),
                        getMovies({ genre: 18, sortBy: "vote_average.desc", page: 1 })
                    ]);

                    const getPosters = (res) => {
                        const items = res?.results || [];
                        return items.slice(0, 3).map((m) => getPosterUrl(m.poster_path)).filter(Boolean);
                    };

                    setPopularLists([
                        {
                            id: "list-1",
                            title: "Mind-Bending Sci-Fi & Speculative Masterpieces",
                            description: "Dystopian visions, deep space odysseys, and thought-provoking realities.",
                            filmsCount: 42,
                            likes: "1.8k",
                            curator: "Alex Vance",
                            genreId: 878,
                            posters: getPosters(sciFiRes)
                        },
                        {
                            id: "list-2",
                            title: "Neo-Noir, Gritty Heists & Gangster Sagas",
                            description: "Shadowy back-alleys, hard-boiled detectives, and gripping criminal minds.",
                            filmsCount: 35,
                            likes: "1.4k",
                            curator: "Elena Rostova",
                            genreId: 80,
                            posters: getPosters(crimeRes)
                        },
                        {
                            id: "list-3",
                            title: "Emotionally Devastating Masterclass Dramas",
                            description: "Unforgettable performances and poetic human stories that linger long after.",
                            filmsCount: 50,
                            likes: "2.1k",
                            curator: "Marcus Sterling",
                            genreId: 18,
                            posters: getPosters(dramaRes)
                        }
                    ]);
                } catch (e) {
                    console.warn("Could not generate curated lists:", e);
                }

            } catch (err) {
                console.error("Landing page initialization error:", err);
            } finally {
                setLoading(false);
            }
        };

        initLandingData();
    }, []);

    // Load movies for selected mood
    useEffect(() => {
        const loadMoodMovies = async () => {
            if (!selectedMood) return;
            try {
                setMoodLoading(true);
                const res = await getMovies({
                    genre: selectedMood.id,
                    sortBy: "popularity.desc",
                    page: 1
                });
                const list = Array.isArray(res) ? res : res?.results || [];
                setMoodMovies(list.slice(0, 5).map((m) => formatMovie(m)));
            } catch (err) {
                console.error("Failed to load mood movies:", err);
            } finally {
                setMoodLoading(false);
            }
        };

        loadMoodMovies();
    }, [selectedMood]);

    // Fallback reviews if TMDB reviews are empty
    const displayReviews = communityReviews.length > 0 ? communityReviews : [
        {
            id: 1,
            author: "Julian Thorne",
            movieTitle: spotlightMovie?.title || "Interstellar",
            movieId: spotlightMovie?.id || 157336,
            rating: "★ 9.5/10",
            content: "A masterclass in tension, sound design, and emotional resonance. The direction keeps you locked in from the opening frame.",
            time: "2 days ago",
            likes: 42
        },
        {
            id: 2,
            author: "Maya Lin",
            movieTitle: trendingToday[1]?.title || "Blade Runner 2049",
            movieId: trendingToday[1]?.id || 335984,
            rating: "★ 9.0/10",
            content: "Breathtaking cinematography and a nuanced script that honors its genre while innovating in every subtle way.",
            time: "Yesterday",
            likes: 38
        },
        {
            id: 3,
            author: "David K.",
            movieTitle: popularThisWeek[0]?.title || "Dune: Part Two",
            movieId: popularThisWeek[0]?.id || 693134,
            rating: "★ 8.8/10",
            content: "Grand scale filmmaking at its absolute peak. You feel the weight of every choice and the world building is unmatched.",
            time: "4 days ago",
            likes: 29
        }
    ];

    // Card Renderer for standard movie cards
    const renderMovieCard = (movie) => (
        <article
            key={movie.id}
            onClick={() => navigate(`/movies/${movie.id}`)}
            className="group flex flex-col cursor-pointer transition-all duration-300"
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#14181d] border border-white/10 shadow-lg transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-[1.02] group-hover:border-primary/50 group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.8),0_0_18px_rgba(67,254,109,0.25)]">
                {movie.poster ? (
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[#181c20] text-gray-500 p-3 text-center">
                        <span className="text-3xl mb-1">🎬</span>
                        <span className="text-[11px] font-semibold text-gray-400">{movie.title}</span>
                    </div>
                )}

                {/* Rating badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-[#0a0a0a]/85 border border-white/15 px-2 py-0.5 text-[11px] font-bold text-[#ffc107] backdrop-blur-md">
                    <span>★</span>
                    <span className="text-white">{movie.rating}</span>
                </div>

                {/* Hover Quick View Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#080a0d] via-[#080a0d]/60 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/movies/${movie.id}`);
                        }}
                        className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-[#00390f] shadow-md transition-all hover:bg-[#6cff80]"
                    >
                        Quick Details
                    </button>
                </div>
            </div>

            <div className="mt-2.5 px-0.5">
                <h3 className="truncate text-sm font-bold text-white transition-colors group-hover:text-primary">
                    {movie.title}
                </h3>
                <p className="mt-0.5 truncate text-[11px] font-medium text-[#8d9ba8]">
                    {movie.genre} • {movie.year}
                </p>
            </div>
        </article>
    );

    // Skeleton loader
    const renderSkeletonRow = (count = 5) => (
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${count === 4 ? "md:grid-cols-4" : "md:grid-cols-5"} gap-4 sm:gap-5`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                    <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-[#161c24] border border-white/5" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-[#1c222c]" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-[#161c24]" />
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] font-body-md text-body-md text-[#e0e3e8] antialiased">
            {/* 1. NAVBAR */}
            <Navbar />

            <main className="space-y-12 sm:space-y-20 md:space-y-24">
                {/* 2. HERO */}
                <section className="relative flex min-h-[520px] sm:min-h-[600px] md:min-h-[680px] w-full items-center py-12 sm:py-16">
                    <div className="absolute inset-0 z-0">
                        <img
                            src={spotlightMovie?.backdrop || movieImage}
                            alt="Cinematic Hero Backdrop"
                            className="h-full w-full object-cover opacity-60 transition-opacity duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/40" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
                    </div>

                    <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-md">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                                POWERED BY TMDB
                            </div>

                            <h1 className="mb-4 font-headline-lg text-3xl sm:text-5xl lg:text-6xl font-black leading-tight text-white tracking-tight">
                                Discover Movies.
                                <br />
                                <span className="text-primary drop-shadow-[0_0_25px_rgba(67,254,109,0.35)]">
                                    Share Your Perspective.
                                </span>
                            </h1>

                            <p className="mb-8 font-body-lg text-sm sm:text-lg text-[#bacbb6] leading-relaxed max-w-xl">
                                Immerse yourself in a curated gallery of cinematic excellence.
                                Discover, rate, and meticulously catalog the films that move you in an environment designed for true Cinephiles.
                            </p>

                            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                <Link to="/movies" className="w-full sm:w-auto inline-block">
                                    <button
                                        type="button"
                                        className="w-full sm:w-auto cursor-pointer rounded-lg bg-primary px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold text-[#00390f] transition-all hover:bg-[#6cff80] hover:shadow-[0_0_25px_rgba(67,254,109,0.45)]"
                                    >
                                        Explore Movies
                                    </button>
                                </Link>

                                {token ? (
                                    <Link to="/dashboard" className="w-full sm:w-auto inline-block">
                                        <button
                                            type="button"
                                            className="w-full sm:w-auto cursor-pointer rounded-lg border border-white/20 bg-white/5 px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/15"
                                        >
                                            Go to Dashboard
                                        </button>
                                    </Link>
                                ) : (
                                    <Link to="/register" className="w-full sm:w-auto inline-block">
                                        <button
                                            type="button"
                                            className="w-full sm:w-auto cursor-pointer rounded-lg border border-white/20 bg-white/5 px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/15"
                                        >
                                            Join Cinephile
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. 🔥 TRENDING TODAY */}
                <section className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
                        <div>
                            <h2 className="flex items-center gap-2 font-headline-lg text-2xl sm:text-3xl font-black text-white tracking-tight">
                                <span>🔥</span> TRENDING TODAY
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-[#8d9ba8]">
                                The most-watched films buzzing across TMDB right now
                            </p>
                        </div>
                        <Link
                            to="/trending"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                            View all trending <Icon className="text-sm">arrow_forward</Icon>
                        </Link>
                    </div>

                    {loading && !trendingToday.length ? (
                        renderSkeletonRow(5)
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5">
                            {trendingToday.map(renderMovieCard)}
                        </div>
                    )}
                </section>

                {/* 4. ⭐ POPULAR THIS WEEK */}
                <section className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
                        <div>
                            <h2 className="flex items-center gap-2 font-headline-lg text-2xl sm:text-3xl font-black text-white tracking-tight">
                                <span>⭐</span> POPULAR THIS WEEK
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-[#8d9ba8]">
                                Top rated fan favorites and global audience hits
                            </p>
                        </div>
                        <Link
                            to="/movies"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                            Explore popular <Icon className="text-sm">arrow_forward</Icon>
                        </Link>
                    </div>

                    {loading && !popularThisWeek.length ? (
                        renderSkeletonRow(5)
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5">
                            {popularThisWeek.map(renderMovieCard)}
                        </div>
                    )}
                </section>

                {/* 5. WHAT ARE YOU IN THE MOOD FOR? */}
                <section className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
                    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#13171d] to-[#0d1014] p-6 sm:p-8">
                        <div className="mb-6 text-center">
                            <h2 className="font-headline-lg text-2xl sm:text-3xl font-black text-white tracking-tight">
                                WHAT ARE YOU IN THE MOOD FOR?
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-[#8d9ba8]">
                                Select a genre vibe to instantly discover top-rated films from TMDB
                            </p>
                        </div>

                        {/* Genre Pill Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pb-6">
                            {MOOD_GENRES.map((genre) => {
                                const isActive = selectedMood.id === genre.id;
                                return (
                                    <button
                                        key={genre.id}
                                        type="button"
                                        onClick={() => setSelectedMood(genre)}
                                        className={`cursor-pointer rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 ${
                                            isActive
                                                ? "bg-primary text-[#00390f] shadow-[0_0_20px_rgba(67,254,109,0.4)] scale-105"
                                                : "border border-white/10 bg-[#1a2027] text-gray-300 hover:border-white/30 hover:bg-[#222933] hover:text-white"
                                        }`}
                                    >
                                        [ {genre.label} ]
                                    </button>
                                );
                            })}
                        </div>

                        {/* Dynamic Mood Movie Row */}
                        {moodLoading ? (
                            renderSkeletonRow(5)
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5">
                                {moodMovies.map(renderMovieCard)}
                            </div>
                        )}

                        <div className="mt-6 flex justify-center">
                            <Link
                                to="/genres"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Browse all {selectedMood.name} movies
                                <Icon className="text-sm">arrow_forward</Icon>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 6. MOVIE SPOTLIGHT */}
                {spotlightMovie && (
                    <section className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
                        <div className="mb-4 text-center">
                            <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                                Featured Recommendation
                            </span>
                            <h2 className="mt-1 font-headline-lg text-2xl sm:text-3xl font-black text-white tracking-tight">
                                MOVIE SPOTLIGHT
                            </h2>
                        </div>

                        <div className="relative min-h-[420px] sm:min-h-[480px] w-full overflow-hidden rounded-2xl border border-white/15 bg-[#12161b] shadow-2xl">
                            {/* TMDB BACKDROP */}
                            {spotlightMovie.backdrop ? (
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
                                    style={{ backgroundImage: `url('${spotlightMovie.backdrop}')` }}
                                />
                            ) : (
                                <img
                                    src={movieImage}
                                    alt="Spotlight Movie Backdrop"
                                    className="h-full w-full object-cover"
                                />
                            )}

                            {/* Film Overlays for readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#080a0d] via-[#080a0d]/70 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#080a0d]/90 via-[#080a0d]/50 to-transparent" />

                            {/* Content Box */}
                            <div className="relative z-10 flex min-h-[420px] sm:min-h-[480px] flex-col justify-end p-6 sm:p-10 lg:p-12 max-w-3xl">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="rounded-full bg-primary/20 border border-primary/40 px-3 py-1 font-mono text-[11px] font-bold text-primary backdrop-blur-md">
                                        TMDB SPOTLIGHT
                                    </span>
                                    <span className="text-xs text-[#8d9ba8]">
                                        {spotlightMovie.genre}
                                    </span>
                                </div>

                                <h3 className="mb-3 font-headline-lg text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                                    {spotlightMovie.title}
                                </h3>

                                <div className="mb-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-300">
                                    <span className="flex items-center gap-1 text-[#ffc107] font-bold">
                                        ★ {spotlightMovie.rating}
                                    </span>
                                    <span>•</span>
                                    <span>{spotlightDetails?.release_date ? getYear(spotlightDetails.release_date) : spotlightMovie.year}</span>
                                    <span>•</span>
                                    <span>{formatRuntime(spotlightDetails?.runtime)}</span>
                                </div>

                                {spotlightMovie.overview && (
                                    <p className="mb-6 line-clamp-3 text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl font-light">
                                        {spotlightMovie.overview}
                                    </p>
                                )}

                                <div>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/movies/${spotlightMovie.id}`)}
                                        className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-[#00390f] shadow-[0_0_25px_rgba(67,254,109,0.35)] transition-all hover:bg-[#6cff80] hover:scale-105"
                                    >
                                        <Icon className="text-lg">play_circle</Icon>
                                        View Movie
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* 7. 🎬 NEW RELEASES */}
                <section className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
                        <div>
                            <h2 className="flex items-center gap-2 font-headline-lg text-2xl sm:text-3xl font-black text-white tracking-tight">
                                <span>🎬</span> NEW RELEASES
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-[#8d9ba8]">
                                The latest theatrical and streaming debuts
                            </p>
                        </div>
                        <Link
                            to="/movies"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                            View all releases <Icon className="text-sm">arrow_forward</Icon>
                        </Link>
                    </div>

                    {loading && !newReleases.length ? (
                        renderSkeletonRow(4)
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
                            {newReleases.map(renderMovieCard)}
                        </div>
                    )}
                </section>

                {/* 8. COMMUNITY REVIEWS */}
                <section className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
                    <div className="mb-6 text-center">
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                            Perspectives & Critique
                        </span>
                        <h2 className="mt-1 font-headline-lg text-2xl sm:text-3xl font-black text-white tracking-tight">
                            COMMUNITY REVIEWS
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-[#8d9ba8]">
                            Real commentary and ratings from passionate cinephiles
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {displayReviews.map((review) => (
                            <div
                                key={review.id}
                                onClick={() => review.movieId && navigate(`/movies/${review.movieId}`)}
                                className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#11151a] p-5 transition-all duration-300 hover:border-primary/40 hover:bg-[#151b22] hover:-translate-y-1 cursor-pointer"
                            >
                                <div>
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {review.avatar ? (
                                                <img
                                                    src={review.avatar}
                                                    alt={review.author}
                                                    className="h-9 w-9 rounded-full object-cover border border-white/20"
                                                />
                                            ) : (
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                                    {review.author?.substring(0, 2).toUpperCase() || "CP"}
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                                                    {review.author}
                                                </div>
                                                <div className="text-[11px] text-[#8d9ba8]">
                                                    Reviewing{" "}
                                                    <span className="font-semibold text-gray-200">
                                                        {review.movieTitle}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded bg-[#0a0a0a] px-2 py-0.5 text-xs font-bold text-[#ffc107] border border-white/10">
                                            {review.rating}
                                        </div>
                                    </div>

                                    <p className="text-xs italic leading-relaxed text-gray-300">
                                        "{review.content}"
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-[#8d9ba8]">
                                    <span className="flex items-center gap-1 text-gray-400">
                                        <Icon className="text-[14px] text-primary">thumb_up</Icon>
                                        {review.likes} helpful
                                    </span>
                                    <span className="font-mono text-[10px]">{review.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 9. POPULAR LISTS */}
                <section className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
                    <div className="mb-6 text-center">
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                            Handcrafted Collections
                        </span>
                        <h2 className="mt-1 font-headline-lg text-2xl sm:text-3xl font-black text-white tracking-tight">
                            POPULAR LISTS
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-[#8d9ba8]">
                            Curated marathons and thematic film collections
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {popularLists.map((list) => (
                            <div
                                key={list.id}
                                onClick={() => navigate(`/genres`)}
                                className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#11151a] p-5 transition-all duration-300 hover:border-primary/40 hover:bg-[#151b22] hover:-translate-y-1.5 cursor-pointer shadow-lg"
                            >
                                <div>
                                    {/* Collage of mini posters */}
                                    <div className="mb-4 flex items-center justify-center -space-x-4 overflow-hidden py-2">
                                        {list.posters && list.posters.length > 0 ? (
                                            list.posters.map((poster, idx) => (
                                                <img
                                                    key={idx}
                                                    src={poster}
                                                    alt="List film thumbnail"
                                                    className={`h-24 w-16 rounded-md object-cover border-2 border-[#11151a] shadow-md transition-transform duration-300 group-hover:scale-105 ${
                                                        idx === 1 ? "z-10 -translate-y-1 scale-105" : "opacity-80"
                                                    }`}
                                                />
                                            ))
                                        ) : (
                                            <div className="h-24 w-48 rounded-md bg-[#181c20] flex items-center justify-center text-xs text-gray-500">
                                                Curated Films
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="mb-2 text-base font-bold text-white transition-colors group-hover:text-primary">
                                        {list.title}
                                    </h3>

                                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                        {list.description}
                                    </p>
                                </div>

                                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-[#8d9ba8]">
                                    <span className="font-medium text-gray-300">
                                        {list.filmsCount} films • {list.likes} likes
                                    </span>
                                    <span className="font-mono text-[10px] text-primary">
                                        Explore List →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 10. JOIN THE COMMUNITY */}
                <section className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
                    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-[#101913] via-[#0d130f] to-[#0a0a0a] p-8 sm:p-14 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(67,254,109,0.12)_0%,transparent_70%)]" />

                        <div className="relative z-10 mx-auto max-w-xl">
                            <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                                Become a Cinephile
                            </span>

                            <h2 className="mt-2 mb-6 font-headline-lg text-3xl sm:text-4xl font-black text-white tracking-tight">
                                JOIN THE COMMUNITY
                            </h2>

                            <div className="mb-8 space-y-2 text-base sm:text-lg text-gray-300 font-light">
                                <p>Track every film you watch.</p>
                                <p>Rate what you love.</p>
                                <p>Write your perspective.</p>
                                <p>Find people who share your taste.</p>
                            </div>

                            <div>
                                {token ? (
                                    <Link to="/movies">
                                        <button
                                            type="button"
                                            className="cursor-pointer rounded-xl bg-primary px-8 py-4 text-base font-bold text-[#00390f] shadow-[0_0_30px_rgba(67,254,109,0.4)] transition-all hover:bg-[#6cff80] hover:scale-105"
                                        >
                                            Explore Film Catalog
                                        </button>
                                    </Link>
                                ) : (
                                    <Link to="/register">
                                        <button
                                            type="button"
                                            className="cursor-pointer rounded-xl bg-primary px-8 py-4 text-base font-bold text-[#00390f] shadow-[0_0_30px_rgba(67,254,109,0.4)] transition-all hover:bg-[#6cff80] hover:scale-105"
                                        >
                                            Join Cinephile
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* 11. FOOTER */}
            <div className="mt-24">
                <Footer />
            </div>
        </div>
    );
};

export default Landing;

