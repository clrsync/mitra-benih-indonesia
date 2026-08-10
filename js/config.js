// ==========================================
// CONFIGURATION & GLOBAL STATE
// ==========================================

// Deployed Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzpx49cxhcCIF3W6MwglOqAsX4bBmvhJI2JmE9jIerqukuB441XrEibAP6dHIbxWkFHNg/exec";

// WhatsApp Target Phone Number
const WHATSAPP_PHONE = "6285165658480";

/**
 * Format & Sanitize Image URLs to prevent Google Drive redirect & CSP errors
 */
function formatImageUrl(url) {
    if (!url || typeof url !== 'string') return url || '';
    
    if (url.startsWith('data:') || url.startsWith('images/')) {
        return url;
    }

    const match = url.match(/(?:file\/d\/|id=|\/d\/)([a-zA-Z0-9_-]{20,})/);
    if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
    return url;
}

// ==========================================
// DEFAULT FALLBACK DATASETS
// ==========================================

const defaultProducts = [
    {
        id: 1,
        name: "Bibit Alpukat Miki Unggul",
        category: "buah",
        price: 75000,
        rating: 4.9,
        reviews: 142,
        badge: "Bestseller",
        image: "images/alpukat_miki.webp",
        description: "Bibit Alpukat Miki hasil okulasi premium. Memiliki sifat genjah (sangat cepat berbuah), kulit tipis tahan ulat daun, serta daging buah yang sangat tebal, pulen, dan manis mentega tanpa serat.",
        instruction: "Sinar matahari penuh. Siram 1-2 kali sehari. Pemupukan NPK 1 bulan sekali setelah usia tanam 3 bulan. Mulai belajar berbuah pada usia 2-3 tahun setelah tanam."
    },
    {
        id: 2,
        name: "Bibit Durian Musang King Kaki 3",
        category: "buah",
        price: 120000,
        rating: 4.8,
        reviews: 98,
        badge: "Terpopuler",
        image: "images/durian_musang_king.jpg",
        description: "Bibit Durian Musang King asli dengan sistem kaki tiga (triple rootstock) untuk mempercepat penyerapan nutrisi dan membuat pohon lebih kokoh. Rasa buah manis legit berpadu sedikit pahit khas durian premium.",
        instruction: "Gunakan lubang tanam 60x60x60 cm dengan campuran kompos. Siram pagi hari. Lakukan pemangkasan cabang air secara berkala untuk merangsang pembuahan cepat."
    },
    {
        id: 3,
        name: "Benih Cabai Rawit Bara (Isi 50)",
        category: "sayur",
        price: 15000,
        rating: 4.7,
        reviews: 215,
        badge: "Diskon",
        image: "images/cabai_rawit.webp",
        description: "Benih cabai rawit tipe tegak varietas Bara unggul dari cap panah merah. Daya tumbuh sangat tinggi, sangat pedas, dan memiliki daya tahan ekstra terhadap penyakit layu bakteri serta antraknosa.",
        instruction: "Semai benih pada media cocopeat campur kompos. Setelah tumbuh 4 daun (usia 21 hari), pindahkan ke pot/polibag. Panen mulai dilakukan pada hari ke 75-80 setelah tanam."
    },
    {
        id: 4,
        name: "Benih Tomat Cherry Golden (Isi 30)",
        category: "sayur",
        price: 18000,
        rating: 4.8,
        reviews: 64,
        badge: "Terbaru",
        image: "images/tomat_cherry.webp",
        description: "Benih Tomat Cherry warna kuning emas cerah yang sangat produktif. Rasa buah sangat manis segar dan renyah. Sangat cocok ditanam di pekarangan rumah menggunakan pot/polibag maupun sistem hidroponik.",
        instruction: "Semai benih selama 10-14 hari. Berikan ajir/tiang penyangga setinggi 1.5 meter untuk rambatan pohon. Siram secukupnya jangan sampai tergenang air."
    },
    {
        id: 5,
        name: "Tanaman Hias Janda Bolong Rimbun",
        category: "hias",
        price: 45000,
        rating: 4.9,
        reviews: 189,
        badge: "Bestseller",
        image: "images/monstera.webp",
        description: "Tanaman hias indoor Monstera Adansonii (Janda Bolong) yang sudah rimbun dalam pot beserta turus penyangga kelapa. Berfungsi mempercantik sudut ruangan sekaligus menyaring polusi udara dalam rumah.",
        instruction: "Letakkan di tempat teduh (cahaya tidak langsung). Siram hanya ketika media tanam bagian atas mulai mengering (sekitar 2-3 hari sekali). Bersihkan daun dengan lap basah."
    },
    {
        id: 6,
        name: "Calathea Orbifolia Premium",
        category: "hias",
        price: 65000,
        rating: 4.6,
        reviews: 37,
        badge: "",
        image: "images/calathea.webp",
        description: "Calathea Orbifolia berdaun lebar bulat eksotis dengan garis/corak perak metalik yang sangat kontras. Tanaman hias mewah yang sangat digemari desainer interior untuk dekorasi ruang tamu minimalis.",
        instruction: "Sangat sensitif terhadap matahari langsung yang membakar daun. Jaga kelembaban udara dengan melakukan misting air secara berkala. Gunakan air bersih non-klorin."
    },
    {
        id: 7,
        name: "Benih Bunga Matahari Giant (Isi 20)",
        category: "bunga",
        price: 12000,
        rating: 4.7,
        reviews: 83,
        badge: "",
        image: "images/bunga_matahari.webp",
        description: "Benih Bunga Matahari tipe raksasa (Helianthus annuus Giant Single). Dapat tumbuh hingga setinggi 2 - 2.5 meter dengan kelopak bunga tunggal berwarna kuning cerah berdiameter hingga 30 cm.",
        instruction: "Tanam langsung benih ke tanah sedalam 1 cm di lokasi yang terkena paparan sinar matahari langsung minimal 6 jam sehari. Jaga tanah tetap lembab hingga berkecambah."
    },
    {
        id: 8,
        name: "Benih Lavender Vera Wangi (Isi 40)",
        category: "bunga",
        price: 20000,
        rating: 4.5,
        reviews: 52,
        badge: "Rekomendasi",
        image: "images/lavender.webp",
        description: "Benih Bunga Lavender Vera asli (English Lavender) yang kaya akan minyak esensial linalool beraroma wangi menenangkan. Sangat berguna sebagai pengusir nyamuk alami di pekarangan rumah.",
        instruction: "Taburkan benih di atas media semai steril, tutup sangat tipis dengan tanah. Butuh waktu kecambah agak lama (2-4 minggu). Jaga suhu tetap sejuk dan tidak tergenang air."
    }
];

