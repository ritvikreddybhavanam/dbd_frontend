import { Link } from "react-router-dom";

function LanguageTile({ title, to, imageUrl }) {
    return (
        <Link
            to={to}
            className="group relative block aspect-square w-full overflow-hidden rounded-lg border border-neutral-800 bg-[#181c20] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00e054]/50"
        >
            <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="text-lg font-semibold tracking-wide text-white md:text-xl">
                    {title}
                </span>
            </div>
        </Link>
    );
}

export default LanguageTile;