import React from "react";
import PublicLayout from "../components/layouts/PublicLayout";
import HeroSection from "../components/landingPage/HeroSection";
import HowItWorks from "../components/landingPage/HowItWorks";
import ReviewsCarousel from "../components/landingPage/ReviewsCarousel";
import StatsSection from "../components/landingPage/StatsSection";

export default function Landing() {
    return (
        <PublicLayout navbarVariant="transparent" footerVariant="dark">
            <HeroSection />
            <HowItWorks />
            <ReviewsCarousel />
            <StatsSection />
        </PublicLayout>
    );
}
