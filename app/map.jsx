// map.jsx — Leaflet real map (CartoDB Positron tiles, Google-like)
// When Google Maps key is ready: swap LeafletMap init for google.maps.Map
const PINK = '#E32459';
const PINK_DARK = '#B81C47';
const PINK_LIGHT = '#FBD8DE';
const ORANGE = '#FF8C2B';
const PLUM = '#3a1d2c';
const __BYUP_DARK = (() => { try { const x = localStorage.getItem('byup.themeMode')||'light'; if(x==='dark')return true; if(x==='auto')return !!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches); return false; } catch { return false; } })();
const TEXT = __BYUP_DARK ? '#f6ece9' : '#1c0f15';
const MUTED = __BYUP_DARK ? 'rgba(246,236,233,.58)' : '#6d5a61';
const BORDER = __BYUP_DARK ? 'rgba(246,236,233,.13)' : '#eddfda';
const BG_PAGE = __BYUP_DARK ? '#161514' : '#FBF4F1';
const SURF = __BYUP_DARK ? '#211f22' : '#fff';
const TINT = __BYUP_DARK ? '#2b272c' : '#f6f6f6';

const CATEGORIES = [
  { id: 'all',      label: 'Tutti' },
  { id: 'Italiana', label: 'Ristoranti' },
  { id: 'Pizza',    label: 'Pizzerie' },
  { id: 'Cocktail', label: 'Bar & Cocktail' },
  { id: 'Pub',      label: 'Pub' },
  { id: 'Gelato',   label: 'Gelato' },
];

const CUISINE_EMOJI = {
  Italiana: '🍝', Pizza: '🍕', Cocktail: '🍸', Pub: '🍺', Gelato: '🍦',
};

