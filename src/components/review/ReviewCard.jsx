import { Link } from "react-router-dom";

function ReviewCard({ review, onEdit, onDelete }) {
    return (
        <article className="rounded-xl border border-white/10 bg-[#181c20] p-4 sm:p-6 transition-colors hover:border-[#00e054]/40">

            <div className="mb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                <div className="min-w-0 flex-1">

                    <Link
                        to={`/movies/${review.movieId}`}
                        className="text-lg sm:text-xl font-bold text-white transition-colors hover:text-[#00e054] block truncate"
                    >
                        {review.title}

                        {review.year && (
                            <span className="ml-2 text-sm font-normal text-slate-400">
                                ({review.year})
                            </span>
                        )}
                    </Link>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">

                        <div className="flex text-sm text-[#eab308]">
                            {review.stars}
                        </div>

                        <span className="text-xs font-semibold text-slate-300">
                            {review.rating} / 5
                        </span>

                        {review.reviewedDate && (
                            <span className="text-xs text-slate-500">
                                • Reviewed {review.reviewedDate}
                            </span>
                        )}

                    </div>

                </div>

                {onDelete && (
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                            type="button"
                            onClick={() => onDelete(review.id)}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                            title="Delete review"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                delete
                            </span>
                        </button>
                    </div>
                )}

            </div>

            <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                {review.review}
            </p>

        </article>
    );
}

export default ReviewCard;