const defaultCareersData = [
    {
        id: 1,
        title: "BUSINESS DEVELOPMENT",
        division: "marketing",
        divisionLabel: "MARKETING",
        type: "BUSINESS DEVELOPMENT",
        date: "01 Juli 2026",
        status: "active",
        description: "Mencari individu yang kompeten untuk mengembangkan kemitraan bisnis benih tanaman di berbagai wilayah Indonesia.",
        requirements: [
            "Pendidikan minimal D3/S1 Pemasaran, Agribisnis, atau bidang relevan.",
            "Pengalaman kerja minimal 1-2 tahun di bidang penjualan/business development (diutamakan sektor agro/ritel).",
            "Memiliki kemampuan negosiasi dan komunikasi yang sangat baik.",
            "Siap melakukan perjalanan dinas untuk perluasan area distribusi."
        ]
    },
    {
        id: 2,
        title: "TECHNICAL ASSISTANT",
        division: "marketing",
        divisionLabel: "MARKETING",
        type: "TECHNICAL ASSISTANT",
        date: "01 Juli 2026",
        status: "active",
        description: "Membantu tim pemasaran dalam memberikan konsultasi teknis budidaya tanaman kepada calon pembeli.",
        requirements: [
            "Pendidikan D3/S1 Agroteknologi, Agronomi, atau bidang pertanian sejenis.",
            "Memahami teknik budidaya bibit buah-buahan, benih sayur, dan pemupukan modern.",
            "Mampu membuat materi edukasi budidaya (tulisan maupun video singkat).",
            "Ramah, sabar, dan memiliki kemampuan pelayanan konsumen yang baik."
        ]
    },
    {
        id: 3,
        title: "STAF KEUANGAN & ADMINISTRASI",
        division: "keuangan",
        divisionLabel: "KEUANGAN",
        type: "FINANCE & ADMIN",
        date: "02 Juli 2026",
        status: "active",
        description: "Mengelola pembukuan, transaksi penjualan harian, dan administrasi pengiriman bibit tanaman.",
        requirements: [
            "Pendidikan minimal SMK/D3 Akuntansi atau Keuangan.",
            "Menguasai aplikasi spreadsheet (MS Excel/Google Sheets) dan software akuntansi dasar.",
            "Teliti, jujur, bertanggung jawab, dan terbiasa dengan tenggat waktu.",
            "Memahami administrasi logistik/ekspedisi pengiriman barang."
        ]
    },
    {
        id: 4,
        title: "OPERASIONAL NURSERY (KEBUN)",
        division: "kebun",
        divisionLabel: "KEBUN",
        type: "NURSERY OPERATIONS",
        date: "03 Juli 2026",
        status: "active",
        description: "Bertanggung jawab dalam perawatan tanaman, penyiraman, okulasi, dan pemeliharaan stok bibit di kebun pembibitan.",
        requirements: [
            "Pendidikan minimal SMK Pertanian atau memiliki pengalaman budidaya tanaman.",
            "Menguasai teknik perbanyakan tanaman (okulasi, sambung pucuk, stek).",
            "Fisik kuat, jujur, menyukai pekerjaan lapangan/kebun.",
            "Siap ditempatkan di kebun pembibitan Sleman, Yogyakarta."
        ]
    },
    {
        id: 5,
        title: "DIGITAL MARKETING SPECIALIST",
        division: "marketing",
        divisionLabel: "MARKETING",
        type: "DIGITAL MARKETING",
        date: "04 Juli 2026",
        status: "active",
        description: "Mengelola media sosial, membuat konten video edukasi tanaman, dan menjalankan iklan digital untuk meningkatkan penjualan benih.",
        requirements: [
            "Pendidikan minimal D3/S1 Ilmu Komunikasi, Pemasaran Digital, atau Desain Grafis.",
            "Menguasai tools editing video/foto (CapCut, Canva, Photoshop).",
            "Memahami cara kerja media sosial (TikTok, Instagram, YouTube) dan optimasi SEO/SEM.",
            "Memiliki ketertarikan tinggi di dunia tanaman/berkebun menjadi nilai tambah."
        ]
    }
];

