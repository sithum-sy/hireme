import React from "react";
import PublicLayout from "../components/layouts/PublicLayout";
import HeroSection from "../components/landingPage/HeroSection";
import ServicesSection from "../components/landingPage/ServicesSection";
import FeaturesSection from "../components/landingPage/FeaturesSection";
import TestimonialsSection from "../components/landingPage/TestimonialsSection";
import StatsSection from "../components/landingPage/StatsSection";
import CTASection from "../components/landingPage/CTASection";

export default function Landing() {
    return (
        <PublicLayout navbarVariant="transparent" footerVariant="dark">
            <div className="landing-page full-width">
                <HeroSection />
                <ServicesSection />
                <FeaturesSection />
                <TestimonialsSection />
                <StatsSection />
                <CTASection />
            </div>
        </PublicLayout>
    );
}
