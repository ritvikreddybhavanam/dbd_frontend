import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import DirectoryTile from "../../components/common/DirectoryTile";

function More() {
    const directoryItems = [
        {
            title: "Movies",
            to: "/movies"
        },
        {
            title: "Genres",
            to: "/genres"
        },
        {
            title: "Trending",
            to: "/trending"
        },
        {
            title: "Box Prediction",
            to: "/box-prediction"
        },
        {
            title: "Favorites",
            to: "/favorites"
        },
        {
            title: "Watchlist",
            to: "/watchlist"
        },
        {
            title: "Watched Films",
            to: "/mywatchedfilms"
        },
        {
            title: "My Reviews",
            to: "/myreviews"
        },
        {
            title: "List",
            to: "/lists"
        },
        {
            title: "People",
            to: "/people"
        },
        {
            title: "Movies By Languages",
            to: "/movies-by-languages"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#101418] text-neutral-200 antialiased">
            <Navbar />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 flex flex-col justify-center">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Directory & Navigation
                    </h1>
                    <p className="mt-1 text-sm text-[#99AABB]">
                        Explore all areas of your Cinephile film archive and community tools.
                    </p>
                </div>

                <div className="w-full flex flex-col space-y-3 sm:space-y-4">
                    {directoryItems.map((item) => (
                        <DirectoryTile
                            key={item.title}
                            title={item.title}
                            to={item.to}
                        />
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default More;