import type { FnbItem } from '../types/fnb';
import type { OrderItem } from '../types/order';
import type { Showtime } from '../types/showtime';

export const ORDER_HISTORY: OrderItem[] = [
    {
        id: 'ORD-001',
        movieId: '3',
        movieTitle: 'HOPPERS',
        posterUrl: '/Hoppers.png',
        date: '10 March 2026',
        time: '07:00 PM',
        seats: 'A1, A2',
        studio: '1',
        price: 165000,
        status: 'Completed'
    },
    {
        id: 'ORD-002',
        movieId: '3',
        movieTitle: 'HOPPERS',
        posterUrl: '/Hoppers.png',
        date: '10 March 2026',
        time: '07:00 PM',
        seats: 'A1, A2',
        studio: '1',
        price: 165000,
        status: 'Cancelled'
    },
    {
        id: 'ORD-003',
        movieId: '3',
        movieTitle: 'HOPPERS',
        posterUrl: '/Hoppers.png',
        date: '10 March 2026',
        time: '07:00 PM',
        seats: 'A1, A2',
        studio: '1',
        price: 165000,
        status: 'Pending'
    },
    {
        id: 'ORD-004',
        movieId: '3',
        movieTitle: 'HOPPERS',
        posterUrl: '/Hoppers.png',
        date: '10 March 2026',
        time: '07:00 PM',
        seats: 'A1, A2',
        studio: '1',
        price: 165000,
        status: 'Upcoming'
    },
    {
        id: 'ORD-005',
        movieId: '999', 
        movieTitle: 'AVENGERS: ENDGAME',
        posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', 
        date: '25 April 2024',
        time: '19:00 WIB',
        seats: 'E5, E6',
        studio: '2',
        price: 100000,
        status: 'Cancelled'
    }
];

export const NOW_PLAYING = [
    { id: 1, title: 'WEAPONS', rating: 'R', duration: '173m', imgUrl: '/Weapons.png', trailerUrl: 'https://www.youtube.com/embed/OpThntO9ixc?autoplay=1', startDate: '2026-05-01', endDate: '2026-06-15' },
    { id: 2, title: 'JOKER', rating: 'PG-13', duration: '189m', imgUrl: '/Joker.png', trailerUrl: 'https://www.youtube.com/embed/zAGVQLHvwOY?autoplay=1', startDate: '2026-05-10', endDate: '2026-06-20' },
    { id: 3, title: 'HOPPERS', rating: 'G', duration: '109m', imgUrl: '/Hoppers.png', trailerUrl: 'https://www.youtube.com/embed/PypDSyIRRSs?autoplay=1', startDate: '2026-05-15', endDate: '2026-07-01' },
    { id: 4, title: 'DUNE: PART TWO', rating: 'PG-13', duration: '166m', imgUrl: '/Weapons.png', trailerUrl: 'https://www.youtube.com/embed/U2Qp5pL3ovA?autoplay=1', startDate: '2026-04-20', endDate: '2026-06-10' },
    { id: 5, title: 'DEADPOOL 3', rating: 'R', duration: '120m', imgUrl: '/Joker.png', trailerUrl: 'https://www.youtube.com/embed/73_1biulkYk?autoplay=1', startDate: '2026-05-18', endDate: '2026-06-30' },
    { id: 6, title: 'INSIDE OUT 2', rating: 'G', duration: '96m', imgUrl: '/Hoppers.png', trailerUrl: 'https://www.youtube.com/embed/LEjhY15eCx0?autoplay=1', startDate: '2026-05-20', endDate: '2026-07-15' },
];

