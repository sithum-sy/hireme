import React from "react";
import Navbar from "../components/landingPage/Navbar";
import HeroSection from "../components/landingPage/HeroSection";
import HowItWorks from "../components/landingPage/HowItWorks";
import ReviewsCarousel from "../components/landingPage/ReviewsCarousel";
import StatsSection from "../components/landingPage/StatsSection";
import Footer from "../components/landingPage/Footer";

export default function Landing() {
    return (
        <>
            <Navbar />
            <main>
                <HeroSection />
                <HowItWorks />
                <ReviewsCarousel />
                <StatsSection />
            </main>
            <Footer />
        </>
    );
}
