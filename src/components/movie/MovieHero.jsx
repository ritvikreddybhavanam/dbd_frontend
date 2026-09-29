import { Link } from "react-router-dom";

function MovieHero({
                       movie,
                       posterUrl,
                       backdropUrl,
                       runtime,
                       score,
                       myReview,
                       trailer,
                       isLiked,
                       likeLoading,
                       inWatchlist,
                       watchlistLoading,
                       isWatched,
                       watchedLoading,
                       onWatchTrailer,
                       onReview,
                       onLikeToggle,
                       onWatchlistToggle,
                       onWatchedToggle
                   }) {
    if (!movie) {
        return null;
    }

    const releaseYear =
        movie.release_date
            ? movie.release_date.substring(0, 4)
            : "N/A";

    return (
        <section className="relative min-h-[500px] md:min-h-[620px] overflow-hidden">

            {backdropUrl && (
                <img
                    src={backdropUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-[#070a0d] via-[#070a0d]/90 to-[#070a0d]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070a0d] via-transparent to-[#070a0d]/30" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16">

                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] gap-6 sm:gap-10 items-center">

                    <div className="w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] mx-auto">

                        {posterUrl ? (
                            <img
                                src={posterUrl}
                                alt={`${movie.title} Poster`}
                                className="w-full rounded-2xl shadow-2xl border border-[#212936]"
                            />
                        ) : (
                            <div className="aspect-[2/3] rounded-2xl bg-[#161c24] flex items-center justify-center text-gray-500">
                                No Image
                            </div>
                        )}

                    </div>

                    <div>

                        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">

                            {movie.genres?.map((genre) => (
                                <span
                                    key={genre.id}
                                    className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#00e054]/10 border border-[#00e054]/30 text-[#00e054] text-xs font-bold"
                                >
                                    {genre.name}
                                </span>
                            ))}

                        </div>

                        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-3 sm:mb-4">
                            {movie.title}
                        </h1>

                        {movie.tagline && (
                            <p className="text-gray-400 italic mb-4 text-sm sm:text-base">
                                {movie.tagline}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm text-gray-300 mb-5 sm:mb-6">

                            <span>
                                {releaseYear}
                            </span>

                            <span>•</span>

                            <span>
                                {runtime}
                            </span>

                            <span>•</span>

                            <span>
                                {movie.original_language
                                    ? movie.original_language.toUpperCase()
                                    : "N/A"}
                            </span>

                            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg bg-[#00e054] text-[#070a0d] font-black text-xs sm:text-sm">
                                ★ {score}
                            </span>

                        </div>

                        <p className="max-w-3xl text-gray-300 leading-relaxed sm:leading-7 mb-6 sm:mb-8 text-sm sm:text-base line-clamp-4 md:line-clamp-none">
                            {movie.overview ||
                                "No overview available."}
                        </p>

                        <div className="flex flex-wrap gap-2 sm:gap-3">

                            {trailer && (
                                <button
                                    type="button"
                                    onClick={onWatchTrailer}
                                    className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg bg-[#00e054] text-[#070a0d] text-xs sm:text-sm font-bold hover:bg-[#43fe6d] transition-all"
                                >
                                    ▶ Watch Trailer
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={onReview}
                                className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg bg-[#161c24] border border-[#303946] text-white text-xs sm:text-sm font-bold hover:border-[#00e054] hover:text-[#00e054] transition-colors"
                            >
                                Review
                            </button>

                            <Link
                                to={
                                    myReview
                                        ? `/write_review?movieId=${movie.id}&reviewId=${myReview.id}`
                                        : `/write_review?movieId=${movie.id}`
                                }
                                className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg bg-[#161c24] border border-[#303946] text-white text-xs sm:text-sm font-bold hover:border-[#00e054] hover:text-[#00e054] transition-colors inline-flex items-center"
                            >
                                {myReview
                                    ? "Already Reviewed"
                                    : "Write Review"}
                            </Link>

                            <button
                                type="button"
                                onClick={onLikeToggle}
                                disabled={likeLoading}
                                className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg border text-xs sm:text-sm font-bold transition-all ${
                                    isLiked
                                        ? "bg-[#00e054] border-[#00e054] text-[#070a0d] hover:bg-[#43fe6d]"
                                        : "bg-[#161c24] border-[#303946] text-white hover:border-[#00e054] hover:text-[#00e054]"
                                } ${
                                    likeLoading
                                        ? "opacity-60 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {likeLoading
                                    ? "Updating..."
                                    : isLiked
                                        ? "♥ Liked"
                                        : "♡ Like"}
                            </button>

                            <button
                                type="button"
                                onClick={onWatchlistToggle}
                                disabled={watchlistLoading}
                                className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg border text-xs sm:text-sm font-bold transition-all ${
                                    inWatchlist
                                        ? "bg-[#00e054] border-[#00e054] text-[#070a0d] hover:bg-[#43fe6d]"
                                        : "bg-[#161c24] border-[#303946] text-white hover:border-[#00e054] hover:text-[#00e054]"
                                } ${
                                    watchlistLoading
                                        ? "opacity-60 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {watchlistLoading
                                    ? "Updating..."
                                    : inWatchlist
                                        ? "✓ In Watchlist"
                                        : "+ Watchlist"}
                            </button>

                            <button
                                type="button"
                                onClick={onWatchedToggle}
                                disabled={watchedLoading}
                                className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg border text-xs sm:text-sm font-bold transition-all ${
                                    isWatched
                                        ? "bg-[#00e054] border-[#00e054] text-[#070a0d] hover:bg-[#43fe6d]"
                                        : "bg-[#161c24] border-[#303946] text-white hover:border-[#00e054] hover:text-[#00e054]"
                                } ${
                                    watchedLoading
                                        ? "opacity-60 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {watchedLoading
                                    ? "Updating..."
                                    : isWatched
                                        ? "✓ Watched"
                                        : "+ Mark as Watched"}
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}

export default MovieHero;