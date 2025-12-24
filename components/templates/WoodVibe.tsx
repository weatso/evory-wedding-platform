'use client';

import { useState } from "react";
import { submitRsvp } from "@/app/invitation/actions";
import { useCountdown, useAudio } from "@/hooks/use-wedding";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Play, Pause, MapPin, Calendar, Clock, Check, Copy } from "lucide-react";
import Image from "next/image";

// --- TIPE DATA ---
type InvitationProps = {
    invitation: any;
    guest: any | null;
};

export default function WoodVibe({ invitation, guest }: InvitationProps) {
    // 1. HOOKS (Logika Musik & Waktu)
    const { days, hours, minutes, seconds } = useCountdown(invitation.eventDate);

    // Pastikan file ini ada di public/music/acoustic.mp3
    const audio = useAudio("/music/acoustic.mp3");

    // 2. STATE UTAMA
    const [isOpen, setIsOpen] = useState(false);

    // Handler Buka Undangan
    const handleOpen = () => {
        setIsOpen(true);
        audio.play();
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-serif relative overflow-hidden scroll-smooth">

            {/* --- TOMBOL MUSIK MELAYANG --- */}
            {isOpen && (
                <button
                    onClick={audio.toggle}
                    className="fixed bottom-6 right-6 z-50 bg-amber-800 text-white p-3 rounded-full shadow-lg hover:bg-amber-900 border-2 border-white/20 transition-all hover:scale-110"
                >
                    {audio.isPlaying ? <Pause className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5 ml-1" />}
                </button>
            )}

            {/* =========================== */}
            {/* 1. COVER DEPAN (MODAL)      */}
            {/* =========================== */}
            {!isOpen && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-900 text-white">
                    {/* Background Gambar Cover */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605116790967-a5eb1035987a?q=80&w=1000')] bg-cover bg-center opacity-50" />

                    <div className="relative z-10 text-center space-y-8 animate-in zoom-in duration-700 px-4">
                        <p className="tracking-[0.3em] text-xs uppercase text-amber-100/80">The Wedding of</p>
                        <h1 className="text-5xl md:text-7xl text-amber-100 font-medium font-serif">
                            {invitation.groomNick} & {invitation.brideNick}
                        </h1>

                        <div className="py-6 px-10 border-y border-white/20 bg-black/20 backdrop-blur-sm rounded-lg mx-auto max-w-sm">
                            <p className="text-xs mb-2 text-stone-300 uppercase tracking-widest">Kepada Yth:</p>
                            <h2 className="text-2xl font-bold mb-1">{guest?.name || "Tamu Undangan"}</h2>
                            {guest?.category && <span className="text-[10px] bg-white/20 px-2 py-1 rounded text-white">{guest.category}</span>}
                        </div>

                        <Button
                            onClick={handleOpen}
                            className="bg-amber-700 hover:bg-amber-600 text-white rounded-full px-8 py-6 text-sm uppercase tracking-widest shadow-xl transition-transform hover:scale-105"
                        >
                            Buka Undangan
                        </Button>
                    </div>
                </div>
            )}

            {/* =========================== */}
            {/* 2. KONTEN UTAMA (ISI)       */}
            {/* =========================== */}

            {/* HERO SECTION */}
            <section className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/30 rounded-bl-full -z-10 blur-3xl" />

                <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-1000">
                    <p className="italic text-stone-500 font-sans text-sm">We invite you to celebrate our wedding</p>
                    <h2 className="text-4xl md:text-6xl text-amber-900 font-medium">
                        {invitation.groomName} <br />
                        <span className="text-2xl text-stone-400 font-sans my-4 block">&</span>
                        {invitation.brideName}
                    </h2>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-stone-600 font-sans text-sm mt-8 border-t border-stone-200 pt-8 w-fit mx-auto px-10">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-700" />
                            <span>{new Date(invitation.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <span className="hidden md:block text-stone-300">|</span>

                        {/* UPDATE: Jam Acara Dinamis */}
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-700" />
                            <span>{invitation.eventTime} - Selesai</span>
                        </div>
                        <span className="hidden md:block text-stone-300">|</span>

                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-amber-700" />
                            <span>{invitation.location}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* QUOTE / AYAT */}
            <section className="py-24 px-8 text-center bg-white border-y border-stone-100">
                <div className="max-w-2xl mx-auto space-y-6">
                    <p className="font-serif text-xl md:text-2xl text-stone-700 leading-relaxed italic">
                        "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya."
                    </p>
                    <div className="w-16 h-1 bg-amber-800 mx-auto rounded-full" />
                    <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">QS. Ar-Rum: 21</p>
                </div>
            </section>

            {/* COUNTDOWN */}
            <section className="py-20 bg-amber-900 text-amber-50">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h3 className="text-lg mb-10 font-sans uppercase tracking-[0.2em] text-amber-200/80">Menuju Bahagia</h3>
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                        <CountdownBox value={days} label="Hari" />
                        <CountdownBox value={hours} label="Jam" />
                        <CountdownBox value={minutes} label="Menit" />
                        <CountdownBox value={seconds} label="Detik" />
                    </div>
                </div>
            </section>

            {/* GALLERY */}
            <GallerySection />

            {/* GIFT (AMPLOP) */}
            <GiftSection invitation={invitation} />

            {/* RSVP FORM */}
            <section className="py-24 px-6 max-w-lg mx-auto bg-[#FDFBF7]">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-stone-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-700 to-amber-900" />
                    <h3 className="text-2xl text-center mb-2 text-amber-900 font-bold">Konfirmasi Kehadiran</h3>
                    <p className="text-center text-stone-500 text-sm mb-8">Mohon isi data di bawah ini untuk konfirmasi.</p>

                    {guest ? (
                        <RsvpForm guest={guest} />
                    ) : (
                        <div className="text-center p-6 bg-stone-50 rounded-lg border border-dashed border-stone-300">
                            <p className="text-stone-500 text-sm">Preview Mode: Form RSVP aktif saat diakses melalui link tamu.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* UPDATE: WISHES SECTION (PAPAN UCAPAN) */}
            <WishesSection wishes={invitation.wishes || []} />

            <footer className="py-12 text-center text-[10px] text-stone-400 font-sans bg-stone-900 uppercase tracking-widest">
                <p className="mb-2">Wedding of {invitation.groomNick} & {invitation.brideNick}</p>
                <p>Powered by <span className="text-amber-500 font-bold">WebNikah</span></p>
            </footer>
        </div>
    );
}

// ==========================================
// SUB-COMPONENTS (Components Kecil)
// ==========================================

function CountdownBox({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center bg-white/10 border border-white/20 p-4 rounded-lg w-20 md:w-24 backdrop-blur-sm">
            <span className="text-2xl md:text-3xl font-bold font-sans">{value}</span>
            <span className="text-[10px] uppercase tracking-wider mt-1 opacity-70">{label}</span>
        </div>
    );
}

function GallerySection() {
    const photos = [
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=600&auto=format&fit=crop"
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 text-center mb-10">
                <p className="text-amber-800 tracking-[0.2em] text-xs uppercase mb-2">Our Moments</p>
                <h3 className="font-serif text-3xl md:text-4xl text-stone-800">Gallery Prewedding</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 px-4 md:px-8">
                {photos.map((url, idx) => (
                    <div key={idx} className={`relative overflow-hidden rounded-lg group ${idx === 0 || idx === 3 ? 'col-span-2 row-span-2' : ''}`}>
                        <Image
                            src={url}
                            alt={`Gallery ${idx}`}
                            width={400} height={600}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                ))}
            </div>
        </section>
    );
}

function GiftSection({ invitation }: { invitation: any }) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const bankAccounts = [
        { bank: "BCA", name: invitation.groomName, number: "1234567890" },
        { bank: "DANA", name: invitation.brideName, number: "08123456789" },
    ];

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <section className="py-20 px-6 bg-[#FDFBF7] border-t border-stone-200">
            <div className="max-w-md mx-auto text-center space-y-8">
                <div className="space-y-2">
                    <h3 className="font-serif text-3xl text-amber-900">Wedding Gift</h3>
                    <p className="text-sm text-stone-500 font-sans leading-relaxed">
                        Doa restu Anda merupakan karunia yang sangat berarti bagi kami.
                        Dan jika memberi adalah ungkapan tanda kasih Anda, kami menerima kado secara cashless.
                    </p>
                </div>

                <div className="space-y-4">
                    {bankAccounts.map((acc, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-center gap-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10"><Copy className="w-12 h-12 text-stone-300" /></div>
                            <div className="font-bold text-stone-400 tracking-widest uppercase text-xs border-b border-stone-100 pb-2 w-full text-center">{acc.bank}</div>
                            <div className="text-2xl font-mono text-stone-800 tracking-tighter my-2">{acc.number}</div>
                            <div className="text-sm text-stone-500">a.n {acc.name}</div>

                            <Button
                                onClick={() => handleCopy(acc.number, idx)}
                                variant="outline"
                                size="sm"
                                className={`mt-4 w-full text-xs transition-colors ${copiedIndex === idx ? 'bg-green-50 text-green-700 border-green-200' : 'border-amber-200 text-amber-800 hover:bg-amber-50'}`}
                            >
                                {copiedIndex === idx ? <><Check className="w-3 h-3 mr-2" /> Berhasil Disalin</> : "Salin Nomor Rekening"}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function WishesSection({ wishes }: { wishes: any[] }) {
    if (!wishes || wishes.length === 0) return null;

    return (
        <section className="py-20 px-6 bg-white border-t border-stone-100">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <p className="text-amber-800 tracking-[0.2em] text-xs uppercase mb-2">Prayers & Wishes</p>
                    <h3 className="font-serif text-3xl text-stone-800">Doa Restu</h3>
                </div>

                <div className="bg-[#FDFBF7] border border-stone-200 rounded-xl p-6 h-80 overflow-y-auto space-y-4 shadow-inner scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
                    {wishes.map((wish, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-xs">
                                    {wish.guest?.name?.charAt(0) || "G"}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-stone-800">{wish.guest?.name || "Tamu Undangan"}</p>
                                    <p className="text-[10px] text-stone-400">{new Date(wish.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <p className="text-stone-600 text-sm font-serif italic leading-relaxed">
                                "{wish.message}"
                            </p>
                        </div>
                    ))}
                </div>
                <p className="text-center text-[10px] text-stone-400 mt-4">
                    *Ucapan ditampilkan dari tamu yang telah mengisi RSVP
                </p>
            </div>
        </section>
    );
}

function RsvpForm({ guest }: { guest: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDone, setIsDone] = useState(guest?.rsvpStatus === 'ATTENDING' || guest?.rsvpStatus === 'DECLINED');

    if (isDone) {
        return (
            <div className="text-center py-8 space-y-3 bg-green-50 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-green-800 text-lg">Terima Kasih!</h4>
                <p className="text-green-600 text-sm px-4">
                    Konfirmasi kehadiran Anda telah kami terima.<br />Sampai jumpa di hari bahagia kami.
                </p>
            </div>
        );
    }

    return (
        <form
            action={async (formData) => {
                setIsSubmitting(true);
                await submitRsvp(formData);
                setIsDone(true);
                setIsSubmitting(false);
            }}
            className="space-y-5"
        >
            <input type="hidden" name="guestId" value={guest.id} />

            <div className="space-y-1">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Nama Tamu</label>
                <Input value={guest.name} disabled className="bg-stone-50 border-stone-200 text-stone-600 font-sans" />
            </div>

            <div className="space-y-3">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Kehadiran</label>
                <div className="flex gap-3">
                    <label className="flex items-center justify-center gap-2 border border-stone-200 p-3 rounded-lg flex-1 cursor-pointer has-checked:bg-amber-50 has-checked:border-amber-500 has-checked:text-amber-900 transition-all hover:bg-stone-50 bg-white">
                        <input type="radio" name="status" value="ATTENDING" required className="accent-amber-600 w-4 h-4" />
                        <span className="text-sm font-medium">Hadir</span>
                    </label>
                    <label className="flex items-center justify-center gap-2 border border-stone-200 p-3 rounded-lg flex-1 cursor-pointer has-checked:bg-stone-100 has-checked:border-stone-400 has-checked:text-stone-600 transition-all hover:bg-stone-50 bg-white">
                        <input type="radio" name="status" value="DECLINED" required className="accent-stone-600 w-4 h-4" />
                        <span className="text-sm font-medium">Maaf, Absen</span>
                    </label>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Jumlah Tamu</label>
                <select name="pax" className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                    <option value="1">1 Orang</option>
                    <option value="2">2 Orang</option>
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Ucapan & Doa</label>
                <Textarea name="message" placeholder="Tulis doa restu Anda..." className="bg-white border-stone-200 font-sans min-h-[100px]" />
            </div>

            <Button className="w-full bg-amber-800 hover:bg-amber-900 text-white py-6 text-sm uppercase tracking-widest shadow-lg" disabled={isSubmitting}>
                {isSubmitting ? "Mengirim..." : "Kirim Konfirmasi"}
            </Button>
        </form>
    )
}