export const UPCOMING_MOVIES = [
    { id: 7, title: 'AVATAR 3', rating: 'PG-13', duration: '190m', imgUrl: '/avatar3.jpeg', trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0?autoplay=1', startDate: '2026-07-10', endDate: '2026-09-10' },
    { id: 8, title: 'THE BATMAN II', rating: 'PG-13', duration: '175m', imgUrl: '/batman2.jpg', trailerUrl: 'https://www.youtube.com/embed/mqqft2x_Aa4?autoplay=1', startDate: '2026-08-01', endDate: '2026-09-30' }, 
    { id: 9, title: 'TOY STORY 5', rating: 'G', duration: '105m', imgUrl: '/toystory5.jpeg', trailerUrl: 'https://www.youtube.com/embed/wmiIUN-7qhE?autoplay=1', startDate: '2026-08-15', endDate: '2026-10-15' },
    { id: 10, title: 'SUPERMAN', rating: 'PG-13', duration: '150m', imgUrl: '/superman.jpeg', trailerUrl: 'https://www.youtube.com/embed/T6DJcgm3wNY?autoplay=1', startDate: '2026-09-01', endDate: '2026-11-01' },
    { id: 11, title: 'GLADIATOR 2', rating: 'R', duration: '160m', imgUrl: '/Joker.png', trailerUrl: 'https://www.youtube.com/embed/4rgYUipGJNo?autoplay=1', startDate: '2026-09-20', endDate: '2026-11-20' },
];

export const ALL_MOVIES = [
    { id: 1, title: 'WEAPONS', rating: 'R', duration: '173m', imgUrl: '/Weapons.png', trailerUrl: 'https://www.youtube.com/embed/OpThntO9ixc?autoplay=1', startDate: '2026-05-01', endDate: '2026-06-15' },
    { id: 2, title: 'JOKER', rating: 'PG-13', duration: '189m', imgUrl: '/Joker.png', trailerUrl: 'https://www.youtube.com/embed/zAGVQLHvwOY?autoplay=1', startDate: '2026-05-10', endDate: '2026-06-20' },
    { id: 3, title: 'HOPPERS', rating: 'G', duration: '109m', imgUrl: '/Hoppers.png', trailerUrl: 'https://www.youtube.com/embed/PypDSyIRRSs?autoplay=1', startDate: '2026-05-15', endDate: '2026-07-01' },
    { id: 4, title: 'DUNE: PART TWO', rating: 'PG-13', duration: '166m', imgUrl: '/Weapons.png', trailerUrl: 'https://www.youtube.com/embed/U2Qp5pL3ovA?autoplay=1', startDate: '2026-04-20', endDate: '2026-06-10' },
    { id: 5, title: 'DEADPOOL 3', rating: 'R', duration: '120m', imgUrl: '/Joker.png', trailerUrl: 'https://www.youtube.com/embed/73_1biulkYk?autoplay=1', startDate: '2026-05-18', endDate: '2026-06-30' },
    { id: 6, title: 'INSIDE OUT 2', rating: 'G', duration: '96m', imgUrl: '/Hoppers.png', trailerUrl: 'https://www.youtube.com/embed/LEjhY15eCx0?autoplay=1', startDate: '2026-05-20', endDate: '2026-07-15' },
    { id: 7, title: 'AVATAR 3', rating: 'PG-13', duration: '190m', imgUrl: '/Weapons.png', trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0?autoplay=1', startDate: '2026-07-10', endDate: '2026-09-10' },
    { id: 8, title: 'THE BATMAN II', rating: 'PG-13', duration: '175m', imgUrl: '/Joker.png', trailerUrl: 'https://www.youtube.com/embed/mqqft2x_Aa4?autoplay=1', startDate: '2026-08-01', endDate: '2026-09-30' },
    { id: 9, title: 'TOY STORY 5', rating: 'G', duration: '105m', imgUrl: '/Hoppers.png', trailerUrl: 'https://www.youtube.com/embed/wmiIUN-7qhE?autoplay=1', startDate: '2026-08-15', endDate: '2026-10-15' },
];

export const MOVIE_DATABASE = [
    { id: '1', title: 'WEAPONS', rating: 'R', duration: '173m', genre: 'Horror / Thriller', imgUrl: '/Weapons.png', description: 'In a quiet town, a series of mysterious events forces a group of teenagers to confront their darkest fears. Weapons explores the psychological depths of survival.', trailerUrl: 'https://www.youtube.com/embed/OpThntO9ixc?autoplay=1', startDate: '2026-05-01', endDate: '2026-06-15' },
    { id: '2', title: 'JOKER', rating: 'PG-13', duration: '189m', genre: 'Drama / Crime', imgUrl: '/Joker.png', description: 'Forever alone in a crowd, failed comedian Arthur Fleck seeks connection as he walks the streets of Gotham City. Arthur wears two masks -- the one he paints for his day job as a clown, and the guise he projects in a futile attempt to feel like he is part of the world around him.', trailerUrl: 'https://www.youtube.com/embed/zAGVQLHvwOY?autoplay=1', startDate: '2026-05-10', endDate: '2026-06-20' },
    { id: '3', title: 'HOPPERS', rating: 'G', duration: '189m', genre: 'Animation', imgUrl: '/Hoppers.png', description: 'Hoppers is an innovative game that combines physical activity with digital interaction, encouraging players to jump through colorful hoops to score points. Designed to promote fitness and fun, it challenges agility and coordination while engaging users in a vibrant, energetic environment.', trailerUrl: 'https://www.youtube.com/embed/PypDSyIRRSs?autoplay=1', startDate: '2026-05-15', endDate: '2026-07-01' },
];

export const SHOWTIMES = [
    { id: 1, studio: 'Studio 1', price: 'Rp 50.000', time: '13:00 WIB', isExpired: true }, 
    { id: 2, studio: 'Studio 2', price: 'Rp 50.000', time: '18:00 WIB', isExpired: false },
    { id: 3, studio: 'Studio 3', price: 'Rp 50.000', time: '19:30 WIB', isExpired: false },
    { id: 4, studio: 'Studio 4', price: 'Rp 50.000', time: '21:00 WIB', isExpired: false },
];

export const ADMIN_FNB: FnbItem[] = [
    { id: 'FNB-001', name: 'Caramel Popcorn (L)', category: 'Snack', price: 45000, stock: 150, imgUrl: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&w=200&q=80' },
    { id: 'FNB-002', name: 'Coca-Cola (L)', category: 'Drink', price: 20000, stock: 300, imgUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=200&q=80' },
    { id: 'FNB-003', name: 'Combo 1 (Popcorn + Drink)', category: 'Combo', price: 60000, stock: 100, imgUrl: 'https://images.unsplash.com/photo-1595126743953-6ce68db35824?auto=format&fit=crop&w=200&q=80' },
    { id: 'FNB-004', name: 'Nachos with Cheese', category: 'Snack', price: 35000, stock: 5, imgUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=200&q=80' },
    { id: 'FNB-005', name: 'Mineral Water', category: 'Drink', price: 10000, stock: 0, imgUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=200&q=80' }
];

export const ADMIN_SHOWTIMES: Showtime[] = [
    { id: 'ST-001', movieId: '3', movieTitle: 'HOPPERS', studio: 'Studio 1', date: '2026-05-20', time: '14:00', price: 50000 },
    { id: 'ST-002', movieId: '3', movieTitle: 'HOPPERS', studio: 'Studio 1', date: '2026-05-20', time: '16:30', price: 50000 },
    { id: 'ST-003', movieId: '1', movieTitle: 'MOANA 2', studio: 'Studio 2', date: '2026-05-20', time: '13:00', price: 45000 },
    { id: 'ST-004', movieId: '2', movieTitle: 'WICKED', studio: 'VIP Studio', date: '2026-05-21', time: '19:00', price: 100000 },
];