import { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { searchMovies } from "../../services/movieService.js";

function Navbar() {
    const { token, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [search, setSearch] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close mobile menu whenever the route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const navLinkClass = ({ isActive }) =>
        `relative font-body-md text-body-md no-underline transition-colors duration-200 ${
            isActive
                ? "text-primary after:absolute after:left-0 after:right-0 after:-bottom-[10px] after:h-[2px] after:bg-primary"
                : "text-on-surface-variant hover:text-primary"
        }`;

    const mobileNavLinkClass = ({ isActive }) =>
        `flex items-center px-4 py-3 rounded-lg font-body-md text-base transition-colors duration-200 ${
            isActive
                ? "bg-surface-container text-primary font-semibold"
                : "text-on-surface hover:bg-surface-container hover:text-primary"
        }`;

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        navigate("/login");
    };

    const performSearch = async (query) => {
        const movieName = query.trim();
        if (!movieName) return;

        try {
            const results = await searchMovies(movieName);
            if (results && results.results && results.results.length > 0) {
                const movie = results.results[0];
                navigate(`/movies/${movie.id}`);
                setSearch("");
                setMobileMenuOpen(false);
            } else {
                console.log("Movie not found");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSearch = async (e) => {
        if (e.key === "Enter") {
            performSearch(search);
        }
    };

    return (
        <nav className="sticky top-0 z-[1000] w-full border-b border-border-subtle bg-surface/95 backdrop-blur-md">
            <div className="mx-auto flex h-16 sm:h-20 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-12 xl:px-16">

                {/* Logo & Mobile Menu Toggle */}
                <div className="flex items-center gap-3">
                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        aria-label="Toggle menu"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-surface-container text-on-surface transition-colors hover:text-primary min-[901px]:hidden"
                    >
                        <span className="material-symbols-outlined text-[24px]">
                            {mobileMenuOpen ? "close" : "menu"}
                        </span>
                    </button>

                    {/* Logo */}
                    <Link
                        to="/"
                        className="whitespace-nowrap font-headline-lg text-[22px] font-bold tracking-[-0.02em] text-primary no-underline sm:text-[26px] min-[901px]:text-[32px]"
                    >
                        Cinephile 🎬
                    </Link>
                </div>

                {/* Main Navigation (Desktop) */}
                <div className="hidden items-center gap-[18px] min-[901px]:flex min-[1100px]:gap-8">
                    <NavLink to="/dashboard" className={navLinkClass}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/movies" className={navLinkClass}>
                        Movies
                    </NavLink>
                    <NavLink to="/genres" className={navLinkClass}>
                        Genres
                    </NavLink>
                    <NavLink to="/trending" className={navLinkClass}>
                        Trending
                    </NavLink>
                    <NavLink to="/box-prediction" className={navLinkClass}>
                        Box Prediction
                    </NavLink>
                    <NavLink to="/more" className={navLinkClass}>
                        More
                    </NavLink>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 sm:gap-4">

                    {/* Search Bar (Desktop) */}
                    <div className="relative hidden min-[901px]:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
                            search
                        </span>
                        <input
                            type="text"
                            value={search}
                            placeholder="Search Cinema"
                            className="h-10 w-[160px] rounded-full border border-border-subtle bg-surface-container pl-10 pr-4 font-body-md text-body-md text-on-surface outline-none transition-all duration-200 placeholder:text-on-surface-variant focus:w-[220px] focus:border-primary focus:ring-1 focus:ring-primary"
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>

                    {/* Favorites & Watchlist (Desktop/Tablet) */}
                    <div className="hidden items-center gap-3 min-[600px]:flex">
                        <NavLink to="/favorites" className={navLinkClass}>
                            Favorites
                        </NavLink>
                        <NavLink to="/watchlist" className={navLinkClass}>
                            Watchlist
                        </NavLink>
                    </div>

                    {/* Login / Logout */}
                    {token ? (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="hidden min-[600px]:inline-block ml-1 cursor-pointer border-none bg-transparent font-body-md text-body-md text-on-surface-variant transition-colors duration-200 hover:text-primary"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="hidden min-[600px]:inline-block ml-1 font-body-md text-body-md text-on-surface-variant no-underline transition-colors duration-200 hover:text-primary"
                        >
                            Login
                        </Link>
                    )}

                </div>

            </div>

            {/* Mobile Drawer Navigation */}
            {mobileMenuOpen && (
                <div className="min-[901px]:hidden border-t border-border-subtle bg-surface px-4 py-4 shadow-xl transition-all duration-300 ease-in-out">
                    {/* Mobile Search Bar */}
                    <div className="relative mb-4">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
                            search
                        </span>
                        <input
                            type="text"
                            value={search}
                            placeholder="Search movies..."
                            className="h-11 w-full rounded-xl border border-border-subtle bg-surface-container pl-10 pr-12 font-body-md text-base text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => performSearch(search)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-surface transition-opacity hover:opacity-90"
                            >
                                Go
                            </button>
                        )}
                    </div>

                    {/* Mobile Nav Links */}
                    <div className="flex flex-col gap-1">
                        <NavLink to="/dashboard" className={mobileNavLinkClass}>
                            <span className="material-symbols-outlined mr-3 text-[20px]">dashboard</span>
                            Dashboard
                        </NavLink>
                        <NavLink to="/movies" className={mobileNavLinkClass}>
                            <span className="material-symbols-outlined mr-3 text-[20px]">movie</span>
                            Movies
                        </NavLink>
                        <NavLink to="/genres" className={mobileNavLinkClass}>
                            <span className="material-symbols-outlined mr-3 text-[20px]">category</span>
                            Genres
                        </NavLink>
                        <NavLink to="/trending" className={mobileNavLinkClass}>
                            <span className="material-symbols-outlined mr-3 text-[20px]">trending_up</span>
                            Trending
                        </NavLink>
                        <NavLink to="/box-prediction" className={mobileNavLinkClass}>
                            <span className="material-symbols-outlined mr-3 text-[20px]">insights</span>
                            Box Prediction
                        </NavLink>
                        <NavLink to="/favorites" className={mobileNavLinkClass}>
                            <span className="material-symbols-outlined mr-3 text-[20px]">favorite</span>
                            Favorites
                        </NavLink>
                        <NavLink to="/watchlist" className={mobileNavLinkClass}>
                            <span className="material-symbols-outlined mr-3 text-[20px]">bookmark</span>
                            Watchlist
                        </NavLink>
                        <NavLink to="/more" className={mobileNavLinkClass}>
                            <span className="material-symbols-outlined mr-3 text-[20px]">more_horiz</span>
                            More
                        </NavLink>

                        <div className="my-2 border-t border-border-subtle"></div>

                        {token ? (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center px-4 py-3 rounded-lg font-body-md text-base text-red-400 hover:bg-surface-container transition-colors"
                            >
                                <span className="material-symbols-outlined mr-3 text-[20px]">logout</span>
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center px-4 py-3 rounded-lg font-body-md text-base text-primary hover:bg-surface-container transition-colors"
                            >
                                <span className="material-symbols-outlined mr-3 text-[20px]">login</span>
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;