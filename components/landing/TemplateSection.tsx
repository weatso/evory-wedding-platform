"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import PhoneFrame from "./PhoneFrame";

export interface TemplateItem {
    id: string;
    name: string;
    desc: string;
    previewText: string;
    bgColor: string; // Background color for the phone screen
    textColor?: string;
}

export interface TemplateCategory {
    id: string;
    title: string; // e.g. "TRADITIONAL SERIES"
    description: string; // Generic description for the category
    items: TemplateItem[];
}

interface TemplateSectionProps {
    category: TemplateCategory;
    index: number;
}

export default function TemplateSection({ category, index }: TemplateSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    const activeTemplate = category.items[activeIndex];

    // Handle Carousel Scroll
    const scrollToIndex = (idx: number) => {
        if (carouselRef.current) {
            const width = carouselRef.current.clientWidth;
            carouselRef.current.scrollTo({
                left: idx * width,
                behavior: "smooth"
            });
        }
        setActiveIndex(idx);
    };

    // Detect manual scroll in phone carousel to update text
    const handleScroll = () => {
        if (carouselRef.current) {
            const width = carouselRef.current.clientWidth;
            const scrollPos = carouselRef.current.scrollLeft;
            const newIndex = Math.round(scrollPos / width);
            if (newIndex !== activeIndex && newIndex >= 0 && newIndex < category.items.length) {
                setActiveIndex(newIndex);
            }
        }
    };

    return (
        <section className="min-h-screen w-full flex flex-col lg:flex-row items-center justify-center p-6 lg:p-24 border-b border-white/5 relative">

            {/* LEFT: PHONE FRAME (SMALLER NOW) */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative order-1 lg:order-1 mb-10 lg:mb-0">
                {/* Decorative Background behind phone */}
                <div className="absolute inset-0 bg-gradient-to-tr from-evory-gold/5 to-transparent opacity-30 blur-[60px] rounded-full pointer-events-none" />

                {/* Phone Container - Scaled Down */}
                <div className="relative w-[280px] h-[580px] lg:w-[320px] lg:h-[650px] transition-all duration-500 hover:scale-[1.02]">
                    <PhoneFrame className="w-full h-full shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]">

                        {/* CAROUSEL INSIDE PHONE */}
                        <div
                            ref={carouselRef}
                            onScroll={handleScroll}
                            className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {category.items.map((item, i) => (
                                <div
                                    key={item.id}
                                    className={`w-full h-full flex-shrink-0 flex flex-col items-center justify-center snap-center relative ${item.bgColor}`}
                                    onClick={() => scrollToIndex((i + 1) % category.items.length)} // Simple tap to next for UX
                                >
                                    <h3 className={`text-4xl lg:text-5xl font-serif font-bold opacity-30 ${item.textColor || 'text-white'}`}>
                                        {item.previewText}
                                    </h3>
                                    <p className={`mt-4 text-[10px] uppercase tracking-widest font-semibold opacity-60 ${item.textColor || 'text-white'}`}>
                                        {item.name}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Carousel Indicators Inside Phone */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-30">
                            {category.items.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-white w-4' : 'bg-white/30'}`}
                                />
                            ))}
                        </div>

                    </PhoneFrame>
                </div>

                {/* Mobile Hint */}
                <p className="mt-6 text-evory-grey text-xs lg:hidden flex items-center gap-2">
                    <ArrowLeft size={12} /> Swipe phone to browse <ArrowRight size={12} />
                </p>
            </div>

            {/* RIGHT: TEXT DETAILS */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-start lg:pl-16 order-2 lg:order-2 text-white">
                <div className="mb-2 flex items-center gap-3">
                    <span className="h-px w-8 bg-evory-gold"></span>
                    <span className="text-evory-gold text-xs tracking-[0.2em] uppercase font-bold">
                        {category.title}
                    </span>
                </div>

                <div className="h-[200px] lg:h-[250px] relative w-full"> {/* Height wrapper for simple transition */}
                    {/* Animated Text Switcher */}
                    <div key={activeTemplate.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 absolute inset-0">
                        <h2 className="text-4xl lg:text-7xl font-serif text-white mb-6 leading-tight">
                            {activeTemplate.name}
                        </h2>
                        <p className="text-gray-400 text-sm lg:text-lg leading-relaxed font-light mb-8 max-w-md">
                            {activeTemplate.desc}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link href={`/portfolio/${activeTemplate.id}`}>
                                <Button variant="outline" className="rounded-full border-white/20 hover:bg-white hover:text-black hover:border-white transition-all px-8">
                                    View Demo {activeTemplate.previewText}
                                </Button>
                            </Link>
                            {/* Navigation Buttons for Desktop */}
                            <div className="hidden lg:flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full border border-white/10 hover:bg-white/10"
                                    onClick={() => scrollToIndex(activeIndex === 0 ? category.items.length - 1 : activeIndex - 1)}
                                >
                                    <ArrowLeft size={16} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full border border-white/10 hover:bg-white/10"
                                    onClick={() => scrollToIndex((activeIndex + 1) % category.items.length)}
                                >
                                    <ArrowRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Description REMOVED */}
                <div className="mt-20 pt-8 border-t border-white/10 w-full opacity-50 hidden">
                </div>
            </div>

        </section>
    );
}