const VENUES_BY_CITY = {
  roma: [
    // ── Prati / Vaticano ─────────────────────────────────────────────
    { id: 'set',  name: 'Al Settembrini',    cat: 'Ristorante romano',    distance: '1.6 km',
      lat: 41.9065, lng: 12.4642, color: PINK,  open: true,  hours: '12:30 – 23:00', cuisine: 'Italiana', price: '20-30€', rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=70&auto=format&fit=crop' },
    { id: 'ang',  name: "Osteria dell'Angelo", cat: 'Osteria romana',     distance: '1.8 km',
      lat: 41.9078, lng: 12.4608, color: PINK,  open: true,  hours: '12:30 – 23:00', cuisine: 'Italiana', price: '15-25€', rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=70&auto=format&fit=crop' },
    { id: 'prz',  name: 'Pizzarium',          cat: 'Pizza al taglio',     distance: '2.0 km',
      lat: 41.9058, lng: 12.4588, color: PINK,  open: true,  hours: '11:00 – 22:00', cuisine: 'Pizza',    price: '5-15€',  rating: 4.8,
      photo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=70&auto=format&fit=crop' },
    // ── Trastevere ───────────────────────────────────────────────────
    { id: 'imp',  name: "All'Impronta",       cat: 'Ristorante',          distance: '0.8 km',
      lat: 41.8960, lng: 12.4718, color: PINK,  open: true,  hours: '19:00 – 24:00', cuisine: 'Italiana', price: '25-35€', rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=70&auto=format&fit=crop' },
    { id: 'ton',  name: 'Da Tonino',          cat: 'Osteria romana',      distance: '1.3 km',
      lat: 41.8892, lng: 12.4678, color: PINK,  open: true,  hours: '12:00 – 23:00', cuisine: 'Italiana', price: '15-25€', rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&q=70&auto=format&fit=crop' },
    { id: 'sora', name: 'Sora Lella',         cat: 'Trattoria storica',   distance: '1.2 km',
      lat: 41.8935, lng: 12.4785, color: PINK,  open: true,  hours: '12:30 – 22:30', cuisine: 'Italiana', price: '30-45€', rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=70&auto=format&fit=crop' },
    { id: 'bfd',  name: 'Bir & Fud',          cat: 'Birrificio artigianale', distance: '1.4 km',
      lat: 41.8898, lng: 12.4695, color: PLUM,  open: true,  hours: '18:00 – 02:00', cuisine: 'Pub',      price: '15-25€', rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=70&auto=format&fit=crop' },
    { id: 'fri',  name: 'Freni e Frizioni',   cat: 'Cocktail bar',        distance: '1.5 km',
      lat: 41.8878, lng: 12.4705, color: ORANGE, open: true, hours: '18:30 – 02:00', cuisine: 'Cocktail', price: '10-20€', rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=70&auto=format&fit=crop' },
    { id: 'cal',  name: 'Bar San Calisto',    cat: 'Bar storico',         distance: '1.6 km',
      lat: 41.8885, lng: 12.4715, color: ORANGE, open: true, hours: '06:00 – 02:00', cuisine: 'Cocktail', price: '5-12€',  rating: 4.4,
      photo: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=70&auto=format&fit=crop' },
    { id: 'gel',  name: 'Fatamorgana',        cat: 'Gelateria',           distance: '0.6 km',
      lat: 41.8922, lng: 12.4688, color: ORANGE, open: true, hours: '12:00 – 24:00', cuisine: 'Gelato',   price: '5-10€',  rating: 4.9,
      photo: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=70&auto=format&fit=crop' },
    // ── Testaccio ────────────────────────────────────────────────────
    { id: 'hop',  name: 'Hops & Co',          cat: 'Pub',                 distance: '1.5 km',
      lat: 41.8880, lng: 12.4750, color: PLUM,  open: false, hours: 'Apre alle 18:00', cuisine: 'Pub',    price: '15-25€', rating: 4.3,
      photo: 'https://images.unsplash.com/photo-1538488881038-592d2b6c4b78?w=600&q=70&auto=format&fit=crop' },
    { id: 'rem',  name: 'Da Remo',            cat: 'Pizzeria romana',     distance: '2.4 km',
      lat: 41.8768, lng: 12.4778, color: PINK,  open: true,  hours: '19:00 – 24:00', cuisine: 'Pizza',    price: '10-18€', rating: 4.8,
      photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=70&auto=format&fit=crop' },
    { id: 'chec', name: 'Checchino dal 1887', cat: 'Osteria storica',     distance: '2.6 km',
      lat: 41.8752, lng: 12.4795, color: PINK,  open: true,  hours: '12:30 – 23:00', cuisine: 'Italiana', price: '30-45€', rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=70&auto=format&fit=crop' },
    { id: 'vol',  name: 'Voltaire Pub',       cat: 'Pub artigianale',     distance: '2.5 km',
      lat: 41.8782, lng: 12.4762, color: PLUM,  open: true,  hours: '17:00 – 02:00', cuisine: 'Pub',      price: '10-20€', rating: 4.3,
      photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=70&auto=format&fit=crop' },
    // ── Campo de' Fiori / Navona ──────────────────────────────────────
    { id: 'ros',  name: 'Roscioli',           cat: 'Salumeria con cucina', distance: '0.6 km',
      lat: 41.8948, lng: 12.4725, color: PINK,  open: true,  hours: '12:30 – 24:00', cuisine: 'Italiana', price: '25-40€', rating: 4.9,
      photo: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=600&q=70&auto=format&fit=crop' },
    { id: 'emm',  name: 'Emma Pizzeria',      cat: 'Pizzeria gourmet',    distance: '0.5 km',
      lat: 41.8958, lng: 12.4718, color: PINK,  open: true,  hours: '12:30 – 23:30', cuisine: 'Pizza',    price: '12-22€', rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&q=70&auto=format&fit=crop' },
    { id: 'bnc',  name: 'Barnum Café',        cat: 'Cocktail bar',        distance: '0.3 km',
      lat: 41.8968, lng: 12.4728, color: ORANGE, open: true, hours: '09:00 – 02:00', cuisine: 'Cocktail', price: '10-20€', rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=70&auto=format&fit=crop' },
    { id: 'sor',  name: 'Il Sorpasso',        cat: 'Bar bistrot',         distance: '0.4 km',
      lat: 41.8972, lng: 12.4712, color: ORANGE, open: true, hours: '08:00 – 02:00', cuisine: 'Cocktail', price: '12-22€', rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&q=70&auto=format&fit=crop' },
    // ── Monti / Colosseo ─────────────────────────────────────────────
    { id: 'mar',  name: 'Da Mario',           cat: 'Trattoria',           distance: '2.1 km',
      lat: 41.8904, lng: 12.4918, color: PINK,  open: true,  hours: '12:00 – 23:00', cuisine: 'Italiana', price: '15-25€', rating: 4.4,
      photo: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=70&auto=format&fit=crop' },
    { id: 'lir',  name: 'Li Rioni',           cat: 'Pizzeria',            distance: '1.6 km',
      lat: 41.8892, lng: 12.4942, color: PINK,  open: true,  hours: '19:30 – 24:00', cuisine: 'Pizza',    price: '8-16€',  rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=600&q=70&auto=format&fit=crop' },
    { id: 'tre',  name: 'Ai Tre Scalini',     cat: 'Enoteca',             distance: '1.4 km',
      lat: 41.8942, lng: 12.4938, color: ORANGE, open: true, hours: '12:00 – 02:00', cuisine: 'Cocktail', price: '15-25€', rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&q=70&auto=format&fit=crop' },
    // ── San Lorenzo / Pigneto ────────────────────────────────────────
    { id: 'pom',  name: 'Pommidoro',          cat: 'Trattoria storica',   distance: '3.0 km',
      lat: 41.8968, lng: 12.5145, color: PINK,  open: true,  hours: '12:30 – 23:00', cuisine: 'Italiana', price: '20-30€', rating: 4.4,
      photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=70&auto=format&fit=crop' },
    { id: 'pig',  name: 'Pigneto 41',         cat: 'Cocktail bar',        distance: '3.8 km',
      lat: 41.8858, lng: 12.5215, color: ORANGE, open: true, hours: '19:00 – 02:00', cuisine: 'Cocktail', price: '8-18€',  rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=70&auto=format&fit=crop' },
    // ── Nomentano / Parioli ──────────────────────────────────────────
    { id: 'latte', name: 'Come il Latte',     cat: 'Gelateria cremosa',   distance: '3.5 km',
      lat: 41.9115, lng: 12.5188, color: ORANGE, open: true, hours: '11:00 – 23:30', cuisine: 'Gelato',   price: '3-8€',   rating: 4.8,
      photo: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=70&auto=format&fit=crop' },
    { id: 'par',  name: 'La Pratolina',       cat: 'Pizzeria',            distance: '3.2 km',
      lat: 41.9215, lng: 12.5048, color: PINK,  open: true,  hours: '12:30 – 23:30', cuisine: 'Pizza',    price: '12-20€', rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&q=70&auto=format&fit=crop' },
    // ── Flaminio ─────────────────────────────────────────────────────
    { id: 'jaz',  name: 'Blue Note',          cat: 'Jazz bar',            distance: '2.8 km',
      lat: 41.8988, lng: 12.4760, color: ORANGE, open: true, hours: '20:00 – 02:00', cuisine: 'Cocktail', price: '20-30€', rating: 4.8,
      photo: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&q=70&auto=format&fit=crop' },
    { id: 'ostf', name: 'Osteria Flaminio',   cat: 'Ristorante',          distance: '1.9 km',
      lat: 41.9172, lng: 12.4768, color: PINK,  open: true,  hours: '12:00 – 23:00', cuisine: 'Italiana', price: '20-35€', rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&q=70&auto=format&fit=crop' },
    { id: 'lou',  name: 'Lounge 22',          cat: 'Cocktail bar',        distance: '1.1 km',
      lat: 41.9012, lng: 12.4846, color: ORANGE, open: true, hours: '18:00 – 02:00', cuisine: 'Cocktail', price: '15-25€', rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=70&auto=format&fit=crop' },
    // ── Pantheon / Centro Storico ────────────────────────────────────
    { id: 'giol', name: 'Giolitti',           cat: 'Gelateria storica',   distance: '0.2 km',
      lat: 41.9002, lng: 12.4778, color: ORANGE, open: true, hours: '07:00 – 02:00', cuisine: 'Gelato',   price: '3-8€',   rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=70&auto=format&fit=crop' },
    { id: 'eust', name: "Caffè Sant'Eustachio", cat: 'Caffè storico',     distance: '0.1 km',
      lat: 41.8988, lng: 12.4762, color: ORANGE, open: true, hours: '08:30 – 01:00', cuisine: 'Cocktail', price: '5-12€',  rating: 4.8,
      photo: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&q=70&auto=format&fit=crop' },
    // ── Sforno (Cinecittà) ────────────────────────────────────────────
    { id: 'piz',  name: 'Sforno',             cat: 'Pizzeria',            distance: '3.2 km',
      lat: 41.9155, lng: 12.4960, color: PINK,  open: true,  hours: '19:00 – 24:00', cuisine: 'Pizza',    price: '10-20€', rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=70&auto=format&fit=crop' },
    // ── Garbatella / Ostiense ────────────────────────────────────────
    { id: 'grz',  name: 'Grazia & Graziella', cat: 'Trattoria di quartiere', distance: '4.7 km',
      lat: 41.8578, lng: 12.4858, color: PINK,  open: true,  hours: '12:30 – 23:00', cuisine: 'Italiana', price: '15-25€', rating: 4.4,
      photo: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=70&auto=format&fit=crop' },
    { id: 'tram', name: 'Tram Depot',         cat: 'Pub storico',         distance: '4.4 km',
      lat: 41.8612, lng: 12.4712, color: PLUM,  open: true,  hours: '17:00 – 02:00', cuisine: 'Pub',      price: '10-20€', rating: 4.3,
      photo: 'https://images.unsplash.com/photo-1538488881038-592d2b6c4b78?w=600&q=70&auto=format&fit=crop' },
    // ── Termini ──────────────────────────────────────────────────────
    { id: 'pmp',  name: 'Pompi',              cat: 'Tiramisù bar',        distance: '2.5 km',
      lat: 41.9025, lng: 12.5022, color: ORANGE, open: true, hours: '09:00 – 22:00', cuisine: 'Gelato',   price: '5-12€',  rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&q=70&auto=format&fit=crop' },
    // ── Monteverde ───────────────────────────────────────────────────
    { id: 'mvd',  name: 'Osteria di Monteverde', cat: 'Trattoria',        distance: '4.0 km',
      lat: 41.8722, lng: 12.4438, color: PINK,  open: false, hours: 'Apre alle 19:00', cuisine: 'Italiana', price: '15-28€', rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=600&q=70&auto=format&fit=crop' },
    // ── EUR ──────────────────────────────────────────────────────────
    { id: 'eur',  name: 'Il Sorpasso EUR',    cat: 'Bistrot',             distance: '7.6 km',
      lat: 41.8328, lng: 12.4672, color: PINK,  open: true,  hours: '12:30 – 23:30', cuisine: 'Italiana', price: '20-30€', rating: 4.4,
      photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=70&auto=format&fit=crop' },
  ],

  milano: [
    { id: 'rat',   name: 'Ratanà',            cat: 'Cucina meneghina',    distance: '0.8 km',
      lat: 45.4845, lng: 9.1958, color: PINK,  open: true,  hours: '12:30 – 23:00', cuisine: 'Italiana', price: '35-55€', rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=70&auto=format&fit=crop' },
    { id: 'dry',   name: 'Dry Milano',        cat: 'Cocktail & pizza',    distance: '1.2 km',
      lat: 45.4728, lng: 9.1868, color: ORANGE, open: true, hours: '18:00 – 02:00', cuisine: 'Cocktail', price: '15-30€', rating: 4.8,
      photo: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=70&auto=format&fit=crop' },
    { id: 'lamb',  name: 'Birrificio Lambrate', cat: 'Birrificio artigianale', distance: '3.5 km',
      lat: 45.4778, lng: 9.2368, color: PLUM,  open: true,  hours: '17:00 – 01:00', cuisine: 'Pub',      price: '10-20€', rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1538488881038-592d2b6c4b78?w=600&q=70&auto=format&fit=crop' },
    { id: 'artic', name: 'Gelateria Artico',  cat: 'Gelateria artigianale', distance: '2.8 km',
      lat: 45.4775, lng: 9.1478, color: ORANGE, open: true, hours: '11:00 – 23:30', cuisine: 'Gelato',   price: '3-8€',   rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=70&auto=format&fit=crop' },
    { id: 'nott',  name: 'Nottingham Forest', cat: 'Cocktail bar',        distance: '2.1 km',
      lat: 45.4712, lng: 9.2088, color: ORANGE, open: true, hours: '19:00 – 02:00', cuisine: 'Cocktail', price: '15-25€', rating: 4.9,
      photo: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=70&auto=format&fit=crop' },
    { id: 'sorb',  name: 'Sorbillo Milano',   cat: 'Pizzeria napoletana', distance: '0.5 km',
      lat: 45.4638, lng: 9.1918, color: PINK,  open: true,  hours: '12:00 – 23:30', cuisine: 'Pizza',    price: '8-18€',  rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=70&auto=format&fit=crop' },
    { id: 'nav',   name: 'Navigli Bar',       cat: 'Bar con aperitivo',   distance: '2.5 km',
      lat: 45.4492, lng: 9.1728, color: ORANGE, open: true, hours: '08:00 – 02:00', cuisine: 'Cocktail', price: '10-20€', rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=70&auto=format&fit=crop' },
    { id: 'cro',   name: 'Osteria del Crotto', cat: 'Trattoria milanese', distance: '1.8 km',
      lat: 45.4658, lng: 9.1818, color: PINK,  open: false, hours: 'Apre alle 19:00', cuisine: 'Italiana', price: '30-50€', rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&q=70&auto=format&fit=crop' },
  ],

  firenze: [
    { id: 'lat',   name: 'Il Latini',         cat: 'Trattoria fiorentina', distance: '0.5 km',
      lat: 43.7715, lng: 11.2498, color: PINK,  open: true,  hours: '12:30 – 23:00', cuisine: 'Italiana', price: '25-40€', rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=70&auto=format&fit=crop' },
    { id: 'anv',   name: "All'Antico Vinaio", cat: 'Fiaschetteria storica', distance: '0.3 km',
      lat: 43.7698, lng: 11.2558, color: PINK,  open: true,  hours: '10:30 – 21:00', cuisine: 'Italiana', price: '5-15€',  rating: 4.8,
      photo: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=70&auto=format&fit=crop' },
    { id: 'nei',   name: 'Gelateria dei Neri', cat: 'Gelateria artigianale', distance: '0.6 km',
      lat: 43.7665, lng: 11.2518, color: ORANGE, open: true, hours: '11:00 – 23:00', cuisine: 'Gelato',   price: '2-7€',   rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=70&auto=format&fit=crop' },
    { id: 'mad',   name: 'Mad Souls & Spirits', cat: 'Cocktail bar',      distance: '0.8 km',
      lat: 43.7655, lng: 11.2488, color: ORANGE, open: true, hours: '18:00 – 02:00', cuisine: 'Cocktail', price: '10-20€', rating: 4.9,
      photo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=70&auto=format&fit=crop' },
    { id: 'rex',   name: 'Rex Caffè',         cat: 'Bar e cocktail',      distance: '0.4 km',
      lat: 43.7688, lng: 11.2538, color: ORANGE, open: true, hours: '18:00 – 03:00', cuisine: 'Cocktail', price: '8-18€',  rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=70&auto=format&fit=crop' },
    { id: 'buc',   name: 'Buca Mario',        cat: 'Ristorante storico',  distance: '0.2 km',
      lat: 43.7705, lng: 11.2528, color: PINK,  open: true,  hours: '12:00 – 22:30', cuisine: 'Italiana', price: '30-50€', rating: 4.4,
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=70&auto=format&fit=crop' },
    { id: 'brrr',  name: "Brac",              cat: 'Libreria con cucina', distance: '0.7 km',
      lat: 43.7672, lng: 11.2572, color: PINK,  open: true,  hours: '10:00 – 23:00', cuisine: 'Italiana', price: '15-25€', rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&q=70&auto=format&fit=crop' },
    { id: 'vol2',  name: 'Mostodolce',        cat: 'Birrificio artigianale', distance: '1.2 km',
      lat: 43.7748, lng: 11.2548, color: PLUM,  open: true,  hours: '12:00 – 01:00', cuisine: 'Pub',      price: '10-18€', rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1538488881038-592d2b6c4b78?w=600&q=70&auto=format&fit=crop' },
  ],

  venezia: [
    { id: 'test',  name: 'Alle Testiere',     cat: 'Osteria di pesce',    distance: '0.4 km',
      lat: 45.4352, lng: 12.3518, color: PINK,  open: true,  hours: '12:00 – 22:00', cuisine: 'Italiana', price: '40-60€', rating: 4.8,
      photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=70&auto=format&fit=crop' },
    { id: 'cov',   name: 'Al Covo',           cat: 'Ristorante veneziano', distance: '0.6 km',
      lat: 45.4345, lng: 12.3528, color: PINK,  open: true,  hours: '12:45 – 22:30', cuisine: 'Italiana', price: '35-55€', rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=70&auto=format&fit=crop' },
    { id: 'bja',   name: 'Bacaro Jazz',       cat: 'Bar veneziano',       distance: '0.3 km',
      lat: 45.4378, lng: 12.3358, color: ORANGE, open: true, hours: '17:00 – 02:00', cuisine: 'Cocktail', price: '10-20€', rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&q=70&auto=format&fit=crop' },
    { id: 'nico',  name: 'Gelateria Nico',    cat: 'Gelateria storica',   distance: '0.7 km',
      lat: 45.4315, lng: 12.3248, color: ORANGE, open: true, hours: '08:00 – 22:00', cuisine: 'Gelato',   price: '2-7€',   rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=70&auto=format&fit=crop' },
    { id: 'bvn',   name: 'Birra Venezia',     cat: 'Pub veneziano',       distance: '0.8 km',
      lat: 45.4462, lng: 12.3268, color: PLUM,  open: true,  hours: '16:00 – 01:00', cuisine: 'Pub',      price: '10-18€', rating: 4.3,
      photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=70&auto=format&fit=crop' },
    { id: 'do',    name: "Da Fiore",          cat: 'Ristorante veneziano', distance: '1.0 km',
      lat: 45.4398, lng: 12.3318, color: PINK,  open: true,  hours: '12:30 – 22:00', cuisine: 'Italiana', price: '50-80€', rating: 4.9,
      photo: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&q=70&auto=format&fit=crop' },
  ],

  napoli: [
    { id: 'nsor',  name: 'Sorbillo',          cat: 'Pizzeria storica',    distance: '0.3 km',
      lat: 40.8518, lng: 14.2528, color: PINK,  open: true,  hours: '12:30 – 23:30', cuisine: 'Pizza',    price: '6-14€',  rating: 4.9,
      photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=70&auto=format&fit=crop' },
    { id: 'mich',  name: "Da Michele",        cat: 'Pizzeria storica',    distance: '0.5 km',
      lat: 40.8505, lng: 14.2555, color: PINK,  open: true,  hours: '11:00 – 23:00', cuisine: 'Pizza',    price: '5-10€',  rating: 4.8,
      photo: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&q=70&auto=format&fit=crop' },
    { id: 'matt',  name: 'Mattonella',        cat: 'Osteria napoletana',  distance: '2.2 km',
      lat: 40.8322, lng: 14.2278, color: PINK,  open: true,  hours: '12:30 – 23:00', cuisine: 'Italiana', price: '15-25€', rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=70&auto=format&fit=crop' },
    { id: 'menn',  name: 'Mennella',          cat: 'Gelateria storica',   distance: '2.0 km',
      lat: 40.8318, lng: 14.2298, color: ORANGE, open: true, hours: '10:00 – 24:00', cuisine: 'Gelato',   price: '2-6€',   rating: 4.8,
      photo: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=70&auto=format&fit=crop' },
    { id: 'bell',  name: 'Belledonne',        cat: 'Enoteca',             distance: '2.3 km',
      lat: 40.8312, lng: 14.2258, color: ORANGE, open: true, hours: '18:00 – 02:00', cuisine: 'Cocktail', price: '10-20€', rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=70&auto=format&fit=crop' },
    { id: 'vam',   name: 'Vomero Pub',        cat: 'Pub artigianale',     distance: '3.5 km',
      lat: 40.8448, lng: 14.2348, color: PLUM,  open: true,  hours: '18:00 – 02:00', cuisine: 'Pub',      price: '10-18€', rating: 4.3,
      photo: 'https://images.unsplash.com/photo-1538488881038-592d2b6c4b78?w=600&q=70&auto=format&fit=crop' },
    { id: 'nconc', name: "Concettina ai Tre Santi", cat: 'Pizzeria gourmet', distance: '1.8 km',
      lat: 40.8558, lng: 14.2468, color: PINK,  open: true,  hours: '12:00 – 23:30', cuisine: 'Pizza',    price: '10-20€', rating: 4.9,
      photo: 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=600&q=70&auto=format&fit=crop' },
  ],

  palermo: [
    { id: 'vesp',  name: 'Osteria dei Vespri', cat: 'Alta cucina siciliana', distance: '0.4 km',
      lat: 38.1148, lng: 13.3618, color: PINK,  open: true,  hours: '12:30 – 23:00', cuisine: 'Italiana', price: '35-55€', rating: 4.8,
      photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=70&auto=format&fit=crop' },
    { id: 'frat',  name: 'Fratelli Russo',    cat: 'Pizzeria siciliana',  distance: '0.6 km',
      lat: 38.1135, lng: 13.3638, color: PINK,  open: true,  hours: '19:00 – 24:00', cuisine: 'Pizza',    price: '8-16€',  rating: 4.6,
      photo: 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=600&q=70&auto=format&fit=crop' },
    { id: 'cal2',  name: 'Da Calogero',       cat: 'Trattoria di mare',   distance: '12.0 km',
      lat: 38.2138, lng: 13.3268, color: PINK,  open: true,  hours: '12:00 – 23:00', cuisine: 'Italiana', price: '20-35€', rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=70&auto=format&fit=crop' },
    { id: 'ila',   name: 'Gelateria Ilardo',  cat: 'Gelateria storica',   distance: '0.3 km',
      lat: 38.1128, lng: 13.3598, color: ORANGE, open: true, hours: '08:00 – 24:00', cuisine: 'Gelato',   price: '2-6€',   rating: 4.7,
      photo: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=70&auto=format&fit=crop' },
    { id: 'kaf',   name: 'Kursaal Kalhesa',   cat: 'Bar culturale',       distance: '1.0 km',
      lat: 38.1118, lng: 13.3678, color: ORANGE, open: true, hours: '19:00 – 02:00', cuisine: 'Cocktail', price: '10-20€', rating: 4.5,
      photo: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=70&auto=format&fit=crop' },
  ],
};

const CITIES = [
  { id: 'roma',    name: 'Roma',    count: 35, x: 0.51, y: 0.55 },
  { id: 'firenze', name: 'Firenze', count: 8,  x: 0.47, y: 0.40 },
  { id: 'venezia', name: 'Venezia', count: 6,  x: 0.55, y: 0.22 },
  { id: 'milano',  name: 'Milano',  count: 8,  x: 0.36, y: 0.18 },
  { id: 'napoli',  name: 'Napoli',  count: 7,  x: 0.62, y: 0.70 },
  { id: 'palermo', name: 'Palermo', count: 5,  x: 0.50, y: 0.92 },
];

// ─── Helper: generate DivIcon HTML for a venue pin ────────────────
function createPinHTML(venue, isSelected) {
  const emoji = CUISINE_EMOJI[venue.cuisine] || '🍽️';
  const bg      = isSelected ? venue.color : '#fff';
  const border  = venue.color;
  const txtCol  = isSelected ? '#fff' : '#1a1a1a';
  const starCol = isSelected ? 'rgba(255,255,255,0.88)' : venue.color;
  const dotBg   = isSelected ? 'rgba(255,255,255,0.22)' : venue.color;
  const tail    = isSelected ? venue.color : '#fff';
  const scale   = isSelected ? '1.14' : '1';
  const shadow  = isSelected
    ? '0 6px 20px rgba(0,0,0,0.32)'
    : '0 3px 10px rgba(0,0,0,0.20)';
  const words   = venue.name.split(' ');
  const label   = words.slice(0, words.length > 2 ? 2 : words.length).join(' ');

  return `
    <div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;">
      <div style="
        display:flex;flex-direction:column;align-items:center;
        filter:drop-shadow(${shadow});
        transform:scale(${scale});transform-origin:bottom center;
        transition:transform 0.18s ease,filter 0.18s ease;
      ">
        <div style="
          background:${bg};border:2px solid ${border};border-radius:999px;
          padding:5px 10px 5px 5px;display:flex;align-items:center;gap:5px;
          white-space:nowrap;
          font-family:-apple-system,'SF Pro Text',Helvetica,sans-serif;
        ">
          <div style="
            width:26px;height:26px;border-radius:50%;
            background:${dotBg};display:flex;align-items:center;
            justify-content:center;font-size:13px;line-height:1;flex-shrink:0;
          ">${emoji}</div>
          <span style="font-size:12px;font-weight:700;color:${txtCol};">${label}</span>
          <span style="font-size:10.5px;font-weight:700;color:${starCol};flex-shrink:0;">★${venue.rating}</span>
        </div>
        <div style="
          width:0;height:0;
          border-left:7px solid transparent;border-right:7px solid transparent;
          border-top:9px solid ${tail};margin-top:-1px;
        "></div>
      </div>
    </div>`;
}

// ─── Cluster icon factory ──────────────────────────────────────────
function createClusterIcon(cluster) {
  const n = cluster.getChildCount();
  const size = n < 10 ? 42 : n < 30 ? 50 : 60;
  const fontSize = n < 10 ? 17 : n < 30 ? 15 : 13;
  return window.L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${PINK};color:#fff;
      border:3px solid #fff;
      box-shadow:0 4px 16px rgba(227,36,89,0.45),0 1px 4px rgba(0,0,0,0.18);
      display:flex;align-items:center;justify-content:center;
      font-family:-apple-system,'SF Pro Text',Helvetica,sans-serif;
      font-size:${fontSize}px;font-weight:800;
    ">${n}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ─── Leaflet map component ─────────────────────────────────────────
function LeafletMap({ venues, selectedId, onVenueSelect, controlsRef }) {
  const divRef         = React.useRef(null);
  const mapRef         = React.useRef(null);
  const clusterRef     = React.useRef(null);
  const markersRef     = React.useRef({});

  // Init map once
  React.useEffect(() => {
    if (!window.L || !divRef.current || mapRef.current) return;

    const map = window.L.map(divRef.current, {
      center: [42.5, 12.5],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    });

    window.L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 20 }
    ).addTo(map);

    // User location dot
    const userHTML = `
      <div style="width:22px;height:22px;position:relative;">
        <div style="position:absolute;inset:0;border-radius:50%;
          background:rgba(40,108,255,0.22);
          animation:mapPulse 2s ease-in-out infinite;"></div>
        <div style="position:absolute;inset:4px;border-radius:50%;
          background:#286cff;border:2.5px solid #fff;
          box-shadow:0 2px 8px rgba(40,108,255,0.55);"></div>
      </div>`;
    const userIcon = window.L.divIcon({
      className: '', html: userHTML, iconSize: [22, 22], iconAnchor: [11, 11],
    });
    window.L.marker([41.9000, 12.4780], { icon: userIcon, zIndexOffset: 500 }).addTo(map);

    // Cluster group (with fallback if markercluster not loaded)
    if (window.L.markerClusterGroup) {
      const cluster = window.L.markerClusterGroup({
        iconCreateFunction: createClusterIcon,
        showCoverageOnHover: false,
        maxClusterRadius: 80,
        spiderfyOnMaxZoom: true,
        zoomToBoundsOnClick: true,
        animate: true,
        disableClusteringAtZoom: 14,
      });
      map.addLayer(cluster);
      clusterRef.current = cluster;
    } else {
      // Fallback: use the map itself as the "layer group"
      clusterRef.current = {
        clearLayers() { Object.values(markersRef.current).forEach(m => m.remove()); },
        addLayers(markers) { markers.forEach(m => m.addTo(map)); },
      };
    }

    mapRef.current = map;
    if (controlsRef) controlsRef.current = {
      zoomIn:  () => map.zoomIn(),
      zoomOut: () => map.zoomOut(),
    };
    requestAnimationFrame(() => { if (mapRef.current) mapRef.current.invalidateSize(); });
    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      markersRef.current = {};
      if (controlsRef) controlsRef.current = null;
    };
  }, []);

  // Centra la mappa sul locale selezionato (tray, marker o focus esterno)
  React.useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const v = venues.find(x => x.id === selectedId);
    if (!v) return;
    const z = Math.max(mapRef.current.getZoom(), 15);
    mapRef.current.flyTo([v.lat, v.lng - 0.0008], z, { duration: 0.8 });
  }, [selectedId]);

  // Rebuild markers when venues or selection changes
  React.useEffect(() => {
    if (!mapRef.current || !window.L || !clusterRef.current) return;

    clusterRef.current.clearLayers();
    markersRef.current = {};

    const newMarkers = [];
    venues.forEach(v => {
      const isSelected = v.id === selectedId;
      const icon = window.L.divIcon({
        className: '',
        html: createPinHTML(v, isSelected),
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      const marker = window.L.marker([v.lat, v.lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : 0,
      }).on('click', () => onVenueSelect(v));
      markersRef.current[v.id] = marker;
      newMarkers.push(marker);
    });

    clusterRef.current.addLayers(newMarkers);
  }, [venues, selectedId]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div ref={divRef} style={{ position: 'absolute', inset: 0 }}/>

<style>{`
        @keyframes mapPulse {
          0%,100% { transform:scale(1); opacity:0.7; }
          50% { transform:scale(2); opacity:0; }
        }
        .leaflet-container { background:#f5f0e8; font-family:-apple-system,sans-serif; }
        .leaflet-tile-pane { filter: saturate(0.92) brightness(1.02); }
        .marker-cluster { background:transparent !important; border:none !important; box-shadow:none !important; }
        .marker-cluster div { background:transparent !important; }
      `}</style>
    </div>
  );
}

// ─── Venue cards tray (Google Maps style) ─────────────────────────
function VenueCardsTray({ venues, onSelect }) {
  if (!venues.length) return null;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
      zIndex: 12, pointerEvents: 'none',
    }}>
      {/* Gradient fade */}
      <div style={{
        height: 48,
        background: 'linear-gradient(to top, rgba(0,0,0,0.06), transparent)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        display: 'flex', gap: 12,
        overflowX: 'auto', scrollbarWidth: 'none',
        padding: '0 16px 14px', pointerEvents: 'auto',
      }}>
        <style>{`.venue-tray-scroll::-webkit-scrollbar{display:none}`}</style>
        {venues.map(v => (
          <button key={v.id} onClick={() => onSelect(v)} style={{
            flexShrink: 0, width: 165, padding: 0,
            background: SURF, border: 'none', borderRadius: 18,
            cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
            boxShadow: '0 8px 28px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)',
          }}>
            <div style={{ position: 'relative' }}>
              <img src={v.photo} alt={v.name}
                style={{ width: '100%', height: 95, objectFit: 'cover', display: 'block' }}/>
              {/* Rating badge */}
              <div style={{
                position: 'absolute', top: 7, right: 7,
                background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(4px)',
                borderRadius: 999, padding: '3px 7px',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFD700">
                  <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>
                </svg>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#fff' }}>{v.rating}</span>
              </div>
              {/* Open/closed */}
              <div style={{
                position: 'absolute', bottom: 7, left: 7,
                background: v.open ? 'rgba(22,136,55,0.9)' : 'rgba(192,57,43,0.9)',
                borderRadius: 999, padding: '2px 8px',
                fontSize: 10.5, fontWeight: 700, color: '#fff',
              }}>
                {v.open ? 'Aperto' : 'Chiuso'}
              </div>
            </div>
            <div style={{ padding: '9px 11px 11px' }}>
              <div style={{
                fontSize: 13.5, fontWeight: 800, color: TEXT, letterSpacing: -0.2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{v.name}</div>
              <div style={{
                marginTop: 2, fontSize: 11.5, color: MUTED,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {v.cat}
                </span>
                <span style={{ flexShrink: 0, marginLeft: 6, color: TEXT, fontWeight: 600 }}>
                  {v.distance}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main MapScreen ────────────────────────────────────────────────
function MapScreen({ onBack, onTabHome, onTabProfile, onOpenFilters, activeFilterCount, onOpenVenue }) {
  const [active, setActive]         = React.useState(null);
  const [catFilter, setCatFilter]   = React.useState('all');
  const mapControlsRef              = React.useRef(null);
  const [searchQ, setSearchQ]       = React.useState('');

  // Focus richiesto da un'altra schermata (vetrina → "Indicazioni"):
  // seleziona il locale e la mappa ci vola sopra.
  React.useEffect(() => {
    let nm = null;
    try { nm = window.__byupMapFocus; window.__byupMapFocus = null; } catch {}
    if (!nm) return;
    const v = Object.values(VENUES_BY_CITY).flat().find(x => x.name === nm);
    if (v) setTimeout(() => setActive(v), 350);
  }, []);

  const allVenues = React.useMemo(
    () => Object.values(VENUES_BY_CITY).flat(),
    []
  );
  const filteredVenues = React.useMemo(() =>
    catFilter === 'all' ? allVenues : allVenues.filter(v => v.cuisine === catFilter),
    [catFilter, allVenues]
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: BG_PAGE, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {(() => { const K = window.ByupKit; return K ? <K.MascotMoment absolute pose="phone" pageKey="map" message="Tocca un locale per sbirciare il menu." bottom={118} size={116}/> : null; })()}

      {/* ── Header ── */}
      <div style={{
        padding: '56px 14px 10px',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        position: 'relative', zIndex: 20, flexShrink: 0,
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}>
        {/* Search row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{
            width: 36, height: 36, borderRadius: 999, border: 'none',
            background: '#1c0f15', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div style={{
            flex: 1, height: 42, borderRadius: 12, border: '1.5px solid #ebebeb',
            background: TINT, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7.5" stroke="#9a9a9a" strokeWidth="2"/>
              <path d="M20 20l-3.5-3.5" stroke="#9a9a9a" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Cerca ristorante o zona…"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: TEXT, background: 'transparent', minWidth: 0 }}
            />
          </div>

          <button onClick={onOpenFilters} style={{
            width: 42, height: 42, borderRadius: 12, border: `1.5px solid ${BORDER}`,
            background: TINT, cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M6 12h12M9 18h6" stroke={TEXT} strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {activeFilterCount > 0 && (
              <span style={{
                position: 'absolute', top: -3, right: -3, width: 17, height: 17,
                background: PINK, color: '#fff', borderRadius: 999,
                fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Category chips */}
        <div style={{
          display: 'flex', gap: 7, marginTop: 10,
          overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2,
        }}>
          <style>{`.cat-chips::-webkit-scrollbar{display:none}`}</style>
          {CATEGORIES.map(cat => {
            const on = catFilter === cat.id;
            return (
              <button key={cat.id} onClick={() => { setCatFilter(cat.id); setActive(null); }} style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: 999,
                border: `1.5px solid ${on ? PINK : BORDER}`,
                background: on ? PINK : SURF,
                color: on ? '#fff' : TEXT,
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Map ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', zIndex: 1 }}>
        <LeafletMap
          venues={filteredVenues}
          selectedId={active?.id}
          onVenueSelect={setActive}
          controlsRef={mapControlsRef}
        />

        {/* Venue count pill */}
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 1000,
          background: 'rgba(26,26,26,0.72)', backdropFilter: 'blur(6px)',
          color: '#fff', borderRadius: 999, padding: '5px 13px',
          fontSize: 11.5, fontWeight: 700, pointerEvents: 'none',
        }}>
          {filteredVenues.length} locali
        </div>

        {/* Top-right controls: recenter + zoom */}
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 1000,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {/* Recenter */}
          <button onClick={() => setActive(null)} style={{
            width: 42, height: 42, borderRadius: 12,
            background: SURF, border: 'none',
            boxShadow: '0 2px 12px rgba(0,0,0,0.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3.5" fill={PINK}/>
              <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" stroke={PINK} strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="7.5" stroke={PINK} strokeWidth="1.5" fill="none" opacity="0.35"/>
            </svg>
          </button>

          {/* Zoom pill */}
          <div style={{
            background: SURF, borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.14)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}>
            <button onClick={() => mapControlsRef.current?.zoomIn()} style={{
              width: 42, height: 42, border: 'none', background: SURF,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderBottom: '1px solid #ebebeb',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button onClick={() => mapControlsRef.current?.zoomOut()} style={{
              width: 42, height: 42, border: 'none', background: SURF,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Venue cards tray (visible when no sheet open) ── */}
      {!active && <VenueCardsTray venues={filteredVenues} onSelect={setActive}/>}

      {/* ── Venue bottom sheet ── */}
      {active && (
        <VenueSheet
          venue={active}
          onClose={() => setActive(null)}
          onOpenVenue={() => onOpenVenue(active)}
          onOpenMenu={() => { window.location.href = 'byup Menu.html?from=venue'; }}
        />
      )}
    </div>
  );
}

// ─── Bottom sheet for selected venue ──────────────────────────────
function VenueSheet({ venue, onClose, onOpenVenue, onOpenMenu }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.18)', zIndex: 20,
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: SURF, borderRadius: '22px 22px 0 0',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
        zIndex: 21,
        animation: 'sheetUp 280ms ease-out',
        padding: '10px 18px 44px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <div style={{ width: 38, height: 4, borderRadius: 999, background: TINT }}/>
        </div>

        <div onClick={onOpenVenue} style={{ cursor: 'pointer' }}>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
            <img src={venue.photo} alt={venue.name} style={{
              width: '100%', height: 140, objectFit: 'cover', display: 'block',
            }}/>
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)',
            }}/>
            <div style={{
              position: 'absolute', bottom: 10, left: 14, right: 14,
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>
                  {venue.name}
                </div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.82)', marginTop: 2 }}>
                  {venue.cat} · {venue.distance}
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)',
                borderRadius: 999, padding: '4px 10px',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFD700">
                  <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>
                </svg>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{venue.rating}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              fontSize: 13.5, fontWeight: 700,
              color: venue.open ? '#1c8a3a' : '#c0392b',
            }}>
              {venue.open ? 'Aperto ora' : 'Chiuso'}
            </span>
            <span style={{ color: MUTED, fontSize: 13 }}>
              {' · '}{venue.hours}
            </span>
          </div>
          <span style={{
            background: TINT, borderRadius: 999, padding: '4px 10px',
            fontSize: 12.5, fontWeight: 600, color: TEXT,
          }}>{venue.price}</span>
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <button onClick={(e) => { e.stopPropagation(); onOpenVenue(); }} style={{
            flex: 1, padding: '13px 0', borderRadius: 14,
            border: `1.5px solid ${PINK}`, background: SURF,
            color: PINK, fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
          }}>Prenota</button>
          <button onClick={(e) => { e.stopPropagation(); onOpenMenu(); }} style={{
            flex: 1, padding: '13px 0', borderRadius: 14, border: 'none',
            background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 100%)`,
            color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(227,36,89,0.40)',
          }}>Menù</button>
        </div>
      </div>
      <style>{`@keyframes sheetUp { from { transform:translateY(100%); } to { transform:translateY(0); } }`}</style>
    </>
  );
}

window.MapScreen = MapScreen;

// ─── Posta screen (unchanged) ─────────────────────────────────────
function PostaScreen({ onBack, onProfile, onlyNews = false, extraNews = [], onRecover }) {
  const [tab, setTab] = React.useState('news');

  const news = [
    { id: 1, title: 'Benvenuto in byup',
      preview: 'Esplora i locali sopra di te, ordina al tavolo o take away, ricevi offerte personalizzate.',
      ago: 'Un\'ora fa', kind: 'welcome' },
    { id: 2, title: 'Hai guadagnato 50 punti',
      preview: 'Per il tuo ultimo ordine da Ristorante Maria Grazia. Usali subito su un nuovo locale.',
      ago: '3 ore fa', kind: 'points' },
    { id: 3, title: 'Novità: ora puoi prenotare',
      preview: 'Da oggi puoi prenotare un tavolo direttamente dalla scheda del locale. Provalo!',
      ago: 'Ieri', kind: 'feature' },
    { id: 4, title: 'Recensione richiesta',
      preview: 'Com\'è andata la cena da Al Settembrini? Lascia un voto in 5 secondi.',
      ago: '2 giorni fa', kind: 'review' },
  ];

  const promo = [
    { id: 1, venue: 'Ristorante YX',
      preview: 'Hai un nuovo ristorante vicino a te. Provalo con il 20% di sconto entro venerdì.',
      ago: 'Un\'ora fa' },
    { id: 2, venue: 'Lounge 22',
      preview: 'Aperitivo 2x1 stasera dalle 18 alle 21. Mostra questa promo al bancone.',
      ago: '5 ore fa' },
    { id: 3, venue: 'Sforno Pizzeria',
      preview: 'Con qualsiasi pizza prenotata sabato sera ricevi una margherita in omaggio.',
      ago: 'Ieri' },
    { id: 4, venue: 'Caffè Centrale',
      preview: 'Da lunedì colazione a 3,50€ con cornetto e cappuccino. Solo per gli iscritti byup.',
      ago: '2 giorni fa' },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: SURF,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', color: TEXT,
    }}>
      <div style={{ padding: '60px 20px 0', flexShrink: 0 }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 999, border: 'none',
          background: '#1a1a1a', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginTop: 14 }}>Posta</div>
        <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>
          {onlyNews ? 'Aggiornamenti dal team byup' : (tab === 'news' ? 'Aggiornamenti dal team byup' : 'Offerte dai tuoi locali preferiti')}
        </div>
      </div>

      {!onlyNews && (
        <div style={{
          margin: '14px 20px 4px', flexShrink: 0,
          background: TINT, borderRadius: 12, padding: 4, display: 'flex', gap: 4,
        }}>
          {[
            { id: 'news',  label: 'Novità', count: news.length + extraNews.length },
            { id: 'promo', label: 'Promo per te', count: promo.length },
          ].map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: '9px 10px',
                background: active ? SURF : 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 700,
                color: active ? TEXT : MUTED,
                borderRadius: 9,
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.15s',
              }}>
                {t.label}
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                  background: active ? (t.id === 'news' ? PINK : '#FF6B35') : (__BYUP_DARK ? 'rgba(255,255,255,.08)' : TINT),
                  color: active ? '#fff' : MUTED,
                }}>{t.count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: `${onlyNews ? 18 : 12}px 16px 120px` }}>
        {(onlyNews || tab === 'news') && [...extraNews, ...news].map(n  => <ByupNewsCard   key={n.id} item={n} onClick={n.action === 'recover' ? onRecover : undefined}/>)}
        {!onlyNews && tab === 'promo' && promo.map(p => <PromoMessageCard key={p.id} item={p}/>)}
      </div>

      {(() => { const B = window.BottomTabBar; return B ? <B active="home" onHome={onBack} onProfile={() => onProfile && onProfile()}/> : null; })()}
    </div>
  );
}

function ByupNewsCard({ item, onClick }) {
  const iconByKind = {
    welcome: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
    points:  (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg>),
    feature: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L13.5 9 L21 10 L15.5 14.5 L17 21 L12 17 L7 21 L8.5 14.5 L3 10 L10.5 9 Z"/></svg>),
    review:  (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
    order:   (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l3 3v17l-3-2-2 2-2-2-2 2-2-2-2 2V4a2 2 0 0 1 1-2z"/><path d="M9 8h6M9 12h6"/></svg>),
  };
  return (
    <div onClick={onClick} style={{
      background: SURF, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 14, boxShadow: __BYUP_DARK ? 'none' : '0 2px 10px -6px rgba(77,18,46,.12)',
      marginBottom: 10, display: 'flex', gap: 12, cursor: 'pointer',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: `0 3px 10px ${PINK}40`,
      }}>
        {iconByKind[item.kind] || iconByKind.feature}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
          <div style={{ fontWeight: 800, fontSize: 14.5, color: TEXT, letterSpacing: -0.2 }}>byup</div>
          <div style={{ fontSize: 11.5, color: MUTED, flexShrink: 0 }}>{item.ago}</div>
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT, marginTop: 4, letterSpacing: -0.2 }}>
          {item.title}
        </div>
        <div style={{
          marginTop: 3, fontSize: 13, color: MUTED, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{item.preview}</div>
      </div>
    </div>
  );
}

function PromoMessageCard({ item }) {
  return (
    <div style={{
      background: SURF, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 16px',
      marginBottom: 10, cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: TEXT, letterSpacing: -0.2, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.venue}
        </div>
        <div style={{ fontSize: 11.5, color: MUTED, flexShrink: 0 }}>{item.ago}</div>
      </div>
      <div style={{
        marginTop: 4, fontSize: 13.5, color: MUTED, lineHeight: 1.4,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{item.preview}</div>
    </div>
  );
}

window.PostaScreen = PostaScreen;
