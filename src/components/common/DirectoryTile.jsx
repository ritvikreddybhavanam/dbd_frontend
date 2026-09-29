import { Link } from "react-router-dom";

function DirectoryTile({ title, to }) {
    return (
        <Link
            to={to}
            className="group relative flex min-h-[52px] sm:min-h-[60px] w-full items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#181c20] px-4 py-3 sm:py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00e054]/50 hover:bg-[#1c2126]"
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between w-full">
                <span className="text-base font-semibold tracking-wide text-white sm:text-lg md:text-xl group-hover:text-[#43fe6d] transition-colors">
                    {title}
                </span>

                <span className="material-symbols-outlined text-[#99AABB] text-[20px] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#43fe6d]">
                    chevron_right
                </span>
            </div>
        </Link>
    );
}

export default DirectoryTile;