const defaultDivisions = [
    { id: "keuangan", label: "KEUANGAN" },
    { id: "marketing", label: "MARKETING" },
    { id: "pt-mbi", label: "PT MBI" }
];

const defaultActivities = [
    {
        id: 1,
        title: "Pengiriman Bibit ke Sumatra",
        date: "10 Juli 2026",
        image: "images/nursery_view.jpg",
        description: "Proses pengemasan dan pengiriman ratusan bibit alpukat aligator dan durian bawor kaki tiga pesanan kelompok tani di Sumatra."
    },
    {
        id: 2,
        title: "Pemeriksaan Mutu Okulasi",
        date: "05 Juli 2026",
        image: "images/quality_check.webp",
        description: "Tim ahli agronomi kami memverifikasi hasil sambung pucuk (okulasi) durian musang king untuk memastikan tingkat keberhasilan tumbuh."
    },
    {
        id: 3,
        title: "Kunjungan Lapangan & Edukasi",
        date: "28 Juni 2026",
        image: "images/nursery_view.jpg",
        description: "Menerima kunjungan rombongan mahasiswa pertanian Sleman untuk praktik langsung teknik grafting dan budidaya bibit buah."
    }
];

const defaultVideos = [
    {
        id: 1,
        title: "Tur Kebun Pembibitan Mitra Benih Indonesia",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
        id: 2,
        title: "Tutorial Teknik Okulasi & Grafting Unggul",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
];

const baseTestimonials = [
    {
        id: 101,
        stars: 5,
        text: "Bibit alpukat miki yang saya pesan sampai di Medan dengan kondisi sangat segar! Daunnya lebat, packing kayu sangat aman. Sekarang sudah 4 bulan tanam dan pertumbuhannya sangat cepat. Recommended seller!",
        name: "Budi Santoso",
        role: "Pemilik Kebun Buah - Medan",
        avatar: "images/avatar1.webp"
    },
    {
        id: 102,
        stars: 5,
        text: "Pengiriman cepat ke Surabaya. Bibit durian musang king kaki 3 sesuai deskripsi, batang kokoh dan akar sudah kuat. Pelayanan admin sangat ramah dan merespons konsultasi budidaya dengan sangat jelas.",
        name: "Siti Rahmawati",
        role: "Hobiis Tanaman - Surabaya",
        avatar: "images/avatar2.webp"
    },
    {
        id: 103,
        stars: 5,
        text: "Benih cabai rawit bara daya tumbuhnya luar biasa tinggi, hampir 95% berkecambah semua! Sangat cocok untuk usaha tani skala kecil saya di Kendal. Sukses terus untuk Mitra Benih Indonesia!",
        name: "Hendra Wijaya",
        role: "Petani Sayur - Kendal",
        avatar: "images/avatar3.webp"
    }
];

// ==========================================
// SHARED IN-MEMORY STATE
// ==========================================

let products = [...defaultProducts];
let careersData = [...defaultCareersData];
let divisions = [...defaultDivisions];
let activitiesData = [...defaultActivities];
let videosData = [...defaultVideos];
let customTestimonials = [];
let cart = [];

let isAdmin = sessionStorage.getItem('mitrabenih_admin_logged_in') === 'true';
let editingProductId = null;
let activeCategory = 'all';
let searchQuery = '';
let activeDivision = 'all';
