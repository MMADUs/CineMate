import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { TrailerModal } from '../../components/modals/TrailerModal'; 
import { Breadcrumbs } from '../../components/layout/Breadcrumbs'; 

// Import Hooks
import { useGetPublicMovieDetails, type PublicMovieDetails } from '../../api/hooks/User/useGetPublicMovieDetails';
import { useGetPublicShowtimes, type PublicShowtime } from '../../api/hooks/User/useGetPublicShowtimes';

// KAMUS DATA 
const HALL_MAPPING: Record<number, { location: string; studioName: string }> = {
    1: { location: "CGV Grand Indonesia", studioName: "Studio 1" },
    2: { location: "CGV Grand Indonesia", studioName: "Studio 2" },
    4: { location: "Alam Sutera XXI", studioName: "Studio 1" },
    5: { location: "Alam Sutera XXI", studioName: "Studio 2" },
};

export const MovieDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate(); 
    
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');

    // 1. Tembak 2 API secara paralel
    const { data: rawMovieData, isLoading: isMovieLoading, isError } = useGetPublicMovieDetails(id);
    const { data: rawShowtimesData, isLoading: isShowtimesLoading } = useGetPublicShowtimes(id);

    useEffect(() => {
        const scrollTimer = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 10);
        return () => clearTimeout(scrollTimer);
    }, [id]);

    // Ekstraksi Data Film
    const movie = useMemo(() => {
        if (!rawMovieData) return null;
        let safeData: PublicMovieDetails = rawMovieData;
        
        if ('data' in rawMovieData && typeof rawMovieData === 'object') {
            const wrapped = (rawMovieData as unknown as { data: PublicMovieDetails }).data;
            if (wrapped && typeof wrapped === 'object') {
                safeData = wrapped;
            }
        }
        return safeData;
    }, [rawMovieData]);

    // 2. Ekstraksi Data Showtimes dari API Baru
    const safeShowtimes = useMemo(() => {
        if (!rawShowtimesData) return [];
        let safeData: PublicShowtime[] = [];
        
        if (Array.isArray(rawShowtimesData)) {
            safeData = rawShowtimesData;
        } else if (typeof rawShowtimesData === 'object' && 'data' in rawShowtimesData) {
            const wrapped = (rawShowtimesData as unknown as { data: PublicShowtime[] }).data;
            if (Array.isArray(wrapped)) safeData = wrapped;
        }
        return safeData;
    }, [rawShowtimesData]);

    // Ambil tanggal unik dari safeShowtimes (bukan dari movie.showtimes lagi)
    const uniqueDates = useMemo(() => {
        const dates = safeShowtimes.map(st => st.showDate);
        return Array.from(new Set(dates)).sort();
    }, [safeShowtimes]); 

    // Smart Date Selector (Otomatis pilih hari ini)
    const activeDate = useMemo(() => {
        if (selectedDate) return selectedDate;
        if (uniqueDates.length === 0) return '';

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        if (uniqueDates.includes(todayStr)) return todayStr;

        const futureDates = uniqueDates.filter(date => date >= todayStr);
        if (futureDates.length > 0) return futureDates[0];

        return uniqueDates[0];
    }, [selectedDate, uniqueDates]);

    // Pengelompokan Jadwal Berdasarkan Lokasi + Diurutkan Sesuai Jam
    const showtimesByLocation = useMemo(() => {
        // Gunakan safeShowtimes dari API baru
        const filtered = safeShowtimes
            .filter(st => st.showDate === activeDate)
            .sort((a, b) => a.showTime.localeCompare(b.showTime)); 
            
        const grouped: Record<string, typeof filtered> = {};
        
        filtered.forEach(st => {
            const hallInfo = HALL_MAPPING[st.hallId] || { location: "CineMate Studio", studioName: `Studio ${st.hallId}` };
            
            if (!grouped[hallInfo.location]) {
                grouped[hallInfo.location] = [];
            }
            grouped[hallInfo.location].push(st);
        });
        
        return grouped;
    }, [safeShowtimes, activeDate]);

    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return '';
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const checkIsExpired = (showDate: string, showTime: string) => {
        const showDateTimeStr = `${showDate}T${showTime.length === 5 ? showTime + ':00' : showTime}`;
        const showDateTime = new Date(showDateTimeStr);
        return showDateTime < new Date();
    };

    const handleShowtimeClick = (showtimeId: number) => {
        navigate(`/seat-selection/${id}/${showtimeId}`); 
    };

    // Tampilkan loading jika salah satu API masih loading
    if (isMovieLoading || isShowtimesLoading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center">
                <span className="animate-pulse text-xl font-semibold text-white/50">Load Film Details...</span>
            </div>
        );
    }

    if (isError || !movie) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
                <Navbar />
                <main className="max-w-350 mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-16 grow w-full flex flex-col items-center justify-center text-center">
                    <div className="text-red-600 mb-6 drop-shadow-[0_0_20px_rgba(229,28,35,0.4)]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Movie Not Found</h1>
                    <p className="text-white/60 text-lg mb-10 max-w-md mx-auto">
                        Sorry, this movie is no longer showing or does not exist in our database.
                    </p>
                    <Link to="/movie" className="bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-3 px-8 rounded-full transition-colors shadow-[0_0_15px_rgba(229,28,35,0.2)]">
                        Back to Movies
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="max-w-350 mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-16 grow w-full">
                
                <Breadcrumbs 
                    items={[
                        { label: 'Home', path: '/' },
                        { label: 'Film', path: '/movie' },
                        { label: movie.title } 
                    ]} 
                />

                <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12">Film Details</h1>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
                    
                    <div className="w-full md:w-75 lg:w-87.5 shrink-0">
                        <img 
                            src={movie.imageUrl} 
                            alt={movie.title} 
                            className="w-full rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/10 aspect-2/3 object-cover"
                        />
                    </div>

                    <div className="flex-1 flex flex-col gap-6 md:gap-8">
                        
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wide mb-4">{movie.title}</h2>
                            <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
                                <span className={`px-2 py-1 rounded ${movie.ageRate === 'R' ? 'bg-red-600' : movie.ageRate === 'PG-13' ? 'bg-yellow-500 text-black' : 'bg-blue-600'}`}>
                                    {movie.ageRate}
                                </span>
                                <span className="bg-white/10 px-3 py-1 rounded text-white/90">{movie.genre}</span>
                                <span className="bg-white/10 px-3 py-1 rounded text-white/90">{movie.durationMinutes} Min</span>
                            </div>
                        </div>

                        {movie.trailerUrl && (
                            <button 
                            onClick={() => setIsTrailerOpen(true)}
                            className="flex items-center gap-3 hover:text-red-500 transition-colors w-fit group cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 group-hover:scale-110 transition-transform">
                                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold text-lg">See Trailer</span>
                            </button>
                        )}

                        <div>
                            <h3 className="text-xl md:text-2xl font-bold mb-3">Description</h3>
                            <p className="text-white/70 leading-relaxed text-sm md:text-base text-justify">
                                {movie.description}
                            </p>
                        </div>

                        <div className="mt-4">
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
                                <h3 className="text-2xl font-bold">Showtimes</h3>
                                
                                {uniqueDates.length > 0 && (
                                    <div className="relative">
                                        <select 
                                            value={activeDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="appearance-none bg-[#1a1a1a] text-white/80 border border-white/20 rounded-full pl-5 pr-10 py-2 text-sm outline-none focus:border-red-500 cursor-pointer w-full sm:w-auto"
                                        >
                                            {uniqueDates.map(date => (
                                                <option key={date} value={date}>
                                                    {formatDateForDisplay(date)}
                                                </option>
                                            ))}
                                        </select>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-8">
                                {Object.entries(showtimesByLocation).length === 0 ? (
                                    <div className="text-white/40 italic">
                                        There are no showtimes available.
                                    </div>
                                ) : (
                                    Object.entries(showtimesByLocation).map(([locationName, times]) => (
                                        <div key={locationName} className="flex flex-col gap-4">
                                            <h4 className="text-lg md:text-xl font-bold text-white/90">{locationName}</h4>
                                            
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {times.map((item) => {
                                                    const isExpired = checkIsExpired(item.showDate, item.showTime);
                                                    const hallInfo = HALL_MAPPING[item.hallId] || { studioName: `Studio ${item.hallId}` };
                                                    const formattedPrice = `Rp ${Number(item.price).toLocaleString('id-ID')}`;

                                                    let containerStyle = "rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ";
                                                    
                                                    if (isExpired) {
                                                        containerStyle += "border border-white/5 bg-[#0a0a0a] opacity-40 cursor-not-allowed";
                                                    } else {
                                                        containerStyle += "border border-white/10 bg-[#1a1a1a] hover:border-red-500 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(229,28,35,0.15)] cursor-pointer";
                                                    }

                                                    return (
                                                        <div 
                                                            key={item.showtimeId} 
                                                            onClick={() => !isExpired && handleShowtimeClick(item.showtimeId)}
                                                            className={containerStyle}
                                                        >
                                                            <span className={`text-xs md:text-sm font-semibold uppercase ${isExpired ? 'text-white/30' : 'text-white/70'}`}>
                                                                {hallInfo.studioName}
                                                            </span>
                                                            <span className={`font-bold text-base md:text-lg ${isExpired ? 'text-white/30' : 'text-white'}`}>
                                                                {formattedPrice}
                                                            </span>
                                                            <span className={`font-bold text-sm md:text-base ${isExpired ? 'text-white/30 line-through' : 'text-white'}`}>
                                                                {item.showTime.substring(0, 5)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>
                    </div>

                </div>
            </main>

            <Footer />

            <TrailerModal isOpen={isTrailerOpen} onClose={() => setIsTrailerOpen(false)} videoUrl={movie?.trailerUrl || ''} />
        </div>
    );
};