import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import DirectoryTile from "../../../components/common/DirectoryTile.jsx";

import { useEffect, useState } from "react";
import {
    getLanguages,
    getTopMovieLanguage
} from "../../../services/movieService.js";

import moviePlaceholder from "../../../assets/images/image2.png";
import MovieTile from "../../../components/movie/MovieTile.jsx";
import LanguageTile from "../../../components/common/LanguageTile.jsx";

function MoviesLanguage() {

    const [languages, setLanguages] = useState([]);
    const [movies, setMovies] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {

        const fetchLanguages = async () => {

            try {

                const data = await getLanguages();

                setLanguages(data);

                const movieData = {};

                for (const language of data) {

                    try {

                        const response =
                            await getTopMovieLanguage(
                                language.iso_639_1
                            );

                        if (
                            response?.results &&
                            response.results.length > 0
                        ) {
                            movieData[language.iso_639_1] =
                                response.results[0];
                        }

                    } catch (error) {

                        console.error(
                            `Failed to fetch ${language.english_name}:`,
                            error
                        );

                    }
                }

                setMovies(movieData);

            } catch (error) {

                console.error(
                    "Failed to fetch languages:",
                    error
                );

            }
        };

        fetchLanguages();

    }, []);

    const filteredLanguages = languages.filter((language) =>
        language.english_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col bg-[#101418] text-neutral-200 antialiased">

            <Navbar />

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10">

                <div className="mb-6 sm:mb-8">

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-2">
                        Movies by Language
                    </h1>

                    <p className="text-sm sm:text-base text-neutral-400">
                        Explore movies from different languages.
                    </p>

                </div>

                <div className="relative mb-6 sm:mb-8">

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        placeholder="Search languages..."
                        className="w-full bg-[#181c20] border border-neutral-800 rounded-lg px-4 sm:px-5 py-3 pr-12 text-sm sm:text-base text-neutral-200 placeholder-neutral-500 outline-none transition-all duration-200 focus:border-[#00e054]/60 focus:ring-1 focus:ring-[#00e054]/30"
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                        >
                            ×
                        </button>
                    )}

                </div>

                {filteredLanguages.length > 0 ? (

                    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">

                        {filteredLanguages.map((item) => {

                            const movie =
                                movies[item.iso_639_1];

                            const imageUrl =
                                movie?.poster_path
                                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                    : moviePlaceholder;

                            return (
                                <LanguageTile
                                    key={item.iso_639_1}
                                    title={item.english_name}
                                    to={`/movies?language=${item.iso_639_1}`}
                                    imageUrl={imageUrl}
                                />
                            );
                        })}

                    </div>

                ) : (

                    <div className="py-20 text-center">

                        <p className="text-lg text-neutral-400">
                            No languages found.
                        </p>

                        <button
                            onClick={() => setSearchTerm("")}
                            className="mt-4 text-[#00e054] hover:text-[#43fe6d] transition-colors"
                        >
                            Clear search
                        </button>

                    </div>

                )}

            </main>

            <Footer />

        </div>
    );
}

export default MoviesLanguage;