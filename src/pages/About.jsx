import React from "react";

export default function About() {
    return (
        <div className="min-h-screen bg-[#212121] overflow-x-hidden">
            <div className="flex flex-col h-full gap-2 mx-auto px-20 py-10 max-sm:p-10">

                <p className="text-white text-[32px] font-bold leading-tight drop-shadow-lg pb-6">
                    About CineSearch
                </p>

                <section className="pb-6">
                    <h3 className="text-white text-lg font-bold pb-2">
                        Our Mission
                    </h3>
                    <p className="text-white text-base leading-relaxed">
                        At CineSearch, our mission is to connect movie enthusiasts with the films they'll love. We strive to provide a comprehensive and user-friendly platform for discovering new movies, exploring different genres, and learning more about the world of cinema. Our goal is to enhance the movie-watching experience by making it easier to find and enjoy great films.
                    </p>
                </section>

                <section>
                    <h3 className="text-white text-lg font-bold pb-2">
                        Our Story
                    </h3>
                    <p className="text-white text-base leading-relaxed">
                        CineSearch was founded in 2025 by a film lover who wanted to create a better way to explore movies. We started with a simple idea: to build a platform that combines a vast database of films with intuitive search and discovery tools. Over the years, the platform has grown into a thriving community of movie buffs, constantly improving our platform to meet the needs of our users.
                    </p>
                </section>
            </div>
        </div>
    );
}
