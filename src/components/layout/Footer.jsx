import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="w-full border-t border-[#262626] bg-[#0b0d0f]">
            <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 px-4 py-8 text-center sm:px-6 md:flex-row md:text-left lg:px-12 xl:px-16">

                <div className="footer-brand-section">
                    <Link
                        to="/"
                        className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#43fe6d] no-underline sm:text-[28px] md:text-[32px]"
                    >
                        Cinephile 🎬
                    </Link>

                    <p className="mt-1 font-['Inter'] text-sm text-[#a0a0a0] sm:text-base">
                        © 2026 Cinephile 🎬. All rights reserved.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 text-sm sm:gap-6 sm:text-base md:gap-8">
                    <Link
                        to="/about"
                        className="font-['Inter'] text-[#a0a0a0] no-underline transition-colors duration-200 hover:text-[#e0e3e8]"
                    >
                        About Us
                    </Link>

                    <Link
                        to="/community"
                        className="font-['Inter'] text-[#a0a0a0] no-underline transition-colors duration-200 hover:text-[#e0e3e8]"
                    >
                        Community
                    </Link>

                    <Link
                        to="/privacy"
                        className="font-['Inter'] text-[#a0a0a0] no-underline transition-colors duration-200 hover:text-[#e0e3e8]"
                    >
                        Privacy Policy
                    </Link>

                    <Link
                        to="/terms"
                        className="font-['Inter'] text-[#a0a0a0] no-underline transition-colors duration-200 hover:text-[#e0e3e8]"
                    >
                        Terms of Service
                    </Link>
                </div>

            </div>
        </footer>
    );
}

export default Footer;
