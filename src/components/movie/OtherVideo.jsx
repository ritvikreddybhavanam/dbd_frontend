function OtherVideo({
                        video,
                        movieTitle
                    }) {
    if (!video) {
        return null;
    }

    return (
        <div className="group w-[260px] overflow-hidden rounded-xl border border-[#212936] bg-[#161c24] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#00e054] hover:shadow-[0_10px_30px_rgba(0,224,84,0.12)]">

            <div className="relative aspect-video w-full bg-black">

                <iframe
                    src={`https://www.youtube.com/embed/${video.key}?rel=0`}
                    title={`${movieTitle} - ${video.name}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />

            </div>

            <div className="p-4">

                <div className="flex items-center gap-2 mb-2">

                    <span className="text-[11px] uppercase tracking-wider font-bold text-[#00e054]">
                        {video.type}
                    </span>

                    {video.official && (
                        <span className="text-[10px] px-2 py-1 rounded-full bg-[#00e054]/10 text-[#00e054]">
                            Official
                        </span>
                    )}

                </div>

                <h3 className="text-sm font-semibold text-white leading-5 line-clamp-2 group-hover:text-[#00e054] transition-colors">
                    {video.name}
                </h3>

            </div>

        </div>
    );
}

export default OtherVideo;