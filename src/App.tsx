import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Minus,
  Settings2,
  Film, 
  Loader2,
  Rocket,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  GripVertical,
  Check,
  Maximize,
  Play,
  Pause,
  RotateCcw,
  Info,
  Upload,
  Columns,
  Trash,
  Trash2,
  Copy,
  Pencil,
  Globe,
  Instagram,
  Github,
  Keyboard,
  Undo,
  Redo,
  History,
  Clock,
  Mouse,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';
import { cn } from './lib/utils';

// Global GSAP Configuration for high performance
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  gsap.config({
    force3D: true,
    nullTargetWarn: false,
    units: { left: "px", top: "px", rotation: "deg" }
  });
  // Enable hardware acceleration for all GSAP instances by default
  gsap.defaults({
    ease: "power2.out",
    duration: 0.5,
    force3D: true,
    lazy: true,
  });
}
// @ts-ignore - webm-muxer types might be missing in some environments
import { Muxer, ArrayBufferTarget } from 'webm-muxer';

interface CreditEntry {
  id: string;
  role: string;
  names: string[];
  isPairs?: boolean;
}

interface ProjectSettings {
  fontFamily: string;
  fontSize: number;
  roleColor: string;
  roleOpacity: number;
  namesColor: string;
  namesOpacity: number;
  bgColor: string;
  direction: Direction;
  animationType: AnimationType;
  paddingText: number;
  marginBlock: number;
  roleFontSize: number;
  lineHeight: number;
  roleNameGap: number;
  namesGap: number;
  roleBold: boolean;
  roleItalic: boolean;
  namesBold: boolean;
  namesItalic: boolean;
  animationDuration: number;
  showNoise: boolean;
  noiseOpacity: number;
  showScanlines: boolean;
  vignette: number;
  pairsGap: number;
  activePreset: string;
  textShadowBlur: number;
  textShadowColor: string;
  textShadowOpacity: number;
  textOutline: boolean;
  textOutlineWidth: number;
  textOutlineColor: string;
  letterSpacing: number;
}

type Direction = 'bottomToTop' | 'topToBottom' | 'leftToRight' | 'rightToLeft';
type AnimationType = 'scroll' | 'fade' | 'zoom' | 'blur' | 'slide' | 'glitch';
type View = 'hero' | 'editor';

const PRESETS = {
  default: {
    fontFamily: 'Kanit',
    fontSize: 36,
    roleFontSize: 14,
    roleOpacity: 0.2,
    namesOpacity: 1,
    roleBold: false,
    namesBold: false,
    animationType: 'scroll' as AnimationType,
    animationDuration: 4,
    marginBlock: 120,
    pairsGap: 80,
    activePreset: 'default'
  },
  cinematic: {
    fontFamily: 'Inter',
    fontSize: 40,
    roleFontSize: 16,
    roleOpacity: 0.4,
    namesOpacity: 1,
    roleBold: true,
    namesBold: true,
    animationType: 'scroll' as AnimationType,
    animationDuration: 5,
    marginBlock: 150,
    pairsGap: 100,
    activePreset: 'cinematic'
  },
  indie: {
    fontFamily: 'JetBrains Mono',
    fontSize: 32,
    roleFontSize: 14,
    roleOpacity: 0.6,
    namesOpacity: 0.9,
    roleBold: false,
    namesBold: false,
    animationType: 'fade' as AnimationType,
    animationDuration: 3,
    marginBlock: 100,
    pairsGap: 60,
    activePreset: 'indie'
  },
  minimal: {
    fontFamily: 'Inter',
    fontSize: 28,
    roleFontSize: 12,
    roleOpacity: 0.3,
    namesOpacity: 0.8,
    roleBold: false,
    namesBold: true,
    animationType: 'slide' as AnimationType,
    animationDuration: 4,
    marginBlock: 80,
    pairsGap: 40,
    activePreset: 'minimal'
  },
  classic: {
    fontFamily: 'Crimson Text',
    fontSize: 42,
    roleFontSize: 18,
    roleOpacity: 0.5,
    namesOpacity: 1,
    roleBold: false,
    namesBold: false,
    animationType: 'scroll' as AnimationType,
    animationDuration: 6,
    marginBlock: 180,
    pairsGap: 120,
    activePreset: 'classic'
  },
  impact: {
    fontFamily: 'Archivo Black',
    fontSize: 50,
    roleFontSize: 20,
    roleOpacity: 0.3,
    namesOpacity: 1,
    roleBold: true,
    namesBold: true,
    animationType: 'zoom' as AnimationType,
    animationDuration: 3,
    marginBlock: 100,
    pairsGap: 80,
    activePreset: 'impact'
  },
  modernist: {
    fontFamily: 'Syne',
    fontSize: 44,
    roleFontSize: 16,
    roleOpacity: 0.5,
    namesOpacity: 1,
    roleBold: true,
    namesBold: true,
    animationType: 'fade' as AnimationType,
    animationDuration: 4,
    marginBlock: 140,
    pairsGap: 90,
    activePreset: 'modernist'
  },
  industrial: {
    fontFamily: 'Bebas Neue',
    fontSize: 52,
    roleFontSize: 22,
    roleOpacity: 0.6,
    namesOpacity: 1,
    roleBold: false,
    namesBold: false,
    animationType: 'scroll' as AnimationType,
    animationDuration: 3,
    marginBlock: 110,
    pairsGap: 70,
    activePreset: 'industrial'
  }
};

const RENDERING_TEXTS = [
  "SEDANG RENDER",
  "MENGEKSPOR FRAME",
  "DALAM PROSES EKSPOR"
];

const translations = {
  id: {
    nav: { home: 'BERANDA', about: 'TENTANG', documentation: 'DOKUMENTASI', faq: 'FAQ', getStarted: 'MULAI', selectLanguage: 'PILIH BAHASA' },
    hero: {
      tag1: "Engine Kredit Generasi Baru",
      tag2: "Sangat Mudah Digunakan",
      tag3: "Buat Kredit Secara Gratis",
      tag4: "Akses Dimana Saja & Kapan Saja",
      description: "Alat Profesional untuk membuat kredit film secara otomatis",
      button: "Mulai Produksi",
      scroll: "SCROLL UNTUK EKSPLORASI"
    },
    about: {
      title: "DAFTAR KRU ENGINE",
      description: "Platform revolusioner untuk para filmmaker menghemat waktu dalam pembuatan closing credits. Dengan sistem otomatisasi engine kami, anda cukup memasukkan data dan biarkan kami yang bekerja menciptakan visual sinematik yang memukau.",
      card1Title: "01_AUTO",
      card1Desc: "Alur Kerja Otomatis",
      card2Title: "02_PRO",
      card2Desc: "Visual Kelas Sinema",
      tutorialTitle: "Tutorial Engine",
      tutorialDesc: "Pelajari teknik dasar pembuatan kredit engine dalam hitungan detik. Semua fitur didesain untuk kemudahan workflow anda."
    },
    documentation: {
      title: "SEMUA",
      heading: "Tutorial &\nPanduan",
      subheading: "Kuasai cara penggunaan DaftarKru Engine dengan pintasan keyboard dan tonton video demo.",
      videoTitle: "VIDIO DEMO DAFTARKRU ENGINE",
      kbdTitle: "Pintasan Keyboard",
      kbdDesc: "Tingkatkan produktivitas Anda menggunakan pintasan keyboard berikut di layar workspace (Laptop/Desktop):",
      guidesTitle: "Panduan Fitur Utama",
      guide1Title: "1. Pengunggahan Font Kustom",
      guide1Desc: "Unggah file font .ttf, .otf, atau .woff milik Anda sendiri di bagian 'Font Style' untuk menyesuaikan identitas teks film Anda.",
      guide3Title: "3. Mode Grid Pasangan (Pairs)",
      guide3Desc: "Aktifkan mode 'Pairs' di panel tampilan untuk meletakkan Posisi dan Nama berdampingan secara horizontal dengan garis hubung otomatis."
    },
    faq: {
      title: "Pusat Bantuan",
      heading: "Pertanyaan\nPopuler",
      subheading: "Semua jawaban yang anda butuhkan untuk memulai produksi kredit film anda hari ini.",
      q1: "Apa itu DaftarKru Engine?",
      a1: "DaftarKru Engine adalah toolkit berbasis web untuk membuat credit film secara otomatis dengan berbagai pilihan desain dan animasi profesional yang siap pakai.",
      q2: "Apakah saya bisa menggunakan font sendiri?",
      a2: "Tentu saja! Pada panel 'Font Style', anda dapat mengunggah file font kustom Anda (.ttf, .otf, atau .woff) untuk mendapatkan tampilan yang sesuai dengan keinginan anda.",
      q3: "Berapa resolusi maksimal ekspor?",
      a3: "Standar ekspor kami adalah Full HD (1920x1080) with framerate hingga 60 FPS untuk kualitas video yang sangat halus dan tajam.",
      q4: "Apakah DaftarKru sepenuhnya gratis?",
      a4: "Ya. DaftarKru hadir untuk mempermudah proses pembuatan Credit Title anda secara otomatis tanpa mengeluarkan biaya sedikitpun.",
      q5: "Kenapa ukuran teks pada hasil ekspor tidak sama seperti pada pratinjau?",
      a5: "Karena rasio pada pratinjau dan hasil ekspor berbeda. Kami sarankan anda menginput ukuran teks lebih besar dari yang seharusnya anda inginkan (teks yang terpotong pada pratinjau tidak akan memengaruhi hasil ekspor)."
    },
    getStarted: {
      title: "Siap Untuk Memulai?",
      subtitle: "Bergabunglah dengan ribuan pembuat film yang telah menghemat waktu mereka dengan otomasi kami.",
      button: "Mulai Sekarang"
    },
    editor: {
      undo: "Batal",
      projectOptions: "Opsi Proyek",
      projectName: "Nama Proyek",
      backHome: "Kembali ke Beranda",
      creditInput: "Input Kredit",
      rolePlaceholder: "NAMA POSISI (misal: DIRECTOR)",
      namesPlaceholder: "NAMA ORANG (ENTER PER BARIS)",
      tapeList: "Daftar Tape",
      delete: "Hapus",
      selectAll: "Pilih Semua",
      unselectAll: "Batal Pilih",
      emptyList: "Daftar kosong",
      visualConsole: "Konsol Visual Designer",
      fineTuning: "Kontrol Fine-Tuning",
      fineTuningDesc: "Fine-Tuning Controls",
      renderExport: "RENDER & EKSPOR",
      rendering: "SEDANG RENDERING",
      generatingFrames: "Menghasilkan frame untuk",
      processing: "Memproses Aliran Studio",
      resolution: "Resolusi",
      framerate: "Framerate",
      format: "Format",
      fullscreen: "Pratinjau Layar Penuh",
      exitFullscreen: "Keluar Layar Penuh",
      version: "Versi 1",
      editTape: "Edit Tape",
      deleteTape: "Hapus Tape",
      duplicateTape: "Duplikat Tape",
      fontStyle: "1. Gaya Font",
      motionType: "2. Tipe Gerak",
      appearance: "3. Tampilan",
      backdrop: "4. Backdrop",
      canvas: "KANVAS",
      visuals: "VISUAL",
      opacity: "Opasitas",
      identityLabel: "Label Identitas",
      professionalNames: "Nama Profesional",
      overlayEffects: "Efek Overlay",
      fimmGrain: "FILM GRAIN",
      scanlines: "SCANLINES",
      vignette: "Vignette",
      textShadow: "Shadow & Glow",
      textShadowBlur: "Radius Blur",
      textShadowOpacity: "Opasitas Shadow",
      textOutline: "Outline Teks",
      textOutlineWidth: "Ketebalan Outline",
      letterSpacing: "Jarak Antar Huruf",
      filmGrainIntensity: "Intensitas Grain",
      sceneSpeed: "DURASI SCENE (DETIK) / KECEPATAN SCROLL",
      scrollModes: "Untuk mode scene, ini mengatur durasi per teks. Untuk scroll, ini mengatur kecepatan (1 lambat - 10 cepat).",
      recordingProgress: "REKAMAN_SEDANG_BERJALAN",
      rawFormat: "4K_RAW_60FPS",
      designBase: "NO_SUMBER_DATA",
      cancelEditing: "Batal Edit",
      nameSize: "Ukuran Nama",
      roleSize: "Ukuran Posisi",
      blockSpace: "Jarak Blok",
      roleGap: "Jarak Posisi",
      nameGap: "Jarak Nama",
      lineHeight: "Tinggi Baris",
      previewMode: "Mode Pratinjau: High Fidelity",
      exportWarning: "Pastikan anda sedikit menambahkan ukuran nama dari yang seharusnya anda inginkan. Teks yang terpotong di layar preview tidak akan memengaruhi hasil ekspor.",
      pairsMode: "Mode Pairs",
      pairsGap: "Jarak Pairs",
      presets: "5. PRESET",
      uploadFont: "Upload Font",
      uploadLogo: "Logo",
      logoGrid: "Kolom",
      logoSpacing: "Spasi",
      roleColor: "Warna Posisi",
      namesColor: "Warna Nama",
      backgroundColor: "Warna Latar",
    },
    langToggles: {
      switch: "Ganti Bahasa"
    }
  },
  en: {
    nav: { home: 'HOME', about: 'ABOUT', documentation: 'DOCUMENTATION', faq: 'FAQ', getStarted: 'START', selectLanguage: 'SELECT LANGUAGE' },
    hero: {
      tag1: "Next Generation Credits Engine",
      tag2: "Extremely easy to use",
      tag3: "Create credits for free",
      tag4: "Create credits anywhere, anytime",
      description: "Professional tool for automated film credits generation",
      button: "Start Production",
      scroll: "SCROLL TO EXPLORE"
    },
    about: {
      title: "CREW LIST ENGINE",
      description: "A revolutionary platform for filmmakers to save time in creating closing credits. With our engine's automation system, simply input the data and let us work on creating stunning cinematic visuals.",
      card1Title: "01_AUTO",
      card1Desc: "Automated Workflow",
      card2Title: "02_PRO",
      card2Desc: "Cine-Grade Visuals",
      tutorialTitle: "Engine Tutorial",
      tutorialDesc: "Learn the basic techniques of creating credits engine in seconds. All features are designed for your workflow convenience."
    },
    documentation: {
      title: "SEMUA",
      heading: "Tutorials &\nGuides",
      subheading: "Master the use of DaftarKru Engine with specialized keyboard shortcuts and feature overviews.",
      videoTitle: "Official Video Tutorial",
      kbdTitle: "Keyboard Shortcuts",
      kbdDesc: "Boost your productivity with the following keyboard hotkeys inside the workspace (Laptop/Desktop):",
      guidesTitle: "Core Feature Guides",
      guide1Title: "1. Custom Font Upload",
      guide1Desc: "Upload your own .ttf, .otf, or .woff file in the 'Font Style' panel to match your film's typography design.",
      guide3Title: "3. Grid Pairs Layout",
      guide3Desc: "Toggle 'Pairs Mode' inside the appearance panel to align roles and names horizontally with adjustable gaps."
    },
    faq: {
      title: "Support Center",
      heading: "Popular\nQuestions",
      subheading: "All the answers you need to start producing your film today.",
      q1: "What is DaftarKru Engine?",
      a1: "DaftarKru Engine is a web-based toolkit for creating film credits automatically with various professional design and animation options ready to use.",
      q2: "Can I use my own fonts?",
      a2: "Absolutely! In the 'Font Style' panel, you can upload your custom font files (.ttf, .otf, or .woff) to get the exact look you want.",
      q3: "What is the maximum export resolution?",
      a3: "Our export standard is Full HD (1920x1080) with a framerate of up to 60 FPS for smooth and sharp video quality.",
      q4: "Is DaftarKru completely free?",
      a4: "Yes. DaftarKru is here to simplify your credit title creation process automatically without any cost.",
      q5: "Why is the text size in the exported result different from the preview?",
      a5: "Because the ratio between the preview and the export result differs. We suggest you input a larger text size than you actually want (text cut off in the preview will not affect the export result)."
    },
    getStarted: {
      title: "Ready to Start?",
      subtitle: "Join thousands of filmmakers who have saved their time with our automation.",
      button: "Start Now"
    },
    editor: {
      undo: "Undo",
      projectOptions: "Project Options",
      projectName: "Project Name",
      backHome: "Back to Home",
      creditInput: "Credit Input",
      rolePlaceholder: "ROLE NAME (e.g. DIRECTOR)",
      namesPlaceholder: "PERSON NAMES (ENTER PER LINE)",
      tapeList: "Tape List",
      delete: "Delete",
      selectAll: "Select All",
      unselectAll: "Unselect",
      emptyList: "List is empty",
      visualConsole: "Visual Designer Console",
      fineTuning: "Fine-Tuning Panel",
      fineTuningDesc: "Fine-Tuning Controls",
      renderExport: "RENDER & EXPORT",
      rendering: "RENDERING",
      generatingFrames: "Generating frames for",
      processing: "Processing Studio Stream",
      resolution: "Resolution",
      framerate: "Framerate",
      format: "Format",
      fullscreen: "Fullscreen Preview",
      exitFullscreen: "Exit Fullscreen",
      version: "Version 1",
      editTape: "Edit Tape",
      deleteTape: "Delete Tape",
      duplicateTape: "Duplicate Tape",
      fontStyle: "1. Font Style",
      motionType: "2. Motion Type",
      appearance: "3. Appearance",
      backdrop: "4. Backdrop",
      canvas: "CANVAS",
      visuals: "VISUALS",
      opacity: "Opacity",
      identityLabel: "Identity Label",
      professionalNames: "Professional Names",
      overlayEffects: "Overlay Effects",
      fimmGrain: "FILM GRAIN",
      scanlines: "SCANLINES",
      vignette: "Vignette",
      textShadow: "Shadow & Glow",
      textShadowBlur: "Blur Radius",
      textShadowOpacity: "Shadow Opacity",
      textOutline: "Text Outline",
      textOutlineWidth: "Outline Width",
      letterSpacing: "Letter Spacing",
      filmGrainIntensity: "Grain Intensity",
      sceneSpeed: "SCENE DURATION (SEC) / SCROLL SPEED",
      scrollModes: "For scene modes, sets the duration per text. For scroll, sets speed (1 slow - 10 fast).",
      recordingProgress: "RECORDING_IN_PROGRESS",
      rawFormat: "4K_RAW_60FPS",
      designBase: "NO_DATA_SOURCE",
      cancelEditing: "Cancel Editing",
      nameSize: "Name Size",
      roleSize: "Role Size",
      blockSpace: "Block Space",
      roleGap: "Role Gap",
      nameGap: "Name Gap",
      lineHeight: "Line Height",
      previewMode: "Preview Mode: High Fidelity",
      exportWarning: "Please be sure to increase the name size slightly more than you intended. Text that appears cut off in the preview screen will not affect the exported result.",
      pairsMode: "Pairs Mode",
      pairsGap: "Pairs Gap",
      presets: "5. PRESETS",
      uploadFont: "Upload Font",
      roleColor: "Role Color",
      namesColor: "Names Color",
      backgroundColor: "Background Color",
    },
    langToggles: {
      switch: "Switch Language"
    }
  },
};

type Lang = 'id' | 'en';

const TypingDescription = ({ lang }: { lang: Lang }) => {
  const text = translations[lang].hero.description;

  return (
    <motion.p
      key={lang}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="inline-block"
    >
      {text}
    </motion.p>
  );
};

export function ArcadeEmbed() {
  return (
    <div style={{ position: 'relative', paddingBottom: 'calc(56.25%)', height: '0', width: '100%' }}>
      <iframe
        src="https://demo.arcade.software/video/hNLbRuPlfW6ZLvStZdyH?embed&embed_mobile=inline&embed_desktop=inline&squared=true&show_copy_link=true"
        title="Panduan Lengkap DaftarKru Engine Dari Awal Hingga Rendering"
        frameBorder="0"
        loading="lazy"
        allowFullScreen
        allow="clipboard-write"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', colorScheme: 'light' }}
      />
    </div>
  )
}

const Navbar = React.memo(({ lang, setLang, isMobileMenuOpen, setIsMobileMenuOpen, activeSection, setActiveSection, view, setView, isHidden, isScrolled, lenisRef }: { 
  lang: Lang, 
  setLang: (l: Lang) => void, 
  isMobileMenuOpen: boolean, 
  setIsMobileMenuOpen: (v: boolean) => void,
  activeSection: string,
  setActiveSection: (v: string) => void,
  view: View,
  setView: (v: View) => void,
  isHidden: boolean,
  isScrolled: boolean,
  lenisRef: React.RefObject<Lenis | null>
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const scrollOptions = {
        duration: 1.2,
        lock: true,
        easing: (t: number) => 1 - Math.pow(1 - t, 4), // Smooth power4 out
        onComplete: () => {
          ScrollTrigger.refresh();
        }
      };
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, scrollOptions);
      } else {
        gsap.to(window, {
          duration: 1.2,
          scrollTo: { y: el, offsetY: 0 },
          ease: "power4.out",
          overwrite: true,
          onComplete: () => {
            ScrollTrigger.refresh();
          }
        });
      }
    }
  };

  const getActiveLabel = () => {
    if (view === 'editor') return lang === 'id' ? 'RUANG KERJA' : 'WORKSPACE';
    
    // If we just entered hero, activeSection might be 'editor' for a frame
    let item = activeSection;
    if (item === 'editor') item = 'home';
    if (item === 'get-started') item = 'getStarted';
    
    return translations[lang].nav[item as keyof typeof translations.id.nav] || item.toUpperCase();
  };

  return (
    <header>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: isHidden ? -120 : 0, 
          opacity: isHidden ? 0 : 1 
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-6 sm:top-8 left-1/2 -translate-x-1/2 z-[999] p-1 rounded-none border transition-all duration-200 flex items-center justify-between gap-1",
          isScrolled 
            ? "bg-black/90 backdrop-blur-2xl border-white/20 f1-shadow" 
            : "bg-black/60 backdrop-blur-md border-white/10"
        )}
      >
        {/* UNIFIED COMPACT PILL LAYOUT FOR ALL SCREEN BREAKPOINTS */}
        <div className="flex items-center justify-between w-[220px] xs:w-[250px] sm:w-[300px] md:w-[350px] h-9 sm:h-10 px-2 pl-3">
          <div className="flex items-center gap-2 overflow-hidden select-none flex-1 mr-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shrink-0" />
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white truncate">
              {getActiveLabel()}
            </span>
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white text-white hover:text-black hover:border-white border border-white/10 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-[2px_2px_0px_rgba(255,255,255,0.05)] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <Menu2Lines className="w-4 h-4" />
            <span>MENU</span>
          </button>
        </div>
      </motion.nav>

      {/* COOL RESPONSIVE DARK OVERLAY DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-drawer-menu"
            initial={{ opacity: 0, clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' }}
            animate={{ opacity: 1, clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-24"
          >
            {/* Top glowing laser line during opening */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-800 via-white to-zinc-800 origin-left"
            />

            {/* Tech-brutalist grid background behind the mobile drawer */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            
            {/* Header Area */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-[0.25em]">NAVBAR DAFTARKRU</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-white/10 hover:border-white hover:bg-white hover:text-black transition-all duration-200 cursor-pointer text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav Links Container */}
            <div className="flex-1 flex flex-col justify-center py-8 relative z-10">
              <div className="space-y-3 sm:space-y-5 max-w-md w-full mx-auto">
                {['home', 'about', 'documentation', 'faq', 'getStarted'].map((item, idx) => {
                  const targetId = item === 'getStarted' ? 'get-started' : item;
                  const isActive = view === 'hero' && activeSection === targetId;
                  return (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.4 }}
                    >
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          if (view === 'editor') {
                            if (item === 'home') {
                              // Hard refresh as requested for "clean state" when returning to home
                              window.location.href = window.location.origin;
                              return;
                            }
                            
                            setView('hero');
                            // Set target immediately to avoid "Home" flicker
                            const newSection = targetId === 'get-started' ? 'get-started' : targetId;
                            setActiveSection(newSection);
                            
                            // Small delay to allow View change before scrolling
                            setTimeout(() => {
                              if (item === 'home') {
                                window.scrollTo(0, 0);
                                setActiveSection('home');
                              } else {
                                scrollTo(targetId);
                              }
                              ScrollTrigger.refresh();
                            }, 100);
                          } else {
                            if (item === 'home') {
                              if (lenisRef.current) {
                                lenisRef.current.scrollTo(0, { duration: 1.5 });
                              } else {
                                gsap.to(window, { duration: 1.2, scrollTo: 0, ease: "power4.out", overwrite: true });
                              }
                            } else {
                              scrollTo(targetId);
                            }
                          }
                        }}
                        className={cn(
                          "w-full text-left font-black tracking-widest uppercase transition-all duration-300 py-3 sm:py-4 flex items-center justify-between border-b border-white/5 group",
                          isActive ? "text-white scale-100" : "text-zinc-500 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span className="font-mono text-[9px] sm:text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors">0{idx + 1} //</span>
                          <span className={cn("text-base sm:text-xl lg:text-2xl tracking-[0.25em]", isActive && "underline underline-offset-8 decoration-white")}>
                            {translations[lang].nav[item as keyof typeof translations.id.nav]}
                          </span>
                        </div>
                        {isActive ? (
                          <div className="w-2.5 h-2.5 bg-white" />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-white/0 group-hover:bg-white/20 transition-all" />
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Language Selection inside Drawer Menu */}
            <div className="border-t border-white/10 pt-6 relative z-10 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-md w-full mx-auto">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{translations[lang].nav.selectLanguage}</span>
              <div className="flex gap-2 w-full sm:w-auto">
                {(['id', 'en'] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={cn(
                      "flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-bold text-center uppercase tracking-widest transition-all cursor-pointer border",
                      lang === l 
                        ? "bg-white border-white text-black font-black" 
                        : "bg-zinc-950/20 border-white/10 text-zinc-400 hover:text-white hover:border-white"
                    )}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

const FilmFrame = ({ ke }: { ke: number; key?: string }) => (
  <div className="w-[280px] h-[90px] bg-zinc-950 border-y border-zinc-800 flex flex-col justify-between p-1.5 relative shrink-0 select-none">
    {/* Sprocket Holes / Perforations at Top */}
    <div className="flex justify-between w-full px-1">
      {[...Array(8)].map((_, p) => (
        <div key={p} className="w-3 h-1.5 bg-black border border-zinc-900 rounded-[1px]" />
      ))}
    </div>

    {/* Film Frame Content Panel */}
    <div className="flex-1 my-1 mx-0.5 bg-black border border-zinc-900/60 flex flex-col justify-between py-1 px-3 relative overflow-hidden">
      <div className="flex justify-between items-center w-full">
        <span className="text-[7px] font-mono tracking-[0.2em] text-zinc-600 font-bold uppercase">
          KODAK 400TX
        </span>
        <span className="text-[7px] font-mono text-zinc-600">
          24fps
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-extrabold tracking-[0.25em] text-zinc-500 uppercase leading-none italic select-none">
          {ke % 2 === 0 ? "DAFTARKRU" : "CINE LABS"}
        </span>
        <div className="flex gap-1 items-end">
          <span className="text-[8px] font-mono text-zinc-650 bg-zinc-955 px-1 py-0.5 leading-none">
            {100 + ke * 3}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center w-full text-[6px] font-mono text-zinc-600">
        <span>SEC {ke + 1}</span>
        <span>00:03:{10 + ke}</span>
      </div>
    </div>

    {/* Sprocket Holes / Perforations at Bottom */}
    <div className="flex justify-between w-full px-1">
      {[...Array(8)].map((_, p) => (
        <div key={p} className="w-3 h-1.5 bg-black border border-zinc-900 rounded-[1px]" />
      ))}
    </div>
  </div>
);

const FilmStrip = ({ speed = 40, reverse = false, rotate = -4, yOffset = "25%", opacity = 0.12 }: { speed?: number, reverse?: boolean, rotate?: number, yOffset?: string, opacity?: number }) => {
  const items = [...Array(10)];
  const animationName = reverse ? 'marquee-right' : 'marquee-left';

  return (
    <div 
      className="absolute inset-x-0 overflow-hidden pointer-events-none z-0 select-none flex items-center"
      style={{ 
        transform: `rotate(${rotate}deg)`,
        top: yOffset,
        height: '110px',
        opacity: opacity,
      }}
    >
      <style>{`
        @keyframes marquee-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .filmstrip-track {
          display: flex;
          gap: 24px;
          padding-right: 24px;
          flex-shrink: 0;
          animation: ${animationName} ${speed}s linear infinite;
        }
      `}</style>
      
      <div className="flex whitespace-nowrap w-max">
        <div className="filmstrip-track">
          {items.map((_, i) => (
            <FilmFrame ke={i} key={`group1-${i}`} />
          ))}
        </div>
        <div className="filmstrip-track">
          {items.map((_, i) => (
            <FilmFrame ke={i} key={`group2-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

const BackgroundElements = React.memo(({ hideExtra = false, showPerspectiveGrid = false }: { hideExtra?: boolean; showPerspectiveGrid?: boolean }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#020202]">
      {!hideExtra && (
        <>
          {/* Film Strips Scrolling endlessly diagonally */}
          {/* Increase opacity for the top tape on Beranda/showPerspectiveGrid, otherwise keep transparent default */}
          <FilmStrip 
            speed={40} 
            reverse={showPerspectiveGrid ? true : false} 
            rotate={-2.5} 
            yOffset="15%" 
            opacity={showPerspectiveGrid ? 0.35 : 0.12} 
          />
          {/* Hide bottom diagonal tape on Beranda/showPerspectiveGrid as requested */}
          {!showPerspectiveGrid && (
            <FilmStrip speed={55} reverse={true} rotate={4} yOffset="65%" opacity={0.10} />
          )}
        </>
      )}

      {showPerspectiveGrid ? (
        /* Perspective Grid: Animating grid with 3D perspective, shrinking to vanishing point */
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden" 
          style={{ 
            perspective: '450px', 
            perspectiveOrigin: '50% 34%' 
          }}
        >
          <style>{`
            @keyframes grid-scroll-3d {
              0% {
                transform: rotateX(74deg) translateY(0px) translateZ(0);
              }
              100% {
                transform: rotateX(74deg) translateY(36px) translateZ(0);
              }
            }
            .animate-perspective-grid-3d {
              animation: grid-scroll-3d 6s linear infinite;
              will-change: transform;
              backface-visibility: hidden;
              -webkit-backface-visibility: hidden;
            }
          `}</style>
          
          {/* Glow behind the vanishing point/horizon */}
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-b from-white/12 to-transparent blur-[95px] rounded-full pointer-events-none opacity-85" />
          
          {/* 3D Perspective Plane */}
          <div 
            className="absolute top-[34%] left-[-50%] w-[150%] h-[120%] origin-top animate-perspective-grid-3d"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.16) 1.5px, transparent 1.5px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.16) 1.5px, transparent 1.5px)
              `,
              backgroundSize: '36px 36px',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 80%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 80%, rgba(0,0,0,0) 100%)',
            }}
          />

          {/* Cinematic Horizon Accent Line */}
          <div className="absolute top-[34%] inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        </div>
      ) : (
        /* Static Tech Grid - Reduced opacity and simplified for normal section flow */
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }} 
        />
      )}

      {/* Fluid Animated Blobs */}
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-white/[0.03] blur-[100px]" />
      <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-white/[0.02] blur-[100px]" />

      {!hideExtra && (
        /* Simplified Scanning Bar */
        <motion.div 
          animate={{ 
            y: ["-10%", "110%"],
            opacity: [0, 0.1, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-[100px] bg-gradient-to-b from-transparent via-white/[0.05] to-transparent pointer-events-none"
        />
      )}
    </div>
  );
});

const ClapperboardTransition = ({ isOpen }: { isOpen: boolean }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-auto select-none overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      {/* Background Dimmer and Blur Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.95, 0.95, 0] }}
        transition={{ times: [0, 0.15, 0.85, 1], duration: 2.0, ease: "easeInOut" }}
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
      />

      {/* Snap Flash Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 0] }}
        transition={{ 
          times: [0, 0.378, 0.38, 0.52], 
          duration: 2.0, 
          ease: "linear" 
        }}
        className="absolute inset-0 bg-white pointer-events-none z-[100] mix-blend-plus-lighter"
      />

      {/* Center 3D container */}
      <motion.div
        initial={{ scale: 0.65, rotateY: 42, rotateX: 24, rotate: -15, y: 160, opacity: 0 }}
        animate={{ 
          scale: [0.65, 1.0, 1.15, 2.2, 5.5],
          rotateY: [42, 18, 0, 0, 0],
          rotateX: [24, 10, 0, 0, 0],
          rotate: [-15, -6, 0, 0, 0],
          y: [160, 20, 0, 0, 0],
          opacity: [0, 1, 1, 1, 0]
        }}
        transition={{ 
          times: [0, 0.22, 0.38, 0.70, 1.0], 
          duration: 2.0, 
          ease: [0.25, 1, 0.4, 1] 
        }}
        className="relative flex flex-col items-center justify-center pt-12 pb-6 px-10 w-[280px] sm:w-[420px] aspect-[4/3]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative flex flex-col w-full bg-zinc-950 border-2 border-zinc-700 shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-none overflow-visible flex-1 p-3 sm:p-4 font-mono select-none">
          {/* Top hinge block fixed */}
          <div className="w-full h-6 sm:h-8 bg-[repeating-linear-gradient(-45deg,#000,#000_15px,#fff_15px,#fff_30px)] border-b border-zinc-800" />

          {/* Hinged Clapper arm */}
          <motion.div
            initial={{ rotate: -38 }}
            animate={{ rotate: [-38, -38, 0, 0, -20] }}
            transition={{
              times: [0, 0.22, 0.38, 0.82, 1],
              duration: 2.0,
              ease: "easeInOut"
            }}
            className="absolute h-6 sm:h-8 bg-[repeating-linear-gradient(-45deg,#000,#000_15px,#fff_15px,#fff_30px)] border-b-2 border-zinc-800 origin-left-bottom z-20 rounded-none"
            style={{ 
              transformOrigin: "0% 100%",
              top: "12px",
              left: "12px",
              width: "calc(100% - 24px)"
            }}
          />

          {/* Workspace Page Miniature Preview Representation */}
          <div className="flex-1 mt-2 sm:mt-3 border border-zinc-850 p-1.5 sm:p-2 bg-black rounded-none flex flex-col justify-between overflow-hidden relative select-none">
            {/* 1. Header of Miniature Workspace */}
            <div className="flex justify-between items-center border-b border-zinc-900 pb-1 mb-1 font-sans">
              <div className="flex items-center gap-1">
                <span className="text-[5px] sm:text-[6px] font-black tracking-wider text-white">DK</span>
                <span className="text-[5px] sm:text-[6px] font-black tracking-widest text-zinc-300">DAFTARKRU</span>
                <span className="text-[4px] sm:text-[5px] text-zinc-500 font-bold uppercase tracking-wider">ENGINE</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900 px-1 py-0.5 rounded-none border border-zinc-800">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[4px] sm:text-[5px] text-zinc-400 font-bold tracking-widest">RIWAYAT</span>
              </div>
            </div>

            {/* 2. Interactive Column Grid */}
            <div className="flex-1 grid grid-cols-5 gap-1.5 overflow-hidden font-sans">
              {/* Left Column: Input Credit Section */}
              <div className="col-span-1.5 flex flex-col gap-1 border-r border-zinc-900/60 pr-1 select-none">
                <span className="text-[3.5px] sm:text-[4.5px] text-zinc-500 font-bold tracking-wider uppercase">INPUT KREDIT</span>
                {/* Input 1 */}
                <div className="h-2.5 bg-zinc-950 border border-zinc-900 rounded-none p-0.5 flex items-center">
                  <div className="w-full h-[1px] bg-zinc-800" />
                </div>
                {/* Input 2 */}
                <div className="h-5 bg-zinc-950 border border-zinc-900 rounded-none p-0.5 flex flex-col gap-0.5">
                  <div className="w-3/4 h-[1px] bg-zinc-800" />
                  <div className="w-1/2 h-[1px] bg-zinc-800" />
                </div>
                {/* Tape track block representation */}
                <div className="mt-auto border border-zinc-900 rounded-none p-0.5 bg-zinc-950">
                  <div className="flex justify-between items-center gap-0.5">
                    <div className="w-1.5 h-1 bg-zinc-800 rounded-full" />
                    <div className="w-3 h-1 bg-zinc-500 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Center Column: Big Screen Preview */}
              <div className="col-span-2 flex flex-col gap-1">
                {/* Monitor Frame */}
                <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-none p-1 flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Outer corner marks to look high-tech and authentic */}
                  <div className="absolute top-0.5 right-0.5 w-[2.5px] h-[2.5px] border-t border-r border-zinc-700" />
                  <div className="absolute bottom-0.5 left-0.5 w-[2.5px] h-[2.5px] border-b border-l border-zinc-700" />
                  
                  {/* Posisi Title */}
                  <span className="text-[3.5px] sm:text-[4px] text-zinc-500 font-bold tracking-[0.2em] mb-1">DIRECTOR</span>
                  
                  {/* Huge Name Title matching font and size style of workspace */}
                  <span className="text-[7px] sm:text-[9px] text-white font-extrabold tracking-wider text-center leading-none">
                    AFGAN AL-FANANY
                  </span>
                </div>

                {/* Mini console bars under monitor */}
                <div className="h-3 bg-zinc-950 border border-zinc-900 rounded-none p-0.5 flex justify-between items-center gap-0.5">
                  <div className="w-2 h-1.5 bg-zinc-900 rounded-none" />
                  <div className="w-2 h-1.5 bg-zinc-900 rounded-none" />
                  <div className="w-[18px] h-2 bg-white text-black text-[3px] sm:text-[4px] font-black flex items-center justify-center rounded-none tracking-wide">
                    RENDER
                  </div>
                </div>
              </div>

              {/* Right Column: Mini Controls / Fine Tuning side panel */}
              <div className="col-span-1.5 border-l border-zinc-900/60 pl-1 flex flex-col justify-between gap-1 select-none">
                <span className="text-[3.5px] sm:text-[4.5px] text-zinc-500 font-bold tracking-wider uppercase text-right">FINE TUNING</span>
                
                {[...Array(4)].map((_, sliderIdx) => (
                  <div key={sliderIdx} className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[3px]">
                      <span className="text-zinc-650">CTRL {sliderIdx + 1}</span>
                      <span className="text-zinc-500">[{30 + sliderIdx * 15}%]</span>
                    </div>
                    <div className="h-0.5 w-full bg-zinc-900 rounded-none relative">
                      <div 
                        className="absolute -top-0.5 w-1 h-1 bg-white rounded-full border border-zinc-950" 
                        style={{ left: `${25 + sliderIdx * 18}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Bottom Footer showing design preset console bar */}
            <div className="mt-1 border-t border-zinc-900/80 pt-1 flex justify-between items-center text-[4px] sm:text-[5px] text-zinc-500 font-semibold font-sans">
              <span className="text-zinc-600">BEBAS NEUE</span>
              <span className="text-zinc-600">• FADE •</span>
              <span className="text-zinc-600">KANVAS</span>
            </div>
          </div>
        </div>

        {/* Visual CLIP tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -15, filter: "blur(15px)" }}
          animate={{ 
            opacity: [0, 0, 1, 1, 0],
            scale: [0.5, 0.5, 1.3, 1.15, 0.5],
            rotate: [-15, -15, 8, 4, -15],
            filter: ["blur(15px)", "blur(15px)", "blur(0px)", "blur(0px)", "blur(15px)"]
          }}
          transition={{ 
            times: [0, 0.38, 0.41, 0.78, 1],
            duration: 2.0, 
            ease: "easeOut" 
          }}
          className="absolute text-5xl sm:text-7xl font-black italic text-white tracking-widest uppercase z-[120] pointer-events-none"
          style={{ textShadow: "0 0 30px rgba(255,255,255,0.8)" }}
        >
          CLIP
        </motion.div>
      </motion.div>
    </div>
  );
};


const FilmGrainPreview = ({ opacity }: { opacity: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let active = true;
    let lastTime = performance.now();
    let frameIndex = 0;
    
    const render = (time: number) => {
      if (!active) return;
      
      // Update at roughly 24fps
      if (time - lastTime > 41) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          framesRef.current = []; // Clear cached frames if size changes
        }

        if (framesRef.current.length < 5) {
          // generate frame
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = `rgba(255,255,255,${opacity * 0.8})`;
          
          const density = (w * h) / (1920 * 1080);
          const dots = Math.floor(10000 * density) + 1000;
          
          ctx.beginPath();
          for (let i = 0; i < dots; i++) {
            ctx.rect(Math.random() * w, Math.random() * h, 1.5, 1.5);
          }
          ctx.fill();
          
          framesRef.current.push(ctx.getImageData(0, 0, w, h));
        } else {
          // Play cached frames
          ctx.putImageData(framesRef.current[frameIndex], 0, 0);
          frameIndex = (frameIndex + 1) % framesRef.current.length;
        }
        
        lastTime = time;
      }
      
      requestAnimationFrame(render);
    };
    
    render(performance.now());
    return () => { active = false; };
  }, [opacity]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen" />;
};

interface PresetThumbnailProps {
  preset: any;
  active: boolean;
  onClick: () => void;
}

const PresetThumbnail: React.FC<PresetThumbnailProps> = ({ preset, active, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "group relative aspect-video w-full overflow-hidden border transition-all duration-300",
        active ? "border-white bg-white/10 ring-1 ring-white" : "border-white/5 bg-black hover:border-white/20"
      )}
    >
      {/* Background color of preset if exists, default black */}
      <div className="absolute inset-0 z-0 bg-black" />
      
      {/* Visual Content Sample */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-2">
        <div 
          className="text-center space-y-1 w-full"
          style={{ 
            fontFamily: `'${preset.fontFamily}', sans-serif`,
            opacity: active ? 1 : 0.6
          }}
        >
          <div 
            className="text-[6px] uppercase tracking-[0.4em]"
            style={{ 
              opacity: preset.roleOpacity,
              fontWeight: preset.roleBold ? 'bold' : 'normal',
              color: preset.roleColor || '#ffffff'
            }}
          >
            Director
          </div>
          <div 
            className="text-[8px] uppercase tracking-[0.2em] font-black"
            style={{ 
              opacity: preset.namesOpacity,
              fontWeight: preset.namesBold ? 'bold' : 'normal',
              color: preset.namesColor || '#ffffff'
            }}
          >
            QUENTIN T.
          </div>
        </div>
      </div>

      {/* Label Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black to-transparent">
        <span className="text-[7px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
          {preset.activePreset.toUpperCase()}
        </span>
      </div>

      {/* Active Indicator */}
      {active && (
        <div className="absolute top-1 right-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />
        </div>
      )}
    </button>
  );
};

const SaveIndicator = ({ isSaving, lastSaved, lang }: { isSaving: boolean, lastSaved: Date | null, lang: Lang }) => {
  return (
    <div className="px-6 py-4 border-t border-white/5 mt-auto bg-black/40 relative z-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {isSaving ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-3 h-3 border-t-2 border-white/60 rounded-full"
            />
          ) : (
            <div className="w-2 h-2 rounded-full bg-white/40" />
          )}
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">
            {isSaving ? (lang === 'id' ? 'MENYIMPAN DATA...' : 'SAVING DATA...') : (lang === 'id' ? 'PERUBAHAN TERSIMPAN' : 'CHANGES SAVED')}
          </span>
        </div>
        
        {!isSaving && lastSaved && (
          <div className="flex items-center gap-2 text-zinc-500 text-[9px] uppercase tracking-widest pl-6">
            <Clock className="w-3 h-3 opacity-50" />
            <span>
              {lang === 'id' ? 'TERAKHIR: ' : 'LAST: '}
              {lastSaved.toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
const Marquee = React.memo(({ text, reverse = false, speed = 30 }: { text: string, reverse?: boolean, speed?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (!containerRef.current) return;
    
    gsap.to(containerRef.current, {
      x: reverse ? 1000 : -1000,
      duration: speed,
      repeat: -1,
      ease: "none",
      force3D: true,
      lazy: true,
    });
  }, { scope: containerRef, dependencies: [speed, reverse] });

  return (
    <div className="w-full overflow-hidden bg-white/5 border-y border-white/10 py-4 sm:py-6 flex whitespace-nowrap rotate-[-1.5deg] z-20 relative backdrop-blur-xl">
      <div
        ref={containerRef}
        className="flex gap-12 sm:gap-24 items-center"
        style={{ 
          willChange: 'transform',
          transform: `translateX(${reverse ? -1000 : 0}px)` 
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 sm:gap-16">
            <span className="text-4xl sm:text-7xl font-bold uppercase tracking-tighter text-white/10 italic hover:text-white/40 transition-colors cursor-default select-none">
              {text}
            </span>
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 border-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
});

const GsapAnimatedConsole = ({ onPlay, lang }: { onPlay: () => void, lang: Lang }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !playheadRef.current || !textRef.current) return;

    // Timeline scrub animation
    gsap.to(playheadRef.current, {
      x: "0%",
      scrollTrigger: {
        trigger: containerRef.current.closest('section'),
        start: "top top",
        end: "+=250%",
        scrub: 1.2,
      },
      force3D: true,
      lazy: true,
    });

    gsap.fromTo(textRef.current,
      { y: "45%", opacity: 1 },
      {
        y: "-45%", opacity: 1,
        scrollTrigger: {
          trigger: containerRef.current.closest('section'),
          start: "top top",
          end: "+=250%",
          scrub: 1.2,
        },
        force3D: true,
        lazy: true,
      }
    );

    // Unified 3D entrance transition for the entire console container card
    gsap.fromTo(containerRef.current,
      { y: 80, rotateX: 12, opacity: 0, scale: 0.93 },
      {
        y: 0, rotateX: 0, opacity: 1, scale: 1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "center center",
          scrub: 1.5,
        },
        force3D: true,
        lazy: true,
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="flex-1 w-full max-w-2xl relative perspective-[1500px] flex items-center justify-center py-6 lg:py-0">
       <div className="relative w-full h-full transform-style-3d flex items-center justify-center">
          
          {/* Edge crosshair markings (Technical viewfinder aesthetic) */}
          <div className="absolute -top-3 -left-3 text-zinc-600 font-mono text-[9px] select-none select-none pointer-events-none font-bold">┌ &nbsp; ┐</div>
          <div className="absolute -top-3 -right-3 text-zinc-600 font-mono text-[9px] select-none select-none pointer-events-none font-bold">┌ &nbsp; ┐</div>
          <div className="absolute -bottom-3 -left-3 text-zinc-600 font-mono text-[9px] select-none select-none pointer-events-none font-bold">└ &nbsp; ┘</div>
          <div className="absolute -bottom-3 -right-3 text-zinc-600 font-mono text-[9px] select-none select-none pointer-events-none font-bold">└ &nbsp; ┘</div>

          {/* Main Unified Workspace Card */}
          <div className="relative w-full bg-black border border-zinc-800 rounded-none shadow-[20px_20px_0px_rgba(0,0,0,0.9)] flex flex-col z-10 overflow-hidden transform-origin-bottom max-w-[100vw] lg:max-w-none">
             
             {/* Window Title Bar */}
             <div className="h-10 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-950 select-none rounded-none">
                <div className="flex items-center gap-2">
                   {/* Razor-sharp technical monochrome squares instead of colored dots */}
                   <div className="w-2.5 h-2.5 border border-zinc-800 bg-zinc-900" />
                   <div className="w-2.5 h-2.5 border border-zinc-750 bg-zinc-800" />
                   <div className="w-2.5 h-2.5 border border-zinc-700 bg-zinc-700" />
                </div>
                <div className="text-[7.5px] sm:text-[9.5px] font-mono text-zinc-400 tracking-[0.3em] font-black uppercase truncate px-2">
                   {lang === 'id' ? 'KONSOL WORKSPACE DAFTARKRU' : 'DAFTARKRU WORKSPACE CONSOLE'}
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-zinc-400 animate-pulse rounded-none" />
                   <span className="text-[6px] sm:text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-widest hidden xs:block">ONLINE</span>
                </div>
             </div>
             
             {/* Preview Screen Section (Upper half of the unified card) */}
             <div className="relative w-full aspect-video bg-[#030304] flex flex-col overflow-hidden border-b border-zinc-800">
                <div className="flex-1 relative flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_75%)] overflow-hidden">
                   
                   {/* Technical grid crosshair centering line */}
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                      <div className="w-10 h-[1px] bg-white absolute" />
                      <div className="h-10 w-[1px] bg-white absolute" />
                   </div>

                   {/* Animated scrolling credit text */}
                   <div ref={textRef} className="text-center space-y-2 sm:space-y-4 absolute w-full px-4">
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">DIRECTED BY</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">THE CREATOR</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">PRODUCED BY</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">DAFTARKRU ENGINE</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">WRITTEN BY</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">THE ARCHITECT</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">EXECUTIVE PRODUCER</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">DAFTARKRU STUDIO</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">DIRECTOR OF PHOTOGRAPHY</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">OPTICAL FLOW</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">VISUAL EFFECTS</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">PARTICLE LABS</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">EDITOR</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">CHRONOS ENGINE</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">SOUND DESIGN</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">ACOUSTIC CORE</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">MUSIC BY</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">SONIC WAVE</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">CASTING BY</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">PEOPLE ENGINE</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">COSTUME DESIGN</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">STYLE MATRIX</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">ART DIRECTION</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">GRID SYSTEM</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">COLORIST</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">CHROMA CORE</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">PRODUCTION DESIGN</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase pb-4 sm:pb-12">CREATIVE SPACE</p>
                     <h4 className="text-[6px] sm:text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">STUNT COORDINATOR</h4>
                     <p className="text-xs sm:text-2xl font-black text-white tracking-[0.15em] uppercase">KINETIC FLOW</p>
                   </div>
                   
                   {/* Film grain / noise overlay */}
                   <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]" />
                   
                   {/* Scanlines element */}
                   <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
                   
                   {/* REC Action Indicator */}
                   <div className="absolute bottom-3 right-3 flex gap-1.5 items-center z-20 bg-black border border-zinc-800 px-2.5 py-1 rounded-none shadow-none">
                      <div className="w-1.5 h-1.5 bg-zinc-300 animate-pulse rounded-none" />
                      <div className="text-[6px] sm:text-[8px] font-mono text-zinc-400 font-bold tracking-widest uppercase ml-1 select-none">REC</div>
                   </div>
                </div>
             </div>
             
             {/* Integrated Deck / Control Panel (Lower half of the unified card) */}
             <div className="bg-black p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 border-t border-zinc-800">
                
                {/* Timeline Progress Track */}
                <div className="space-y-2">
                   <div className="flex justify-between items-center text-[6px] sm:text-[8px] text-zinc-500 tracking-widest font-mono">
                      <span>00:00:00:00</span>
                      <span className="text-white/50 text-[8px] sm:text-[10px] font-black font-mono tracking-widest">KEEP SCROLLING</span>
                      <span>00:05:00:00</span>
                   </div>
                   <div className="h-2 w-full bg-zinc-950 border border-zinc-800/80 rounded-none relative overflow-hidden">
                      <div ref={playheadRef} className="absolute top-0 left-0 h-full w-full bg-white origin-left -translate-x-full rounded-none" />
                   </div>
                </div>
                
                {/* Controls Grid block */}
                <div className="grid grid-cols-3 gap-3">
                   
                   {/* Left box: Developer stamp */}
                   <div className="bg-zinc-950 border border-zinc-800 p-2.5 sm:p-3.5 flex flex-col justify-center gap-0.5 rounded-none">
                      <span className="text-[5px] sm:text-[7px] text-zinc-500 uppercase tracking-wider font-mono">DEVELOPED_BY</span>
                      <span className="text-[8px] sm:text-[10px] text-white font-bold font-mono truncate uppercase">AFGAN AL-FANANY</span>
                   </div>
                   
                   {/* Middle box: Refresh rate metrics */}
                   <div className="bg-zinc-950 border border-zinc-800 p-2.5 sm:p-3.5 flex flex-col justify-center gap-0.5 rounded-none relative overflow-hidden group">
                      <span className="text-[5px] sm:text-[7px] text-zinc-500 uppercase tracking-wider font-mono">RENDER_STATUS</span>
                      <span className="text-[8px] sm:text-[10px] text-zinc-300 font-bold font-mono transition-colors flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 bg-zinc-400 animate-pulse rounded-none" />
                         60.0 FPS
                      </span>
                   </div>
                   
                   {/* Right box: Instantly launch credits editor trigger */}
                   <button 
                     onClick={onPlay}
                     className="bg-white text-black hover:bg-black hover:text-white hover:border-white active:translate-x-0.5 active:translate-y-0.5 transition-all rounded-none p-2.5 sm:p-3.5 flex items-center justify-center gap-2 font-mono font-black text-[7px] sm:text-[10.5px] uppercase tracking-wider cursor-pointer border border-white group shadow-[4px_4px_0px_#27272a] hover:shadow-none"
                   >
                      <Play className="w-3.5 h-3.5 text-current fill-current transition-transform group-hover:scale-105" />
                      <span className="truncate">{lang === 'id' ? 'MULAI' : 'PLAY'}</span>
                   </button>
                </div>
             </div>

          </div>

       </div>
    </div>
  );
}

const AboutSection = ({ lang, onStart }: { lang: Lang, onStart: () => void }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [titleVisible, setTitleVisible] = useState(false);
  const titleText = "DAFTARKRU ENGINE";
  const [displayedTitle, setDisplayedTitle] = useState("");

  useGSAP(() => {
    if (!sectionRef.current) return;
    
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=250%",
      pin: true,
      scrub: 1.2,
      pinSpacing: true,
      // Reflow optimization
      fastScrollEnd: true,
      preventOverlaps: true,
    });
  }, { scope: sectionRef });

  useEffect(() => {
    if (titleVisible && displayedTitle.length < titleText.length) {
      const timeout = setTimeout(() => {
        setDisplayedTitle(titleText.slice(0, displayedTitle.length + 1));
      }, 70);
      return () => clearTimeout(timeout);
    } else if (!titleVisible) {
      setDisplayedTitle("");
    }
  }, [titleVisible, displayedTitle, titleText]);

  return (
    <section ref={sectionRef} id="about" className="min-h-screen w-full bg-[#050505] flex flex-col lg:flex-row items-center justify-start lg:justify-center p-4 sm:p-12 lg:p-24 gap-0 sm:gap-8 lg:gap-24 relative overflow-hidden border-t border-white/5 pt-12 lg:pt-24">
      <BackgroundElements hideExtra={true} />

      <motion.div 
        onViewportEnter={() => setTitleVisible(true)}
        onViewportLeave={() => setTitleVisible(false)}
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:flex-1 space-y-6 lg:space-y-12 z-10"
      >
        <div className="space-y-4">
          <h2 className="flex flex-col text-4xl sm:text-6xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] break-words">
            {displayedTitle.split(" ").map((word, i) => (
              <div key={i}>
                {word}
                {i === displayedTitle.split(" ").length - 1 && displayedTitle.length < titleText.length && (
                  <span className="inline-block w-1.5 h-8 sm:h-12 lg:h-20 bg-white ml-2 animate-pulse align-middle" />
                )}
              </div>
            ))}
          </h2>
        </div>
        
        <div className="space-y-4 lg:space-y-6 max-w-xl">
          <p className="text-xs sm:text-sm text-zinc-300 tracking-normal leading-relaxed text-justify">
            {translations[lang].about.description}
          </p>
          <div className="flex items-center gap-6 mt-0 pt-4">
             <div className="group w-auto h-8 md:h-10 border-none overflow-hidden transition-all duration-500 flex items-center justify-center">
                <img src="/daftarkru.png" alt="DaftarKru Professional Work" loading="lazy" className="h-full w-auto object-contain opacity-40 group-hover:opacity-80 transition-opacity duration-300" />
             </div>
             <div className="group w-auto h-8 md:h-10 border-none overflow-hidden transition-all duration-500 flex items-center justify-center">
                <img src="/afganvisualworklogo.png" alt="Afgan Visual Work Branding" loading="lazy" className="h-full w-auto object-contain opacity-40 group-hover:opacity-80 transition-opacity duration-300" />
             </div>
          </div>
        </div>
      </motion.div>

      <GsapAnimatedConsole onPlay={onStart} lang={lang} />
    </section>
  );
};

const DocumentationSection = ({ lang }: { lang: Lang }) => {
  const [showAllShortcuts, setShowAllShortcuts] = useState(false);

  const shortcuts = [
    { key: "Space", desc: lang === 'id' ? "Putar / Jeda Pratinjau Kredit" : "Play / Pause Credits Preview" },
    { key: "Q", desc: lang === 'id' ? "Sembunyikan / Tampilkan Input Kredit (Kiri)" : "Toggle Credit Input Sidebar (Left)" },
    { key: "E", desc: lang === 'id' ? "Sembunyikan / Tampilkan Kontrol Fine-Tuning (Kanan)" : "Toggle Fine-Tuning Sidebar (Right)" },
    { key: "S", desc: lang === 'id' ? "Sembunyikan / Tampilkan Konsol Desainer (Bawah)" : "Toggle Designer Console (Bottom)" },
    { key: "1", desc: lang === 'id' ? "Buka Menu Pilihan Gaya Font" : "Open Font Style Selection" },
    { key: "2", desc: lang === 'id' ? "Buka Menu Pilihan Tipe Gerak / Animasi" : "Open Motion Type Selection" },
    { key: "3", desc: lang === 'id' ? "Buka Menu Pilihan Tampilan / Kepadatan" : "Open Appearance Options" },
    { key: "4", desc: lang === 'id' ? "Buka Menu Pilihan Backdrop / Kanvas" : "Open Backdrop Options" },
    { key: "5", desc: lang === 'id' ? "Buka Menu Pilihan Preset Desain" : "Open Layout Presets" },
    { key: "ESC", desc: lang === 'id' ? "Tutup Popover Menu Opsi Aktif" : "Close Active Options Dialog" },
    { key: "← / →", desc: lang === 'id' ? "Navigasi Frame / Lompati Detik Video" : "Skip Seconds / Frame Navigation" },
    { key: "Ctrl + S", desc: lang === 'id' ? "Inisiasi Render & Unduh File Hasil" : "Trigger Render & Export Download" },
  ];

  const displayedShortcuts = showAllShortcuts ? shortcuts : shortcuts.slice(0, 5);

  return (
    <section id="documentation" className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative overflow-hidden border-t border-white/5">
      {/* Static Background instead of animated one */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-white rounded-full blur-[180px]" />
        {/* Ambient top glowing line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="max-w-7xl w-full space-y-16 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[9px] font-black tracking-[0.8em] text-white/40 uppercase"
            >
              {translations[lang].documentation.title}
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-none italic"
            >
              DOKUMENTASI<br />DAFTARKRU
            </motion.h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm tracking-normal leading-relaxed">
            {translations[lang].documentation.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-start">
          <div className="space-y-10">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                {translations[lang].documentation.videoTitle}
              </h3>
              
              <div className="relative w-full bg-black border border-white/10 group overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <ArcadeEmbed />
                <div className="absolute top-0 inset-x-0 h-[1px] bg-white/20 z-20 pointer-events-none" />
              </div>

            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-white animate-pulse" />
              {translations[lang].documentation.kbdTitle}
            </h3>
            <p className="text-xs text-zinc-400 tracking-normal leading-relaxed pb-2 border-b border-white/5">
              {translations[lang].documentation.kbdDesc}
            </p>

            <motion.div className="grid grid-cols-1 gap-2.5">
              <AnimatePresence mode="popLayout">
                {displayedShortcuts.map((shortcut) => (
                  <motion.div 
                    key={shortcut.key}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ 
                      height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.25 }
                    }}
                    layout
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-white/5 transition-all hover:bg-zinc-900/50 hover:border-white/10 group">
                      <span className="text-xs text-zinc-400 tracking-normal leading-relaxed group-hover:text-zinc-200 transition-colors mr-4">{shortcut.desc}</span>
                      <kbd className="px-3 py-1 bg-zinc-900 border border-white/20 rounded font-mono text-[9px] font-bold text-white uppercase shadow-[3px_3px_0px_rgba(255,255,255,0.05)] tracking-widest whitespace-nowrap group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-300">
                        {shortcut.key}
                      </kbd>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <button
              onClick={() => setShowAllShortcuts(!showAllShortcuts)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-zinc-900/50 hover:bg-white border border-white/10 hover:border-white text-xs text-white hover:text-black font-extrabold uppercase tracking-widest transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              {showAllShortcuts ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>{lang === 'id' ? "Sembunyikan Sebagian" : "Show Less"}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>{lang === 'id' ? `Tampilkan Semua (${shortcuts.length})` : `Show All (${shortcuts.length})`}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

interface FAQProps {
  faq: { q: string, a: string };
  index: number;
}

const FAQItem: React.FC<FAQProps> = ({ faq, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    // Only refresh ScrollTrigger after the accordion animation has fully settled to prevent
    // layout thrashing and stutter while the transition is mid-flight.
    const timer = setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (e) {}
    }, 400);

    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      className="relative"
      style={{ overflowAnchor: "none" }}
    >
      <div className={cn(
        "bg-white/[0.02] border border-white/5 overflow-hidden transition-[background-color,border-color,box-shadow,opacity] duration-500 shadow-[4px_4px_0px_rgba(255,255,255,0.01)]",
        isOpen ? "bg-white/[0.05] border-white/20 shadow-[8px_8px_0px_rgba(255,255,255,0.03)]" : "hover:border-white/10 hover:bg-white/[0.03] hover:shadow-[6px_6px_0px_rgba(255,255,255,0.02)]"
      )}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-6 sm:p-10 flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-6 sm:gap-10">
            <span className="text-[10px] font-mono opacity-20">0{index + 1}</span>
            <span className="text-xs sm:text-sm md:text-base font-semibold tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-300">{faq.q}</span>
          </div>
          <motion.div
            animate={{ 
              rotate: isOpen ? 45 : 0,
              scale: isOpen ? 1.1 : 1
            }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="text-zinc-600 group-hover:text-white transition-colors duration-300"
          >
            <Plus className="w-5 h-5" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: "auto", 
                opacity: 1,
              }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                height: {
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1]
                },
                opacity: { duration: 0.25 }
              }}
              className="overflow-hidden"
            >
              <div className="px-6 sm:px-10 pb-10 pt-4">
                <div className="w-full h-[1.5px] bg-zinc-900/60 overflow-hidden relative mb-8">
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ 
                      scaleX: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: [0.16, 1, 0.3, 1],
                      times: [0, 0.5, 1]
                    }}
                    className="h-full w-full bg-gradient-to-r from-zinc-800 via-white to-zinc-800"
                    style={{ originX: 0 }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 tracking-normal leading-relaxed max-w-3xl">
                  {faq.a}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const FAQSection = ({ lang }: { lang: Lang }) => {
  const faqs = [
    { q: translations[lang].faq.q1, a: translations[lang].faq.a1 },
    { q: translations[lang].faq.q2, a: translations[lang].faq.a2 },
    { q: translations[lang].faq.q3, a: translations[lang].faq.a3 },
    { q: translations[lang].faq.q4, a: translations[lang].faq.a4 },
    { q: translations[lang].faq.q5, a: translations[lang].faq.a5 }
  ];

  return (
    <section id="faq" style={{ overflowAnchor: "none" }} className="min-h-screen w-full bg-[#020202] flex flex-col items-center justify-center py-16 sm:py-24 px-6 sm:px-12 lg:px-24 relative overflow-hidden border-t border-white/5">
       <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-white/[0.01] blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
       
       <div className="max-w-7xl w-full flex flex-col lg:grid lg:grid-cols-[1fr_1.5fr] gap-12 sm:gap-20 items-start">
          <div className="lg:sticky lg:top-32 space-y-6 sm:space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[9px] font-black tracking-[0.8em] text-white/40 uppercase"
            >
              {translations[lang].faq.title}
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-none italic whitespace-pre-line inline-block"
            >
              <span className="relative z-10">
                {translations[lang].faq.heading}
              </span>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-0 left-0 h-2 md:h-3 w-full bg-white/20 origin-left"
              />
            </motion.h2>
            <p className="text-xs sm:text-sm text-zinc-400 tracking-normal max-w-sm leading-relaxed">
              {translations[lang].faq.subheading}
            </p>
          </div>

          <div className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
       </div>
    </section>
  );
};


const BackgroundCreditsAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tracks = [
    {
      items: [
        'DIRECTOR', 'AFGAN AL-FANANY',
        'SCREENPLAY', 'AL-FANANY STUDIO',
        'EXECUTIVE PRODUCER', 'DAFTARKRU NETWORK',
        'CHIEF EDITOR', 'MOTION LABS'
      ],
      speed: 35,
      reverse: false
    },
    {
      items: [
        'DIRECTOR OF PHOTOGRAPHY', 'CINEMA LABS',
        'MUSIC COMPOSER', 'AUDIO SYSTEM',
        'SOUND DESIGNER', 'STUDIO MASTER',
        'LIGHTING DIRECTOR', 'STUDIO BEAMS'
      ],
      speed: 50,
      reverse: true
    },
    {
      items: [
        'CREATIVE WRITER', 'AFGAN CO.',
        'ART DIRECTOR', 'PIXEL TEAM',
        'VISUAL EFFECTS', 'RENDER ENGINE',
        'COSTUME DESIGN', 'THREAD LABS'
      ],
      speed: 40,
      reverse: false
    },
    {
      items: [
        'COLOR GRADING', 'LUT PRESETS',
        'PRODUCTION DESIGN', 'DAFTARKRU',
        'MOTION GRAPHICS', 'EXPORTS',
        'POST PRODUCTION', 'FINISHING DEPOT'
      ],
      speed: 60,
      reverse: true
    }
  ];

  useGSAP(() => {
    if (!containerRef.current) return;
    
    containerRef.current.querySelectorAll('.track-inner').forEach((track, i) => {
      const isReverse = tracks[i].reverse;
      gsap.to(track, {
        y: isReverse ? "25%" : "-25%",
        duration: tracks[i].speed,
        repeat: -1,
        ease: "none",
        force3D: true,
        lazy: true,
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 opacity-[0.15] flex justify-around select-none pointer-events-none overflow-hidden max-w-7xl mx-auto px-4 md:px-12">
      {tracks.map((track, i) => (
        <div key={i} className="w-[18%] sm:w-[22%] h-full relative overflow-hidden flex flex-col items-center">
          <div 
            className="track-inner flex flex-col"
            style={{ willChange: 'transform' }}
          >
            {[...Array(4)].map((_, groupIdx) => (
              <div key={groupIdx} className="flex flex-col gap-12 py-12 items-center">
                {track.items.map((item, idx) => {
                  const isRole = idx % 2 === 0;
                  return (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <span className={cn(
                        "uppercase tracking-[0.2em] font-sans text-center",
                        isRole ? "text-[10px] font-black text-white/60" : "text-[12px] font-medium text-white/90 font-mono mt-1"
                      )}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#000000] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#000000] to-transparent pointer-events-none" />
    </div>
  );
};

const GetStartedSection = ({ lang, onStart }: { lang: Lang, onStart: () => void }) => {
  return (
    <section id="get-started" className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-between p-6 py-12 sm:p-24 relative overflow-hidden border-t border-white/5">
      {/* Sidebar Elements - Absolute positioned to stick to this section only */}
      <div className="hidden lg:block">
        {/* Left Sidebar: Copyright */}
        <div className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-center mix-blend-difference z-[10] pointer-events-none">
            <div className="-rotate-90 text-[10px] sm:text-[12px] font-medium tracking-[1.2em] text-white/40 whitespace-nowrap uppercase">
              © 2026 DAFTARKRU. ALL RIGHT RESERVED
            </div>
        </div>

        {/* Right Sidebar: Socials */}
        <div className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-center z-[10]">
            <div className="flex flex-col gap-10 items-center">
              <div className="h-32 w-[1px] bg-white/10" />
              <a href="https://daftarkru.netlify.app" target="_blank" rel="noopener noreferrer" className="group p-2" title="Website">
                <Globe className="w-4 h-4 text-white/30 group-hover:text-white group-hover:scale-125 transition-all" />
              </a>
              <a href="https://instagram.com/afganalfananyy" target="_blank" rel="noopener noreferrer" className="group p-2">
                <Instagram className="w-4 h-4 text-white/30 group-hover:text-white group-hover:scale-125 transition-all" />
              </a>
              <a href="https://github.com/afganalfananyy" target="_blank" rel="noopener noreferrer" className="group p-2">
                <Github className="w-4 h-4 text-white/30 group-hover:text-white group-hover:scale-125 transition-all" />
              </a>
              <div className="h-32 w-[1px] bg-white/10" />
            </div>
        </div>
      </div>

      {/* Background Animated Credits Column Rolling */}
      <BackgroundCreditsAnimation />
      
      {/* Mobile/Tablet Socials (at the top, side-by-side) */}
      <div className="lg:hidden flex gap-8 items-center z-10">
         <a href="https://daftarkru.netlify.app" target="_blank" rel="noopener noreferrer" className="group p-2" title="Website">
            <Globe className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
         </a>
         <a href="https://instagram.com/afganalfananyy" target="_blank" rel="noopener noreferrer" className="group p-2">
            <Instagram className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
         </a>
         <a href="https://github.com/afganalfananyy" target="_blank" rel="noopener noreferrer" className="group p-2">
            <Github className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
         </a>
      </div>

      {/* Spacer to push content down on desktop */}
      <div className="hidden lg:block h-0" />

      <div className="max-w-4xl w-full text-center space-y-12 relative z-10 my-auto">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="space-y-6"
        >
          <div className="text-[10px] sm:text-xs font-black tracking-[0.8em] text-white/40 uppercase mb-4 flex items-center justify-center gap-4">
             <div className="h-[1px] w-8 bg-white/20" />
             DAFTARKRU_ENGINE
             <div className="h-[1px] w-8 bg-white/20" />
          </div>
          <h2 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.75] italic">
            {translations[lang].getStarted.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 tracking-normal max-w-xl mx-auto leading-normal">
            {translations[lang].getStarted.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex flex-col items-center gap-8"
        >
          <button 
            onClick={onStart}
            className="group relative px-12 py-6 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] sm:text-[12px] overflow-hidden transition-all hover:scale-105 active:scale-95 hero-button shadow-[4px_4px_0px_rgba(255,255,255,0.15)] hover:shadow-[8px_8px_0px_rgba(255,255,255,0.25)] border border-white"
          >
            <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16, 1, 0.3, 1]" />
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">
              {translations[lang].getStarted.button}
            </span>
          </button>
          
          <div className="flex gap-4 items-center opacity-20 transition-opacity hover:opacity-40">
             <div className="h-[1px] w-12 bg-white" />
             <span className="text-[9px] font-bold tracking-[0.5em] uppercase">Ready to Roll</span>
             <div className="h-[1px] w-12 bg-white" />
          </div>
        </motion.div>
      </div>

      {/* Mobile/Tablet Copyright (at the bottom) */}
      <div className="lg:hidden text-[10px] font-black tracking-[0.5em] text-zinc-700 uppercase text-center w-full z-10 mt-8">
         © 2026 DAFTARKRU. ALL RIGHT RESERVED
      </div>

      {/* Spacer to push content up on desktop */}
      <div className="hidden lg:block h-0" />

      {/* Subtle scanline effect - very faint */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
    </section>
  );
};


const SliderWithControls = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  unit = '', 
  precision = 0,
  disabled = false
}: { 
  label: string, 
  value: number, 
  onChange: (val: number) => void, 
  min: number, 
  max: number, 
  step?: number, 
  unit?: string,
  precision?: number,
  disabled?: boolean
}) => {
  const ignoreChangeRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const clickX = e.clientX;
    const clickPercent = ((clickX - rect.left) / rect.width) * 105; // Slightly scaled
    const valuePercent = ((value - min) / (max - min)) * 100;
    
    // If pointer-down is further than 18% from current thumb position, ignore to prevent accidental track jumping
    if (Math.abs(clickPercent - valuePercent) > 18) {
      ignoreChangeRef.current = true;
    } else {
      ignoreChangeRef.current = false;
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.touches && e.touches[0]) {
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width === 0) return;
      const clickX = e.touches[0].clientX;
      const clickPercent = ((clickX - rect.left) / rect.width) * 105;
      const valuePercent = ((value - min) / (max - min)) * 100;
      
      if (Math.abs(clickPercent - valuePercent) > 18) {
        ignoreChangeRef.current = true;
      } else {
        ignoreChangeRef.current = false;
      }
    }
  };

  const handlePointerUp = () => {
    ignoreChangeRef.current = false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || ignoreChangeRef.current) {
      return;
    }
    onChange(Number(e.target.value));
  };

  const handleDecrement = () => {
    if (disabled) return;
    onChange(Math.max(min, Number((value - step).toFixed(precision))));
  };

  const handleIncrement = () => {
    if (disabled) return;
    onChange(Math.min(max, Number((value + step).toFixed(precision))));
  };

  return (
    <div className={cn("space-y-2.5 touch-pan-y transition-all duration-300", disabled && "opacity-30 pointer-events-none select-none filter grayscale")}>
      <div className="flex justify-between items-center text-xs sm:text-[13px] font-medium tracking-[0.05em] text-white">
        <span className="text-white/95 font-medium uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleDecrement}
            disabled={disabled}
            className="w-5 h-5 flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-3 h-3 text-white" />
          </button>
          <span className="min-w-[40px] text-right font-mono text-[11px] font-medium text-white">{value.toFixed(precision)}{unit}</span>
          <button 
            type="button"
            onClick={handleIncrement}
            disabled={disabled}
            className="w-5 h-5 flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value}
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onTouchStart={handleTouchStart}
        onPointerUp={handlePointerUp}
        onTouchEnd={handlePointerUp}
        onChange={handleChange}
        className="w-full h-[2px] bg-zinc-800 accent-white appearance-none cursor-pointer touch-none disabled:bg-zinc-900 disabled:cursor-not-allowed"
      />
    </div>
  );
};

const FONT_OPTIONS = [
  { name: 'INTER SANS', value: 'Inter' },
  { name: 'PLUS JAKARTA', value: 'Plus Jakarta Sans' },
  { name: 'MANROPE', value: 'Manrope' },
  { name: 'SPACE GROTESK', value: 'Space Grotesk' },
  { name: 'SORA GEOMETRIC', value: 'Sora' },
  { name: 'BEBAS NEUE', value: 'Bebas Neue' },
  { name: 'CINZEL DECORATIVE', value: 'Cinzel' },
  { name: 'ARCHIVE BLACK', value: 'Archivo Black' },
  { name: 'MONTSERRAT', value: 'Montserrat' },
  { name: 'SYNE BOLD', value: 'Syne' },
  { name: 'CRIMSON SERIF', value: 'Crimson Text' },
  { name: 'UNBOUNDED', value: 'Unbounded' },
  { name: 'PLAYFAIR DISPLAY', value: 'Playfair Display' },
  { name: 'OSWALD CONDENSED', value: 'Oswald' },
  { name: 'KANIT BLACK', value: 'Kanit' },
  { name: 'SYSTEM MONO', value: 'JetBrains Mono' },
];

const TuningControls = React.memo(({ settings, setSettings, lang, credits }: any) => {
  const pxToPercent = (px: number) => ((px / 1920) * 100).toFixed(1);
  const percentToPx = (pct: number) => Number(((pct / 100) * 1920).toFixed(1));

  const isControlDisabled = (key: string): boolean => {
    const animationType = settings.animationType;
    
    // Check if pairs exist
    const hasPairs = credits && credits.some((c: any) => c.isPairs);
    
    // marginBlock (Block Space) is only valid in 'scroll' mode.
    // Transition-based modes ('fade', 'zoom', 'blur', 'slide', 'glitch') only render 
    // one credit block screen-by-screen, rendering block spacing irrelevant.
    if (key === 'marginBlock') {
      return animationType !== 'scroll';
    }

    // Disable pairsGap if no pairs exist in credits
    if (key === 'pairsGap') {
      return !hasPairs;
    }

    return false;
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4 border-b border-white/5 pb-2">
        <h3 className="text-xs sm:text-[13px] font-medium tracking-normal text-zinc-300 whitespace-nowrap">FINE TUNING CONTROL</h3>
        <button 
          type="button"
          onClick={() => {
            const defaultSettings = {
              fontFamily: 'Kanit',
              fontSize: 36,
              roleColor: '#ffffff',
              roleOpacity: 0.2,
              namesColor: '#ffffff',
              namesOpacity: 1,
              bgColor: '#000000',
              direction: 'bottomToTop' as Direction,
              animationType: 'scroll' as AnimationType,
              paddingText: 20,
              marginBlock: 120,
              roleFontSize: 14,
              lineHeight: 1.2,
              roleNameGap: 10,
              namesGap: 4,
              roleBold: false,
              roleItalic: false,
              namesBold: false,
              namesItalic: false,
              animationDuration: 4,
              showNoise: false,
              noiseOpacity: 0.1,
              showScanlines: false,
              vignette: 0,
              pairsGap: 80,
              activePreset: 'default',
              textShadowBlur: 0,
              textShadowColor: '#000000',
              textShadowOpacity: 0.5,
              textOutline: false,
              textOutlineWidth: 1,
              textOutlineColor: '#000000',
              letterSpacing: 0,
            };
            const activePresetKey = settings.activePreset || 'default';
            const presetData = PRESETS[activePresetKey as keyof typeof PRESETS] || PRESETS.default;
            setSettings({
              ...defaultSettings,
              ...presetData,
              activePreset: activePresetKey
            });
          }}
          className="ml-auto flex items-center gap-1.5 px-3 py-1 border border-white/10 hover:border-white text-white hover:text-black hover:bg-white text-[9px] font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer rounded-none"
          title={lang === 'id' ? "Reset semua pengaturan tuning kembali ke asal untuk preset ini" : "Reset all tuning settings back to original for this preset"}
        >
          <RotateCcw className="w-3 h-3" />
          <span>{lang === 'id' ? "RESET" : "RESET"}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 gap-y-10">
        <SliderWithControls 
          label={translations[lang].editor.nameSize}
          value={Number(pxToPercent(settings.fontSize))}
          onChange={(val) => setSettings({...settings, fontSize: percentToPx(val)})}
          min={0.2}
          max={10}
          step={0.1}
          unit="%"
          precision={1}
          disabled={isControlDisabled('fontSize')}
        />
        <SliderWithControls 
          label={translations[lang].editor.roleSize}
          value={Number(pxToPercent(settings.roleFontSize))}
          onChange={(val) => setSettings({...settings, roleFontSize: percentToPx(val)})}
          min={0.2}
          max={8}
          step={0.1}
          unit="%"
          precision={1}
          disabled={isControlDisabled('roleFontSize')}
        />
        <SliderWithControls 
          label={translations[lang].editor.blockSpace}
          value={Number(pxToPercent(settings.marginBlock))}
          onChange={(val) => setSettings({...settings, marginBlock: percentToPx(val)})}
          min={0}
          max={20}
          step={0.1}
          unit="%"
          precision={1}
          disabled={isControlDisabled('marginBlock')}
        />
        <SliderWithControls 
          label={translations[lang].editor.roleGap}
          value={Number(pxToPercent(settings.roleNameGap))}
          onChange={(val) => setSettings({...settings, roleNameGap: percentToPx(val)})}
          min={0}
          max={10}
          step={0.1}
          unit="%"
          precision={1}
          disabled={isControlDisabled('roleNameGap')}
        />
        <SliderWithControls 
          label={translations[lang].editor.nameGap}
          value={Number(pxToPercent(settings.namesGap))}
          onChange={(val) => setSettings({...settings, namesGap: percentToPx(val)})}
          min={0}
          max={10}
          step={0.1}
          unit="%"
          precision={1}
          disabled={isControlDisabled('namesGap')}
        />
        <SliderWithControls 
          label={translations[lang].editor.lineHeight}
          value={settings.lineHeight}
          onChange={(val) => setSettings({...settings, lineHeight: val})}
          min={0.5}
          max={4}
          step={0.1}
          unit=""
          precision={1}
          disabled={isControlDisabled('lineHeight')}
        />
        <SliderWithControls 
          label={translations[lang].editor.pairsGap}
          value={Number(pxToPercent(settings.pairsGap))}
          onChange={(val) => setSettings({...settings, pairsGap: percentToPx(val)})}
          min={1}
          max={40}
          step={0.1}
          unit="%"
          precision={1}
          disabled={isControlDisabled('pairsGap')}
        />
        <SliderWithControls 
          label={translations[lang].editor.letterSpacing}
          value={settings.letterSpacing}
          onChange={(val) => setSettings({...settings, letterSpacing: val})}
          min={-5}
          max={20}
          step={1}
          precision={0}
          disabled={isControlDisabled('letterSpacing')}
        />
      </div>
    </div>
  );
});

const CategoryPopover = ({ id, title, children, activeConsole, closeConsole, lang }: { id: string, title: string, children: React.ReactNode, activeConsole: string, closeConsole: () => void, lang: string }) => (
  <AnimatePresence>
    {activeConsole === id && (
      <>
        {/* Backdrop for all views */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeConsole}
          className="fixed inset-0 bg-black/60 backdrop-blur-[6px] z-[9999]"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={cn(
            "fixed z-[10000] flex flex-col overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,1)]",
            // Mobile: Bottom sheet style
            "inset-x-0 bottom-0 max-h-[85vh] border-t border-white/20 bg-zinc-950/90 backdrop-blur-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px]",
            // Desktop: True central layout
            "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[700px] lg:max-h-[min(750px,85vh)] lg:border lg:border-white/20 bg-black/95 lg:backdrop-blur-3xl"
          )}
        >
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-zinc-950/80 lg:bg-white/5 backdrop-blur-xl z-20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[10px] lg:text-[12px] font-bold uppercase tracking-[0.4em] text-white underline decoration-white/30 underline-offset-8 transition-all hover:decoration-white">{title}</span>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeConsole();
              }}
              className="group relative flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-none bg-zinc-900 hover:bg-white border border-white/10 hover:border-white transition-all duration-300 shadow-[4px_4px_0px_rgba(255,255,255,0.05)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              title={translations[lang].editor.close}
            >
              <X className="w-4 h-4 lg:w-5 lg:h-5 text-white group-hover:text-black transition-transform duration-500 group-hover:rotate-90" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 lg:p-12 space-y-12 overscroll-contain">
            {children}
          </div>
          
          {/* Footer Decoration (Desktop only) */}
          <div className="hidden lg:flex px-12 py-4 border-t border-white/5 bg-zinc-900/30 items-center justify-between shrink-0">
            <div className="text-[8px] text-zinc-500 uppercase tracking-widest">ESC or Click Outside to Dismiss</div>
            <div className="text-[8px] text-zinc-600 font-mono">ID: {id.toUpperCase()}_CTX_V02</div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const ConsoleContent = React.memo(({ settings, setSettings, activeConsole, setActiveConsole, setFadeIndex, customFonts, lang, onFontUpload, onDeleteFont }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (activeConsole !== 'none' && containerRef.current && !containerRef.current.contains(target) && !target.closest('.fixed') && !target.closest('button') && !target.closest('input')) {
        closeConsole();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeConsole, setActiveConsole]);

  const closeConsole = () => setActiveConsole('none');

  const getDisplayFontName = () => {
    const custom = customFonts.find((f: any) => f.value === settings.fontFamily);
    if (custom) return custom.name.toUpperCase();
    const standard = FONT_OPTIONS.find(f => f.value === settings.fontFamily);
    if (standard) return standard.name.toUpperCase();
    return "INTER";
  };

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
        
        {/* Typography */}
        <div className="space-y-2 sm:space-y-3">
          <label className="text-[11px] sm:text-[12px] font-bold tracking-widest text-white uppercase block">{translations[lang].editor.fontStyle}</label>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveConsole(activeConsole === 'font' ? 'none' : 'font');
              }}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[11px] sm:text-xs font-medium tracking-normal transition-all",
                activeConsole === 'font' ? "bg-white text-black border-white" : "border-white/10 hover:bg-white/5"
              )}
            >
              <span className="truncate">{getDisplayFontName()}</span>
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'font' && "rotate-90")} />
            </button>
            <CategoryPopover id="font" title={translations[lang].editor.fontStyle} activeConsole={activeConsole} closeConsole={closeConsole} lang={lang}>
              <div className="space-y-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => onFontUpload(e, fileInputRef)} 
                  accept=".ttf,.otf,.woff,.woff2" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-10 border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all flex flex-col items-center gap-4 group bg-black/40 rounded-none relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Upload className="w-8 h-8 text-zinc-600 group-hover:text-white transition-all duration-500 group-hover:-translate-y-1" />
                  <div className="text-center relative z-10 border-none">
                    <span className="text-xs sm:text-sm font-semibold tracking-normal text-zinc-300 group-hover:text-white transition-colors">{translations[lang].editor.uploadFont}</span>
                    <p className="text-[11px] text-zinc-500 tracking-normal mt-2 font-medium">TTF, OTF, WOFF Supported</p>
                  </div>
                </button>

                <div className="grid grid-cols-1 gap-1">
                  {/* Custom Fonts */}
                  {customFonts.length > 0 && (
                    <div className="pb-2 border-b border-white/5 mb-2">
                       <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 px-5 mb-2 block">Your Uploads</span>
                       {customFonts.map((font: any) => (
                           <div key={font.value} className="flex items-center border-b border-white/5">
                             <button
                               onClick={() => {
                                 setSettings((prev: any) => ({...prev, fontFamily: font.value}));
                                 closeConsole();
                               }}
                               className={cn(
                                 "flex-1 text-left px-5 py-4 text-[10px] font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all",
                                 settings.fontFamily === font.value ? "bg-white/10 text-white" : "text-zinc-500"
                               )}
                               style={{ fontFamily: `'${font.value}', sans-serif` }}
                             >
                               {font.name}
                             </button>
                             <button
                               onClick={(e) => onDeleteFont(e, font.value)}
                               className="px-4 bg-transparent text-zinc-600 hover:text-red-500 transition-colors h-full"
                               title="Hapus Font"
                             >
                               <Trash className="w-3 h-3" />
                             </button>
                           </div>
                       ))}
                    </div>
                  )}

                  {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => {
                      setSettings({...settings, fontFamily: font.value});
                      closeConsole();
                    }}
                    className={cn(
                      "w-full text-left px-5 py-4 text-[10px] font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all border-b border-white/5 last:border-0",
                      settings.fontFamily === font.value ? "bg-white/10 text-white" : "text-zinc-500"
                    )}
                    style={{ fontFamily: `'${font.value}', sans-serif` }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
            </CategoryPopover>
        </div>
      </div>

        {/* Behavior */}
        <div className="space-y-2 sm:space-y-3">
          <label className="text-[11px] sm:text-[12px] font-bold tracking-widest text-white uppercase block">{translations[lang].editor.motionType}</label>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveConsole(activeConsole === 'anim' ? 'none' : 'anim');
              }}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[11px] sm:text-xs font-medium tracking-normal transition-all",
                activeConsole === 'anim' ? "bg-white text-black border-white" : "border-white/10 hover:bg-white/5"
              )}
            >
              <span className="truncate">{settings.animationType.toUpperCase()}</span>
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'anim' && "rotate-90")} />
            </button>
            <CategoryPopover id="anim" title={translations[lang].editor.motionType} activeConsole={activeConsole} closeConsole={closeConsole} lang={lang}>
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { name: 'SMOOTH SCROLL', value: 'scroll' },
                    { name: 'SCENE FADES', value: 'fade' },
                    { name: 'DYNAMIC ZOOM', value: 'zoom' },
                    { name: 'MOTION BLUR', value: 'blur' },
                    { name: 'SLIDE UP', value: 'slide' },
                    { name: 'DATA GLITCH', value: 'glitch' },
                  ].map((anim) => (
                    <button
                      key={anim.value}
                      onClick={() => {
                        setSettings({...settings, animationType: anim.value as AnimationType});
                        setFadeIndex(0);
                        closeConsole();
                      }}
                      className={cn(
                        "w-full text-left px-5 py-4 text-[10px] font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all border-b border-white/5 last:border-0",
                        settings.animationType === anim.value ? "bg-white/10 text-white" : "text-zinc-500"
                      )}
                    >
                      {anim.name}
                    </button>
                  ))}
                </div>
                <div className="p-6 bg-white/5 space-y-4">
                  <SliderWithControls 
                    label={translations[lang].editor.sceneSpeed}
                    value={settings.animationDuration}
                    onChange={(val) => setSettings({...settings, animationDuration: val})}
                    min={0.5}
                    max={10}
                    step={0.5}
                    precision={1}
                  />
                  <div className="text-[11px] text-zinc-500 text-center tracking-normal italic">
                    {translations[lang].editor.scrollModes}
                  </div>
                </div>
              </div>
            </CategoryPopover>
          </div>
        </div>

        {/* Visuals */}
        <div className="space-y-2 sm:space-y-3">
          <label className="text-[11px] sm:text-[12px] font-bold tracking-widest text-white uppercase block">{translations[lang].editor.appearance}</label>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                setActiveConsole(activeConsole === 'color' ? 'none' : 'color');
              }}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[11px] sm:text-xs font-medium tracking-normal transition-all",
                activeConsole === 'color' ? "bg-white text-black border-white" : "border-white/10 hover:bg-white/5"
              )}
            >
              {translations[lang].editor.visuals}
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'color' && "rotate-90")} />
            </button>
            <CategoryPopover id="color" title={translations[lang].editor.visuals} activeConsole={activeConsole} closeConsole={closeConsole} lang={lang}>
                {/* Role / Identity */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                    <span>{translations[lang].editor.identityLabel}</span>
                    <div className="flex gap-1 items-center">
                      <button 
                        onClick={() => setSettings({...settings, roleBold: !settings.roleBold})}
                        className={cn("w-8 h-8 sm:w-6 sm:h-6 border flex items-center justify-center transition-all", settings.roleBold ? "bg-white text-black border-white" : "border-white/10 text-zinc-500")}
                      >
                        B
                      </button>
                      <button 
                        onClick={() => setSettings({...settings, roleItalic: !settings.roleItalic})}
                        className={cn("w-8 h-8 sm:w-6 sm:h-6 border flex items-center justify-center transition-all", settings.roleItalic ? "bg-white text-black border-white" : "border-white/10 text-zinc-500")}
                      >
                        I
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 sm:p-6 space-y-6 text-left">
                     <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
                       <div className="flex-1">
                         <SliderWithControls 
                          label="OPACTY ROLE NAME"
                          value={settings.roleOpacity}
                          onChange={(val) => setSettings({...settings, roleOpacity: val})}
                          min={0}
                          max={2}
                          step={0.1}
                          precision={1}
                        />
                       </div>
                       <div className="flex items-center justify-between sm:justify-start gap-3 bg-black border border-white/10 p-2 sm:p-3">
                         <div className="flex items-center gap-2">
                           <div className="w-8 h-8 sm:w-6 sm:h-6 rounded-none relative overflow-hidden flex-shrink-0 border border-white/20" style={{ backgroundColor: settings.roleColor }}>
                             <input 
                               type="color" 
                               value={settings.roleColor}
                               onChange={(e) => setSettings({...settings, roleColor: e.target.value})}
                               className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                             />
                           </div>
                           <span className="text-[10px] font-mono opacity-40 uppercase tabular-nums">{settings.roleColor}</span>
                         </div>
                       </div>
                     </div>
                  </div>
                </div>

                {/* Names */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                    <span>{translations[lang].editor.namesLabel}</span>
                    <div className="flex gap-1 items-center">
                      <button 
                        onClick={() => setSettings({...settings, namesBold: !settings.namesBold})}
                        className={cn("w-8 h-8 sm:w-6 sm:h-6 border flex items-center justify-center transition-all", settings.namesBold ? "bg-white text-black border-white" : "border-white/10 text-zinc-500")}
                      >
                        B
                      </button>
                      <button 
                        onClick={() => setSettings({...settings, namesItalic: !settings.namesItalic})}
                        className={cn("w-8 h-8 sm:w-6 sm:h-6 border flex items-center justify-center transition-all", settings.namesItalic ? "bg-white text-black border-white" : "border-white/10 text-zinc-500")}
                      >
                        I
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 sm:p-6 space-y-6 text-left">
                     <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
                       <div className="flex-1">
                         <SliderWithControls 
                          label="OPACITY PERSON NAMES"
                          value={settings.namesOpacity}
                          onChange={(val) => setSettings({...settings, namesOpacity: val})}
                          min={0}
                          max={2}
                          step={0.1}
                          precision={1}
                        />
                       </div>
                       <div className="flex items-center justify-between sm:justify-start gap-3 bg-black border border-white/10 p-2 sm:p-3">
                         <div className="flex items-center gap-2">
                           <div className="w-8 h-8 sm:w-6 sm:h-6 rounded-none relative overflow-hidden flex-shrink-0 border border-white/20" style={{ backgroundColor: settings.namesColor }}>
                             <input 
                               type="color" 
                               value={settings.namesColor}
                               onChange={(e) => setSettings({...settings, namesColor: e.target.value})}
                               className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                             />
                           </div>
                           <span className="text-[10px] font-mono opacity-40 uppercase tabular-nums">{settings.namesColor}</span>
                         </div>
                       </div>
                     </div>
                  </div>
                </div>

                {/* Text Shadow */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                    <span>{translations[lang].editor.textShadow}</span>
                    <span className="text-zinc-400 tabular-nums">{Math.round(settings.textShadowOpacity * 100)}%</span>
                  </div>
                  <div className="bg-white/5 p-6 space-y-6">
                    <SliderWithControls 
                      label={translations[lang].editor.textShadowBlur}
                      value={settings.textShadowBlur}
                      onChange={(val) => setSettings({...settings, textShadowBlur: val})}
                      min={0}
                      max={50}
                      step={1}
                      precision={0}
                    />
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <SliderWithControls 
                          label={translations[lang].editor.textShadowOpacity}
                          value={settings.textShadowOpacity}
                          onChange={(val) => setSettings({...settings, textShadowOpacity: val})}
                          min={0}
                          max={1}
                          step={0.1}
                          precision={1}
                        />
                      </div>
                      <div className="flex items-center gap-3 bg-black border border-white/10 p-3">
                        <div className="w-6 h-6 rounded-none relative overflow-hidden flex-shrink-0 border border-white/20" style={{ backgroundColor: settings.textShadowColor }}>
                          <input 
                            type="color" 
                            value={settings.textShadowColor}
                            onChange={(e) => setSettings({...settings, textShadowColor: e.target.value})}
                            className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Outline */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                    <span>{translations[lang].editor.textOutline}</span>
                    <button 
                      onClick={() => setSettings({...settings, textOutline: !settings.textOutline})}
                      className={cn(
                        "px-3 py-1 text-[8px] border transition-all rounded-none",
                        settings.textOutline ? "bg-white text-black border-white" : "text-zinc-500 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      {settings.textOutline ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                  {settings.textOutline && (
                    <div className="bg-white/5 p-6 space-y-6">
                      <SliderWithControls 
                        label={translations[lang].editor.textOutlineWidth}
                        value={settings.textOutlineWidth}
                        onChange={(val) => setSettings({...settings, textOutlineWidth: val})}
                        min={0.1}
                        max={10}
                        step={0.1}
                        precision={1}
                      />
                      <div className="flex items-center justify-between gap-3 bg-black border border-white/10 p-3">
                        <span className="text-[8px] uppercase tracking-widest text-zinc-500">Color</span>
                        <div className="w-6 h-6 rounded-none relative overflow-hidden flex-shrink-0 border border-white/20" style={{ backgroundColor: settings.textOutlineColor }}>
                          <input 
                            type="color" 
                            value={settings.textOutlineColor}
                            onChange={(e) => setSettings({...settings, textOutlineColor: e.target.value})}
                            className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* FX Effects */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">{translations[lang].editor.overlayEffects}</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setSettings({...settings, showNoise: !settings.showNoise})}
                      className={cn(
                        "relative h-20 sm:h-24 flex flex-col items-center justify-center transition-all border overflow-hidden rounded-none",
                        settings.showNoise ? "border-white ring-1 ring-white" : "bg-white/5 text-white border-white/10 hover:border-white/30"
                      )}
                    >
                      <div className="absolute inset-0 z-0">
                        {settings.showNoise && <FilmGrainPreview opacity={0.3} />}
                      </div>
                      <div className={cn("relative z-10 flex flex-col items-center gap-1", settings.showNoise ? "text-white" : "text-zinc-500")}>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Film Grain</span>
                        <span className="text-[7px] opacity-40 uppercase tracking-tighter">{settings.showNoise ? 'Active' : 'Off'}</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setSettings({...settings, showScanlines: !settings.showScanlines})}
                      className={cn(
                        "relative h-20 sm:h-24 flex flex-col items-center justify-center transition-all border overflow-hidden rounded-none",
                        settings.showScanlines ? "border-white ring-1 ring-white" : "bg-white/5 text-white border-white/10 hover:border-white/30"
                      )}
                    >
                      <div className="absolute inset-0 z-0">
                        {settings.showScanlines && (
                          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_2px]" />
                        )}
                      </div>
                      <div className={cn("relative z-10 flex flex-col items-center gap-1", settings.showScanlines ? "text-white" : "text-zinc-500")}>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Scanlines</span>
                        <span className="text-[7px] opacity-40 uppercase tracking-tighter">{settings.showScanlines ? 'Active' : 'Off'}</span>
                      </div>
                    </button>
                    {settings.showNoise && (
                      <div className="col-span-2 bg-black/40 p-4 border border-white/5">
                        <SliderWithControls 
                          label={translations[lang].editor.filmGrainIntensity}
                          value={settings.noiseOpacity}
                          onChange={(val) => setSettings({...settings, noiseOpacity: val})}
                          min={0}
                          max={1}
                          step={0.05}
                          precision={2}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                    <span>{translations[lang].editor.vignette}</span>
                    <span className="text-zinc-400 tabular-nums">{Math.round(settings.vignette * 100)}%</span>
                  </div>
                  <div className="bg-white/5 p-6">
                    <SliderWithControls 
                      label="Shadow Depth"
                      value={settings.vignette}
                      onChange={(val) => setSettings({...settings, vignette: val})}
                      min={0}
                      max={1}
                      step={0.1}
                      precision={1}
                    />
                  </div>
                </div>
            </CategoryPopover>
          </div>
        </div>

        {/* Backdrop (Canvas) */}
        <div className="space-y-2 sm:space-y-3">
          <label className="text-[11px] sm:text-[12px] font-bold tracking-widest text-white uppercase block">{translations[lang].editor.backdrop}</label>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveConsole(activeConsole === 'bg' ? 'none' : 'bg');
              }}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[11px] sm:text-xs font-medium tracking-normal transition-all",
                activeConsole === 'bg' ? "bg-white text-black border-white" : "border-white/10 hover:bg-white/5"
              )}
            >
              {translations[lang].editor.canvas}
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'bg' && "rotate-90")} />
            </button>
            <CategoryPopover id="bg" title={translations[lang].editor.canvas} activeConsole={activeConsole} closeConsole={closeConsole} lang={lang}>
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Background Color</label>
                  <div className="bg-black border border-white/10 p-4 sm:p-6 flex items-center justify-between gap-4 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-none relative overflow-hidden border border-white/20" style={{ backgroundColor: settings.bgColor }}>
                        <input 
                          type="color" 
                          value={settings.bgColor}
                          onChange={(e) => setSettings({...settings, bgColor: e.target.value})}
                          className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                        />
                      </div>
                      <span className="text-[12px] font-mono uppercase tracking-widest tabular-nums">{settings.bgColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CategoryPopover>
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-2 sm:space-y-3">
          <label className="text-[11px] sm:text-[12px] font-bold tracking-widest text-white uppercase block">{translations[lang].editor.presets}</label>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveConsole(activeConsole === 'preset' ? 'none' : 'preset');
              }}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[11px] sm:text-xs font-medium tracking-normal transition-all",
                activeConsole === 'preset' ? "bg-white text-black border-white" : "border-white/10 hover:bg-white/5"
              )}
            >
              <span className="truncate">
                {settings.activePreset ? (translations[lang].editor[`preset${settings.activePreset.charAt(0).toUpperCase() + settings.activePreset.slice(1)}` as keyof typeof translations.id.editor] || settings.activePreset.toUpperCase()) : "PRESET"}
              </span>
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'preset' && "rotate-90")} />
            </button>
            <CategoryPopover id="preset" title={translations[lang].editor.presets} activeConsole={activeConsole} closeConsole={closeConsole} lang={lang}>
              <div className="grid grid-cols-2 gap-2 p-2 sm:p-4 bg-black/40">
                {Object.keys(PRESETS).map((presetKey) => (
                  <PresetThumbnail 
                    key={presetKey}
                    preset={PRESETS[presetKey as keyof typeof PRESETS]}
                    active={settings.activePreset === presetKey}
                    onClick={() => {
                      setSettings({...settings, ...PRESETS[presetKey as keyof typeof PRESETS]});
                      closeConsole();
                    }}
                  />
                ))}
              </div>
            </CategoryPopover>
          </div>
        </div>
      </div>
    </div>
  );
});

const Menu2Lines = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="4" y1="8" x2="20" y2="8" />
    <line x1="4" y1="16" x2="20" y2="16" />
  </svg>
);

const CreditItem = React.memo(({ 
  item, 
  selectedIds, 
  toggleSelect, 
  openSettingsId, 
  setOpenSettingsId, 
  startEditing, 
  removeRole,
  duplicateTape,
  togglePairs,
  lang
}: any) => {
  const controls = useDragControls();

  return (
    <Reorder.Item 
      value={item}
      dragListener={false}
      dragControls={controls}
      className={cn("relative w-full", openSettingsId === item.id ? "z-[100]" : "z-0")}
    >
      <div 
        onClick={() => toggleSelect(item.id)}
        className={cn(
          "group p-4 lg:p-5 border transition-all rounded-none flex items-center justify-between relative overflow-visible",
          selectedIds.has(item.id) ? "bg-white text-black border-white shadow-[8px_8px_0px_rgba(255,255,255,0.05)]" : "border-white/20 hover:border-white hover:shadow-[5px_5px_0px_rgba(255,255,255,0.02)]"
        )}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
          <div 
            onPointerDown={(e) => {
              e.preventDefault();
              controls.start(e);
            }}
            style={{ touchAction: 'none' }}
            className={cn(
              "p-2 -ml-2 cursor-grab active:cursor-grabbing transition-colors touch-none", 
              selectedIds.has(item.id) ? "text-black/40 hover:text-black/60" : "text-white/20 hover:text-white/40"
            )}
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("text-[9px] lg:text-[10px] font-bold tracking-widest uppercase", selectedIds.has(item.id) ? "text-black" : "text-white/40")}>{item.role}</div>
              {item.isPairs && <Columns className={cn("w-3 h-3", selectedIds.has(item.id) ? "text-black/40" : "text-white/20")} />}
            </div>
            <div className="text-[11px] lg:text-[13px] font-medium truncate">{(item.names || []).join(' / ')}</div>
          </div>
        </div>

        <div className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              togglePairs(item.id);
            }}
            title={lang === 'id' ? "Toggle Mode Pairs" : "Toggle Pairs Mode"}
            className={cn(
              "p-2 border transition-all rounded-none",
              item.isPairs
                ? (selectedIds.has(item.id) ? "bg-black text-white border-black" : "bg-white text-black border-white")
                : (selectedIds.has(item.id) ? "border-black/10 hover:bg-black/5 text-zinc-400 hover:text-black" : "border-white/10 hover:bg-white/10 text-zinc-600 hover:text-white")
            )}
          >
            <Columns className="w-4 h-4" />
          </button>

          <div className="relative">
            <button 
              onClick={() => setOpenSettingsId(openSettingsId === item.id ? null : item.id)}
              className={cn(
                "p-2 border transition-all relative z-[110] rounded-none",
                openSettingsId === item.id 
                  ? "bg-white text-black border-white" 
                  : (selectedIds.has(item.id) ? "border-black/10 hover:bg-black/5 text-black" : "border-white/10 hover:bg-white/10")
              )}
            >
              <Settings2 className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {openSettingsId === item.id && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setOpenSettingsId(null)}
                    className="fixed inset-0 z-[100] bg-black/20"
                  />
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 bottom-full mb-2 w-48 bg-black border border-white z-[120] overflow-hidden shadow-2xl"
                  >
                    <button 
                      onClick={() => {
                        startEditing(item.id);
                        setOpenSettingsId(null);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-semibold tracking-normal hover:bg-white hover:text-black transition-colors flex items-center justify-between text-white border-b border-white/10"
                    >
                      {translations[lang].editor.editTape}
                      <Pencil className="w-3.5 h-3.5 opacity-50" />
                    </button>

                    <button 
                      onClick={() => {
                        duplicateTape(item.id);
                        setOpenSettingsId(null);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-semibold tracking-normal hover:bg-white hover:text-black transition-colors flex items-center justify-between text-white border-b border-white/10"
                    >
                      {translations[lang].editor.duplicateTape}
                      <Copy className="w-3.5 h-3.5 opacity-50" />
                    </button>

                    <button 
                      onClick={() => {
                        removeRole(item.id);
                        setOpenSettingsId(null);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-semibold tracking-normal text-white hover:text-red-500 hover:bg-white/5 transition-colors flex items-center justify-between"
                    >
                      {translations[lang].editor.deleteTape}
                      <Trash2 className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
});
CreditItem.displayName = 'CreditItem';


const safeParse = (value: string | null, defaultValue: any) => {
  if (!value) return defaultValue;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null' || trimmed === 'NaN') {
    return defaultValue;
  }
  try {
    if (!/^[{\["\d\-]|true|false|null/.test(trimmed)) {
      return defaultValue;
    }
    const parsed = JSON.parse(value);
    return parsed !== undefined && parsed !== null ? parsed : defaultValue;
  } catch (e) {
    console.error("JSON parse error in safeParse:", e, "Value:", value);
    return defaultValue;
  }
};

export default function App() {
  const lenisRef = useRef<Lenis | null>(null);
  const [view, setView] = useState<View>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSaveIndicator = () => {
    setIsSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 1200);
  };
  const [isClapping, setIsClapping] = useState(false);
  const [activeSection, setActiveSection] = useState(() => view === 'editor' ? 'editor' : 'home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const triggerClapperTransition = () => {
    setIsClapping(true);
    setTimeout(() => {
      setView('editor');
      setActiveSection('editor');
      window.scrollTo({ top: 0 });
    }, 950); 
    setTimeout(() => {
      setIsClapping(false);
    }, 2200); 
  };

  useGSAP(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      
      const diff = currentScrollY - lastScrollY.current;
      if (Math.abs(diff) > 5) {
        if (diff > 10 && currentScrollY > 200) {
          setIsHidden(true);
        } else if (diff < -10) {
          setIsHidden(false);
        }
      } else if (currentScrollY <= 50) {
        setIsHidden(false);
      }

      // Sync active section to home if at very top
      if (currentScrollY < 10 && view === 'hero') {
        setActiveSection('home');
      }

      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Precise section tracking with ScrollTrigger
    if (view === 'hero') {
      const sections = [
        { id: 'home', target: 'home' },
        { id: 'about', target: 'about' },
        { id: 'documentation', target: 'documentation' },
        { id: 'faq', target: 'faq' },
        { id: 'get-started', target: 'get-started' }
      ];

      const triggers: ScrollTrigger[] = [];

      sections.forEach(section => {
        const st = ScrollTrigger.create({
          trigger: `#${section.target}`,
          start: "top center", 
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive && view === 'hero') {
              setActiveSection(section.id);
            }
          },
          onEnter: () => { if (view === 'hero') setActiveSection(section.id); },
          onEnterBack: () => { if (view === 'hero') setActiveSection(section.id); },
          onUpdate: (self) => {
            if (self.isActive && view === 'hero') {
              // Set value directly; state hook is stable and handles equality checks internally
              setActiveSection(section.id);
            }
          },
          fastScrollEnd: true,
        });
        triggers.push(st);
      });

      // Immediate check based on current scroll position
      // Using a staggered approach to ensure DOM is ready and measurements are correct
      const timer1 = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 50);

      const timer2 = setTimeout(() => {
        ScrollTrigger.refresh();
        const findActive = () => {
          // Check triggers first
          const activeST = triggers.find(st => st.isActive);
          if (activeST && activeST.vars.trigger) {
            const id = (activeST.vars.trigger as string).replace('#', '');
            const found = sections.find(s => s.target === id);
            if (found) return found.id;
          }

          // Fallback to manual check ONLY if window is not at the very top
          if (window.scrollY < 20) return 'home';

          const scrollPos = window.scrollY + window.innerHeight / 3; // Shifted up for better accuracy
          let closest = sections[0].id;
          let minDiff = Infinity;

          sections.forEach(s => {
            const el = document.getElementById(s.target);
            if (el) {
              const rect = el.getBoundingClientRect();
              const absoluteTop = rect.top + window.scrollY;
              // Compare scroll center with section center
              const diff = Math.abs(scrollPos - (absoluteTop + rect.height / 2));
              if (diff < minDiff) {
                minDiff = diff;
                closest = s.id;
              }
            }
          });
          return closest;
        };

        const currentActiveId = findActive();
        if (currentActiveId && view === 'hero') {
          setActiveSection(currentActiveId);
        }
      }, 300);

      const timer3 = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 1000);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        triggers.forEach(t => t.kill());
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setActiveSection('editor');
      return () => {
        window.removeEventListener('scroll', handleScroll);
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    }
  }, { dependencies: [view] });

  const lastScrollY = useRef(0);

  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('daftarkru_lang');
      const langVal = (saved && saved.trim().toLowerCase() !== 'undefined' ? saved.trim() : 'id') as Lang;
      return (langVal === 'en' || langVal === 'id') ? langVal : 'id';
    } catch {
      return 'id';
    }
  });

  useEffect(() => {
    if (view === 'hero') {
      const isMobile = window.innerWidth < 768;
      const lenis = new Lenis({
        duration: isMobile ? 1.5 : 1.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.6,
        touchMultiplier: isMobile ? 0.3 : 0.5,
        syncTouch: true,
      });

      lenisRef.current = lenis;
      lenis.on('scroll', ScrollTrigger.update);

      const tickerRaf = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerRaf);
      gsap.ticker.lagSmoothing(0);

      // Refresh ScrollTrigger after a slight delay to ensure layout is ready
      const timeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 50); // Faster refresh for real-time feel

      return () => {
        clearTimeout(timeout);
        lenis.destroy();
        gsap.ticker.remove(tickerRaf);
        lenisRef.current = null;
      };
    }
  }, [view]);

  useEffect(() => {
    localStorage.setItem('daftarkru_lang', lang);
  }, [lang]);

  const [projectName, setProjectName] = useState(() => {
    try {
      const saved = localStorage.getItem('daftarkru_projectName');
      return (saved && saved.trim().toLowerCase() !== 'undefined' && saved.trim() !== '') ? saved : 'UNTITLED_PROJECT';
    } catch {
      return 'UNTITLED_PROJECT';
    }
  });
  const [initialProjectName, setInitialProjectName] = useState(projectName);
  const [showInfo, setShowInfo] = useState(true);
  const [isChangeNameModalOpen, setIsChangeNameModalOpen] = useState(false);
  const [tempProjectName, setTempProjectName] = useState(projectName);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [credits, setCredits] = useState<CreditEntry[]>(() => {
    const defaultCredits = [
      { id: '1', role: 'DIRECTOR', names: ['Afgan Al-fanany'] },
      { id: '2', role: 'PRODUCED BY', names: ['Al-fanany', 'Afgan'] },
    ];
    return safeParse(localStorage.getItem('daftarkru_credits_v2'), defaultCredits);
  });

  const [settings, setSettings] = useState(() => {
    const defaultSettings = {
      fontFamily: 'Kanit',
      fontSize: 36,
      roleColor: '#ffffff',
      roleOpacity: 0.2,
      namesColor: '#ffffff',
      namesOpacity: 1,
      bgColor: '#000000',
      direction: 'bottomToTop' as Direction,
      animationType: 'scroll' as AnimationType,
      paddingText: 20,
      marginBlock: 120, // space between role blocks
      roleFontSize: 14,
      lineHeight: 1.2,
      roleNameGap: 10, // space between role and names
      namesGap: 4, // space between multiple names
      roleBold: false,
      roleItalic: false,
      namesBold: false,
      namesItalic: false,
      animationDuration: 4,
      showNoise: false,
      noiseOpacity: 0.1,
      showScanlines: false,
      vignette: 0,
      pairsGap: 80,
      activePreset: 'default',
      textShadowBlur: 0,
      textShadowColor: '#000000',
      textShadowOpacity: 0.5,
      textOutline: false,
      textOutlineWidth: 1,
      textOutlineColor: '#000000',
      letterSpacing: 0,
    };
    const saved = localStorage.getItem('daftarkru_settings');
    const parsed = safeParse(saved, defaultSettings);
    return { ...defaultSettings, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  });

  // History for Undo/Redo & Selective Revert
  interface HistoryFrame {
    credits: CreditEntry[];
    settings: ProjectSettings;
    projectName: string;
    labelId: string;
    labelEn: string;
    timestamp: string;
  }
  const [history, setHistory] = useState<HistoryFrame[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<'timeline' | 'selective'>('timeline');
  const isUndoing = useRef(false);

  // Initialize history after first render to ensure we capture the initial state correctly
  useEffect(() => {
    if (history.length === 0 && credits && settings) {
      try {
        const creditsClone = JSON.parse(JSON.stringify(credits || []) || '[]');
        const settingsClone = JSON.parse(JSON.stringify(settings || {}) || '{}');
        setHistory([{ 
          credits: creditsClone, 
          settings: settingsClone,
          projectName: projectName || 'UNTITLED_PROJECT',
          labelId: 'Inisialisasi Proyek',
          labelEn: 'Project Initialized',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }]);
        setHistoryIndex(0);
      } catch (e) {
        console.error("Failed to initialize history:", e);
      }
    }
  }, []);

  // Auto record modifications dynamically with smart labels
  useEffect(() => {
    if (isUndoing.current) {
      isUndoing.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setHistory(prev => {
        if (!prev || prev.length === 0) return prev;
        
        // Use historyIndex as active head of the stack
        const activeHeadIndex = historyIndex >= 0 ? historyIndex : prev.length - 1;
        const last = prev[activeHeadIndex];
        if (!last || !credits || !settings) return prev;
        
        try {
          if (JSON.stringify(last.credits) === JSON.stringify(credits) && 
              JSON.stringify(last.settings) === JSON.stringify(settings) &&
              last.projectName === projectName) {
            return prev;
          }
          
          const creditsClone = JSON.parse(JSON.stringify(credits || []) || '[]');
          const settingsClone = JSON.parse(JSON.stringify(settings || {}) || '{}');
          
          let labelId = 'Ubah Konfigurasi';
          let labelEn = 'Modify Configuration';

          // Check if projectName changed
          if (last.projectName !== projectName) {
            labelId = `Ubah Nama Proyek: ${projectName}`;
            labelEn = `Rename Project: ${projectName}`;
          }
          // Compare credits length
          else if (last.credits.length !== credits.length) {
            if (credits.length > last.credits.length) {
              labelId = 'Tambah Tape Baru';
              labelEn = 'Add New Tape';
            } else {
              labelId = 'Hapus Tape';
              labelEn = 'Delete Tape';
            }
          }
          // Compare individual tape contents
          else if (JSON.stringify(last.credits) !== JSON.stringify(credits)) {
            labelId = 'Ubah Susunan Tape';
            labelEn = 'Modify Tape Layout';
          }
          // Compare settings
          else {
            const keys = Object.keys(settings) as Array<keyof ProjectSettings>;
            for (const k of keys) {
              if (last.settings[k] !== settings[k]) {
                switch (k) {
                  case 'fontFamily':
                    labelId = `Ganti Font: ${settings.fontFamily}`;
                    labelEn = `Change Font: ${settings.fontFamily}`;
                    break;
                  case 'fontSize':
                    labelId = `Atur Ukuran Nama: ${settings.fontSize}px`;
                    labelEn = `Set Name Size: ${settings.fontSize}px`;
                    break;
                  case 'roleFontSize':
                    labelId = `Atur Ukuran Posisi: ${settings.roleFontSize}px`;
                    labelEn = `Set Role Size: ${settings.roleFontSize}px`;
                    break;
                  case 'activePreset':
                    labelId = `Ganti Preset: ${settings.activePreset}`;
                    labelEn = `Change Preset: ${settings.activePreset}`;
                    break;
                  case 'bgColor':
                    labelId = 'Ubah Warna Latar';
                    labelEn = 'Change Background Color';
                    break;
                  case 'animationType':
                    labelId = `Ubah Animasi ke: ${settings.animationType}`;
                    labelEn = `Change Animation: ${settings.animationType}`;
                    break;
                  case 'roleColor':
                    labelId = 'Ubah Warna Posisi';
                    labelEn = 'Change Role Color';
                    break;
                  case 'namesColor':
                    labelId = 'Ubah Warna Nama';
                    labelEn = 'Change Names Color';
                    break;
                  case 'marginBlock':
                    labelId = 'Ubah Jarak Blok';
                    labelEn = 'Change Block Space';
                    break;
                  case 'pairsGap':
                    labelId = 'Ubah Jarak Pairs';
                    labelEn = 'Change Pairs Gap';
                    break;
                  case 'showNoise':
                    labelId = settings.showNoise ? 'Aktifkan Film Grain' : 'Matikan Film Grain';
                    labelEn = settings.showNoise ? 'Enable Film Grain' : 'Disable Film Grain';
                    break;
                  default:
                    labelId = `Ubah Parameter: ${String(k)}`;
                    labelEn = `Modify Parameter: ${String(k)}`;
                    break;
                }
                break;
              }
            }
          }

          const newFrame: HistoryFrame = { 
            credits: creditsClone, 
            settings: settingsClone,
            projectName: projectName,
            labelId,
            labelEn,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          };

          const baseHistory = prev.slice(0, activeHeadIndex + 1);
          const updated = [...baseHistory, newFrame].slice(-50);
          setHistoryIndex(updated.length - 1);
          return updated;
        } catch (e) {
          console.error("Failed to update history:", e);
          return prev;
        }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [credits, settings, projectName]);

  const undo = () => {
    if (historyIndex <= 0) return;
    const prevIdx = historyIndex - 1;
    const previous = history[prevIdx];
    if (!previous) return;

    isUndoing.current = true;
    setCredits(previous.credits);
    setSettings(previous.settings);
    setProjectName(previous.projectName);
    setHistoryIndex(prevIdx);
    setSelectedIds(new Set());
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIdx = historyIndex + 1;
    const nextFrame = history[nextIdx];
    if (!nextFrame) return;

    isUndoing.current = true;
    setCredits(nextFrame.credits);
    setSettings(nextFrame.settings);
    setProjectName(nextFrame.projectName);
    setHistoryIndex(nextIdx);
    setSelectedIds(new Set());
  };

  const jumpToHistoryIndex = (idx: number) => {
    if (idx < 0 || idx >= history.length) return;
    const frame = history[idx];
    if (!frame) return;

    isUndoing.current = true;
    setCredits(frame.credits);
    setSettings(frame.settings);
    setProjectName(frame.projectName);
    setHistoryIndex(idx);
    setSelectedIds(new Set());
  };

  // Selective feature reset back to timeline initial baseline state
  const resetSelectiveFeature = (key: keyof ProjectSettings) => {
    if (history.length === 0) return;
    const originalSettings = history[0]?.settings;
    if (!originalSettings) return;

    setSettings(prev => ({
      ...prev,
      [key]: originalSettings[key]
    }));
  };

  const [newRole, setNewRole] = useState('');
  const [newNames, setNewNames] = useState('');
  const [newIsPairs, setNewIsPairs] = useState(false);

  const [activeConsole, setActiveConsole] = useState<'none' | 'color' | 'bg' | 'font' | 'anim' | 'preset'>('none');
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('daftarkru_credits_v2', JSON.stringify(credits));
    handleSaveIndicator();
  }, [credits]);

  useEffect(() => {
    localStorage.setItem('daftarkru_settings', JSON.stringify(settings));
    handleSaveIndicator();
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('daftarkru_projectName', projectName);
    handleSaveIndicator();
  }, [projectName]);

  const [isExporting, setIsExporting] = useState(false);
  const [renderingTextIndex, setRenderingTextIndex] = useState(0);

  useEffect(() => {
    if (isExporting) {
      const interval = setInterval(() => {
        setRenderingTextIndex((prev) => (prev + 1) % 3);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isExporting]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [previewScaleValue, setPreviewScale] = useState(1);
  const [fullscreenScaleValue, setFullscreenScale] = useState(1);
  const [previewWidth, setPreviewWidth] = useState(1920);
  const [fullscreenWidth, setFullscreenWidth] = useState(1920);
  const [fadeIndex, setFadeIndex] = useState(0);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [isPreviewCollapsedMobile, setIsPreviewCollapsedMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [customFonts, setCustomFonts] = useState<{ name: string, url: string, value: string }[]>(() => {
    return safeParse(localStorage.getItem('daftarkru_customFonts'), []);
  });

  // Effect to manage custom font styles and persistence
  useEffect(() => {
    const styleId = 'custom-fonts-style-container';
    let style = document.getElementById(styleId) as HTMLStyleElement;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    
    if (customFonts.length > 0) {
      const fontFaces = customFonts.map(font => `
        @font-face {
          font-family: '${font.value}';
          src: url('${font.url}');
          font-display: swap;
        }
      `).join('\n');
      style.textContent = fontFaces;
      
      // Persist to localStorage (limit to 5 fonts to avoid quota exceeded)
      try {
        const fontsToSave = customFonts.slice(-5);
        localStorage.setItem('daftarkru_customFonts', JSON.stringify(fontsToSave));
      } catch (e) {
        console.warn("Failed to persist fonts to localStorage (probably quota exceeded):", e);
      }
    } else {
      style.textContent = '';
    }
  }, [customFonts]);

  const handleDeleteFont = (e: React.MouseEvent, fontValue: string) => {
    e.stopPropagation();
    setCustomFonts((prev) => prev.filter((f) => f.value !== fontValue));
    if (settings.fontFamily === fontValue) {
      setSettings((prev: any) => ({ ...prev, fontFamily: 'Inter' }));
    }
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>, fileInputRef: React.RefObject<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Filter by type and MIME
    const allowedExtensions = /\.(ttf|otf|woff|woff2)$/i;

    if (!file.name.match(allowedExtensions)) {
      alert("Format font tidak didukung atau file tidak valid. Gunakan .ttf, .otf, atau .woff/.woff2");
      return;
    }

    // Size check (max 2MB for browser stability and localStorage)
    if (file.size > 2 * 1024 * 1024) {
      alert("File font terlalu besar (Maksimal 2MB)");
      return;
    }

    const reader = new FileReader();
    
    reader.onprogress = (data) => {
      if (data.lengthComputable) {
        // Progress tracking if needed
      }
    };

    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (!result) {
        console.error("FileReader result is empty");
        return;
      }

      const fontId = 'font-' + Date.now();
      const fontNameRaw = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
      const fontNameValue = `custom-${fontNameRaw || fontId}`;
      const fontDisplayName = file.name.split('.')[0].toUpperCase();
      
      const newFont = {
        name: fontDisplayName,
        value: fontNameValue,
        url: result
      };

      try {
        // Use FontFace API for immediate browser recognition if available
        if (typeof FontFace !== 'undefined') {
          try {
            const fontFace = new FontFace(fontNameValue, `url(${result})`);
            await fontFace.load();
            document.fonts.add(fontFace);
          } catch {
            // Fallback handled
          }
        }

        // Update state and immediately apply
        setCustomFonts((prev) => {
          const exists = prev.some(f => f.value === fontNameValue);
          let next;
          if (exists) {
            next = prev.map(f => f.value === fontNameValue ? newFont : f);
          } else {
            next = [...prev, newFont].slice(-5); // Keep only last 5
          }
          return next;
        });
        
        setSettings((prev: any) => ({ ...prev, fontFamily: fontNameValue }));
        
        alert(`Berhasil! Font "${fontDisplayName}" telah ditambahkan dan diaplikasikan.`);
      } catch {
        alert("Gagal memproses font. Silakan coba file lain.");
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      alert("Gagal membaca file font.");
    };

    reader.readAsDataURL(file);
  };

  const getAnimationTotalDuration = () => {
    if (credits.length === 0) return 5;
    
    const scrollEl = scrollRef.current;
    const contentHeight = scrollEl ? scrollEl.scrollHeight : (credits.length * 160 + 400);
    
    if (settings.animationType === 'scroll') {
      const travelDistance = contentHeight + 900; 
      // 1=40px/s, 5=120px/s, 10=300px/s
      const pps = 40 + (settings.animationDuration - 1) * 28.8;
      return travelDistance / pps;
    } else {
      // Use animationDuration directly as seconds per scene (e.g. 2.0 = 2 seconds)
      const timePerTape = settings.animationDuration;
      return credits.length * timePerTape;
    }
  };

  // Timer for fade/zoom/blur/slide/glitch in preview
  useEffect(() => {
    if (settings.animationType === 'scroll' || credits.length === 0 || !isAutoPlay) return;

    // Use animationDuration directly as seconds per scene
    const timePerTape = settings.animationDuration;
    
    const interval = setInterval(() => {
      setFadeIndex(prev => (prev + 1) % credits.length);
    }, timePerTape * 1000); 

    return () => clearInterval(interval);
  }, [settings.animationType, settings.animationDuration, credits.length, isAutoPlay]);

  // Real-time slider sync for scroll animation
  useEffect(() => {
    if (settings.animationType !== 'scroll' || !isAutoPlay) return;

    const duration = getAnimationTotalDuration();
    const intervalTime = (duration * 1000) / 250; 
    const interval = setInterval(() => {
      setFadeIndex(prev => (prev + 4) % 1000);
    }, intervalTime); 

    return () => clearInterval(interval);
  }, [settings.animationType, settings.animationDuration, isAutoPlay, credits.length]);

  const isMobileDevice = typeof navigator !== 'undefined' ? /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) : false;
  
  // Base width for all design calculations - using 1920 as the target (1080p)
  const DESIGN_BASE_WIDTH = 1920;
  const DESIGN_BASE_HEIGHT = 1080;
  
  const previewScale = isExporting ? 1 : previewScaleValue;
  const fullscreenScale = isExporting ? 1 : fullscreenScaleValue;

  const previewRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  const addRole = () => {
    if (!newRole.trim() || !newNames.trim()) return;
    
    if (editingId) {
      const updated = credits.map(c => 
        c.id === editingId 
          ? { 
              ...c, 
              role: newRole, 
              names: newNames.split('\n').filter(n => n.trim() !== '').map(n => n.trim()),
              isPairs: newIsPairs
            } 
          : c
      );
      setCredits(updated);
      setEditingId(null);
    } else {
      const entry: CreditEntry = {
        id: Date.now().toString(),
        role: newRole,
        names: newNames.split('\n').filter(n => n.trim() !== '').map(n => n.trim()),
        isPairs: newIsPairs
      };
      const updated = [...credits, entry];
      setCredits(updated);
    }
    
    setNewRole('');
    setNewNames('');
    setNewIsPairs(false);
  };

  const startEditing = (id: string) => {
    const tape = credits.find(c => c.id === id);
    if (tape) {
      setNewRole(tape.role);
      setNewNames((tape.names || []).join('\n'));
      setNewIsPairs(tape.isPairs || false);
      setEditingId(id);
      setOpenSettingsId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewRole('');
    setNewNames('');
    setNewIsPairs(false);
  };

  const removeRole = (id: string) => {
    const updated = credits.filter(c => c.id !== id);
    setCredits(updated);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const bulkDelete = () => {
    if (selectedIds.size === 0) return;
    const updated = credits.filter(c => !selectedIds.has(c.id));
    setCredits(updated);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === credits.length && credits.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(credits.map(c => c.id)));
    }
  };

  const togglePairs = (id: string) => {
    setCredits(prev => prev.map(item => 
      item.id === id ? { ...item, isPairs: !item.isPairs } : item
    ));
  };

  const duplicateTape = (id: string) => {
    const tape = credits.find(c => c.id === id);
    if (tape) {
      const newTape = {
        ...tape,
        id: Math.random().toString(36).substr(2, 9)
      };
      const index = credits.findIndex(c => c.id === id);
      const updated = [...credits];
      updated.splice(index + 1, 0, newTape);
      setCredits(updated);
    }
  };


  useEffect(() => {
    if (!previewRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        if (width === 0 || height === 0) return;
        setPreviewWidth(width);
        // Scale down the 1920x1080 canvas to fit the preview container
        const scaleX = width / DESIGN_BASE_WIDTH;
        const scaleY = height / DESIGN_BASE_HEIGHT;
        setPreviewScale(Math.min(scaleX, scaleY));
      }
    });

    observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!fullscreenContainerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        if (width === 0 || height === 0) return;
        setFullscreenWidth(width);
        // Scale down the 1920x1080 canvas to fit the fullscreen container
        const scaleX = width / DESIGN_BASE_WIDTH;
        const scaleY = height / DESIGN_BASE_HEIGHT;
        setFullscreenScale(Math.min(scaleX, scaleY));
      }
    });

    observer.observe(fullscreenContainerRef.current);
    return () => observer.disconnect();
  }, [isFullscreen]);

   const recordVideo = async () => {
    if (!previewRef.current || !scrollRef.current) {
      console.error("References not found:", { preview: !!previewRef.current, scroll: !!scrollRef.current });
      return;
    }
    
    if (typeof VideoEncoder === 'undefined') {
      alert("Browser Anda tidak mendukung VideoEncoder API yang diperlukan untuk ekspor. Gunakan Chrome atau Edge versi terbaru. iOS saat ini belum mendukung penuh fitur ini di dalam AI Studio.");
      return;
    }

    setExportProgress(0);
    setIsExporting(true);

    const scroll = scrollRef.current;
    const canvasWidth = 1920; 
    const canvasHeight = 1080;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const runEncode = (): Promise<{ success: boolean; isAlphaError: boolean }> => {
      return new Promise<{ success: boolean; isAlphaError: boolean }>(async (originalResolve) => {
        let active = true;
        let exportPromiseResolved = false;
        
        const resolve = (result: { success: boolean; isAlphaError: boolean }) => {
          if (!exportPromiseResolved) {
            exportPromiseResolved = true;
            originalResolve(result);
          }
        };

        const originalStyle = scroll.style.cssText;
        const originalParentStyle = scroll.parentElement?.style.cssText || '';

        const restoreStyles = () => {
          scroll.style.cssText = originalStyle;
          if (scroll.parentElement) {
            scroll.parentElement.style.cssText = originalParentStyle;
          }
        };

        const fps = isMobile ? 30 : 60;
        const duration = getAnimationTotalDuration();
        const totalFrames = Math.floor(duration * fps);

        // Virtual Canvas Preparation
        if (scroll.parentElement) {
          scroll.parentElement.style.overflow = 'visible';
          scroll.parentElement.style.width = 'auto';
          scroll.parentElement.style.maxWidth = 'none';
          scroll.parentElement.style.height = 'auto';
          scroll.parentElement.style.transform = 'none';
        }

        scroll.style.position = 'fixed';
        scroll.style.top = '0';
        scroll.style.left = '0';
        scroll.style.width = `${canvasWidth}px`;
        scroll.style.maxWidth = `${canvasWidth}px`;
        scroll.style.minWidth = `${canvasWidth}px`;
        scroll.style.height = 'auto'; 
        scroll.style.overflow = 'visible';
        scroll.style.margin = '0';
        scroll.style.opacity = '1';
        scroll.style.pointerEvents = 'none';
        scroll.style.transform = 'none';
        scroll.style.display = 'block';
        scroll.style.zIndex = '999999';

        scroll.style.backgroundColor = settings.bgColor;

        let muxer: any = null;
        let videoEncoder: VideoEncoder | null = null;


        try {
          videoEncoder = new VideoEncoder({
            output: (chunk, metadata) => {
              if (active && muxer) muxer.addVideoChunk(chunk, metadata);
            },
            error: (e) => {
              console.error("VideoEncoder error in output/encode:", e);
              active = false;
              restoreStyles();
              resolve({ success: false, isAlphaError: false });
            }
          });
        } catch (encInstantiationErr) {
          console.error("Failed to instantiate VideoEncoder:", encInstantiationErr);
          restoreStyles();
          resolve({ success: false, isAlphaError: false });
          return;
        }

        try {
          // Wait for fonts to be ready and specifically load the selected font
          await document.fonts.ready;
          try {
            await document.fonts.load(`1em ${settings.fontFamily}`);
          } catch {
            console.warn("Failed to specifically load font:", settings.fontFamily);
          }
          await new Promise(r => setTimeout(r, 100));

          const canvas = document.createElement('canvas');
          canvas.width = canvasWidth; 
          canvas.height = canvasHeight;
          const ctx = canvas.getContext('2d', { alpha: true });
          if (!ctx) {
            restoreStyles();
            resolve({ success: false, isAlphaError: false });
            return;
          }

          // Pre-render noise texture for performance
          const noiseCanvas = document.createElement('canvas');
          noiseCanvas.width = canvasWidth;
          noiseCanvas.height = canvasHeight;
          const nCtx = noiseCanvas.getContext('2d');
          if (nCtx) {
            nCtx.fillStyle = 'rgba(255,255,255,0.05)';
            for (let i = 0; i < 40000; i++) {
              nCtx.fillRect(Math.random() * canvasWidth, Math.random() * canvasHeight, 1, 1);
            }
          }

          // Pre-render scanline pattern
          const scanlineCanvas = document.createElement('canvas');
          scanlineCanvas.width = 1;
          scanlineCanvas.height = 4;
          const sCtx = scanlineCanvas.getContext('2d');
          if (sCtx) {
            sCtx.fillStyle = 'rgba(0,0,0,0.2)';
            sCtx.fillRect(0, 0, 1, 2);
          }
          const scanlinePattern = ctx.createPattern(scanlineCanvas, 'repeat');

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          try {
            videoEncoder.configure({
              codec: 'vp09.00.10.08',
              alpha: 'discard',
              width: canvasWidth,
              height: canvasHeight,
              bitrate: isMobile ? 5_000_000 : 12_000_000, 
              latencyMode: 'realtime'
            });
          } catch (configErr) {
             console.warn("VideoEncoder configuration failed:", configErr);
             throw configErr;
          }

          // Setup Muxer with matching alpha support
          try {
            muxer = new Muxer({
              target: new ArrayBufferTarget(),
              video: {
                codec: 'V_VP9',
                width: canvasWidth,
                height: canvasHeight,
                frameRate: fps,
                alpha: false,
              }
            });
          } catch (muxerCreationErr) {
            console.error("Muxer creation failed:", muxerCreationErr);
            restoreStyles();
            resolve({ success: false, isAlphaError: false });
            return;
          }

          // Re-measure after ensuring DOM update and style application
          await new Promise(r => setTimeout(r, 100)); 
          
          let scrollHeight = scroll.scrollHeight; 
          if (scrollHeight === 0) scrollHeight = 2000;
          
          // Memory safeguard for very long credit lists
          if (scrollHeight > 15000) {
            alert("Daftar kredit terlalu panjang untuk satu render (melebihi 15000px). Hasil mungkin terpotong atau gagal. Pertimbangkan untuk membagi kredit menjadi beberapa bagian.");
            scrollHeight = 15000;
          }
          
          if (scrollHeight < canvasHeight) {
            scrollHeight = canvasHeight;
          }

          const blocks = Array.from(scroll.querySelectorAll('.credit-block')) as HTMLDivElement[];
          const blockMeasurements = blocks.map(b => ({
            height: b.offsetHeight,
            top: b.offsetTop
          }));

          setExportProgress(2);
          
          const captureWidth = canvasWidth; 
          const { toPng } = await import('html-to-image');
          
          const commonOptions: any = {
            pixelRatio: 1,
            width: canvasWidth,
            height: scrollHeight,
            cacheBust: true, 
            skipFonts: false,
            style: {
              transform: 'none',
              animation: 'none',
              transition: 'none',
              opacity: '1',
              visibility: 'visible',
              position: 'static',
              margin: '0',
              padding: `0`,
              width: `${canvasWidth}px`,
              maxWidth: `${canvasWidth}px`,
              minWidth: `${canvasWidth}px`,
              imageRendering: 'auto',
              background: settings.bgColor,
              fontFamily: `'${settings.fontFamily}', sans-serif`,
              filter: settings.lut === 'noir' ? 'grayscale(1) contrast(1.2)' :
                      settings.lut === 'sepia' ? 'sepia(0.8) contrast(1.1)' :
                      settings.lut === 'cold' ? 'saturate(0.6) hue-rotate(20deg) brightness(0.9) sepia(0.2)' :
                      settings.lut === 'warm' ? 'saturate(1.4) hue-rotate(-10deg) brightness(1.05)' :
                      settings.lut === 'mute' ? 'saturate(0.2) contrast(0.9)' : 'none'
            },
            filter: (node: any) => {
              if (node.tagName === 'LINK' || node.tagName === 'STYLE') {
                try {
                   const sheet = (node as any).sheet as CSSStyleSheet;
                   if (!sheet) return false;
                   if (node.tagName === 'LINK') {
                     const href = node.getAttribute('href');
                     if (href && !href.startsWith(window.location.origin) && !href.startsWith('/')) {
                        if (node.getAttribute('crossorigin') === null) {
                          return false;
                        }
                     }
                   }
                   try {
                     const rules = sheet.cssRules;
                     return !!rules;
                   } catch {
                     return false;
                   }
                } catch {
                  return false;
                }
              }
              return true;
            }
          };

          commonOptions.backgroundColor = settings.bgColor;

          let bigImage;
          try {
            bigImage = await toPng(scroll, commonOptions);
          } catch {
            bigImage = await toPng(scroll, { ...commonOptions, skipFonts: true });
          }

          // Restore original state promptly
          restoreStyles();

          const img = new Image();
          await new Promise((resL, rejL) => {
            img.onload = resL;
            img.onerror = () => rejL(new Error("Failed to load captured scroll image"));
            img.src = bigImage;
          });

          const imgWidth = captureWidth;
          const imgHeight = scrollHeight;
          const startPos = canvasHeight; 
          const endPos = -imgHeight;
          const travelDistance = startPos - endPos;

        const renderFrame = async (frame: number) => {
          const progress = frame / (totalFrames - 1);
          
          if (false) {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          } else {
            ctx.fillStyle = settings.bgColor;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          }

          if (settings.animationType === 'scroll') {
            let drawY = 0;
            if (settings.direction === 'bottomToTop') {
              drawY = startPos - (progress * travelDistance);
            } else if (settings.direction === 'topToBottom') {
              drawY = endPos + (progress * travelDistance);
            }
            const drawX = (canvasWidth - imgWidth) / 2;
            ctx.drawImage(img, Math.round(drawX), Math.round(drawY), imgWidth, imgHeight);
          } else if (settings.animationType !== 'scroll' && blockMeasurements.length > 0) {
            const entriesCount = blockMeasurements.length;
            const entryDuration = 1 / entriesCount;
            const currentEntryIndex = Math.min(Math.floor(progress / entryDuration), entriesCount - 1);
            const entryProgress = (progress % entryDuration) / entryDuration;
            
            let opacity = 1;
            if (entryProgress < 0.1) opacity = entryProgress / 0.1;
            else if (entryProgress > 0.9) opacity = (1 - entryProgress) / 0.1;

            let scale = 1;
            let blur = 0;
            let offsetY = 0;

            if (settings.animationType === 'zoom') {
              scale = 0.9 + (entryProgress * 0.2);
            } else if (settings.animationType === 'blur') {
              if (entryProgress < 0.2) blur = (0.2 - entryProgress) * 100;
              else if (entryProgress > 0.8) blur = (entryProgress - 0.8) * 100;
            } else if (settings.animationType === 'slide') {
              if (entryProgress < 0.2) offsetY = (0.2 - entryProgress) * 200;
              else if (entryProgress > 0.8) offsetY = (0.8 - entryProgress) * 200;
            } else if (settings.animationType === 'glitch') {
              if (entryProgress < 0.1 || entryProgress > 0.9 || Math.random() > 0.95) {
                offsetY = (Math.random() - 0.5) * 20;
                opacity *= 0.8;
              }
            }

            const block = blockMeasurements[currentEntryIndex];
            const sY = block.top;
            const sH = block.height;
            const sW = captureWidth;
            
            const dW = imgWidth;
            const dH = block.height;
            const drawX = (canvasWidth - dW) / 2;
            const dY = (canvasHeight - dH) / 2;

            ctx.save();
            if (blur > 0) ctx.filter = `blur(${blur}px)`;
            ctx.globalAlpha = opacity;
            ctx.translate(Math.round(drawX) + dW / 2, dY + dH / 2 + offsetY);
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, sY, sW, sH, -dW / 2, -dH / 2, dW, dH);
            ctx.restore();
          }

          // Optimized Overlay effects in export
          if (settings.showNoise) {
            ctx.save();
            ctx.globalAlpha = settings.noiseOpacity * 0.8;
            const ox = Math.random() * 40 - 20;
            const oy = Math.random() * 40 - 20;
            ctx.drawImage(noiseCanvas, ox, oy);
            ctx.restore();
          }
          if (settings.showScanlines && scanlinePattern) {
            ctx.fillStyle = scanlinePattern;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          }
          if (settings.vignette > 0) {
            const vRange = Math.max(canvasWidth, canvasHeight) / 1.1;
            const gradient = ctx.createRadialGradient(
              canvasWidth / 2, canvasHeight / 2, 0,
              canvasWidth / 2, canvasHeight / 2, vRange
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(1, `rgba(0,0,0,${settings.vignette * 0.95})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          }

          if (frame % 30 === 0) {
            setExportProgress(Math.min(99, Math.round((frame / totalFrames) * 100)));
          }

          if (!active) return;

          try {
            if (videoEncoder.state !== 'configured') {
              active = false;
              return;
            }
            const videoFrame = new VideoFrame(canvas, { timestamp: (frame * 1000000) / fps });
            videoEncoder.encode(videoFrame, { keyFrame: frame % 60 === 0 });
            videoFrame.close();
          } catch (encodeErr) {
            console.warn("Synchronous encode / frame push failed:", encodeErr);
            active = false;
          }
        };

        for (let frame = 0; frame < totalFrames && active; frame++) {
          await renderFrame(frame);
          if (!active) break;
          
          if (videoEncoder.encodeQueueSize > 30) {
            await new Promise(resQ => {
              const check = () => {
                if (videoEncoder.encodeQueueSize < 10 || !active) resQ(null);
                else setTimeout(check, 50);
              };
              check();
            });
          }
          if (frame % (isMobile ? 2 : 15) === 0) {
            await new Promise(r => setTimeout(r, 0));
          }
        }

        if (active) {
          setExportProgress(100);
          await new Promise(resWait => setTimeout(resWait, 2400));

          if (videoEncoder.state === 'configured') {
            try {
              await videoEncoder.flush();
              muxer.finalize();

              const { buffer } = muxer.target as ArrayBufferTarget;
              const blob = new Blob([buffer], { type: 'video/webm' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = `${projectName.trim().replace(/\s+/g, '_').toUpperCase()}.webm`;
              document.body.appendChild(a);
              a.click();
              
              setTimeout(() => {
                if (document.body.contains(a)) document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 2000);

              resolve({ success: true, isAlphaError: false });
            } catch (finalErr) {
              console.error("Flush or finalization failed:", finalErr);
              resolve({ success: false, isAlphaError: false });
            }
          } else {
            resolve({ success: false, isAlphaError: false });
          }
        } else {
          resolve({ success: false, isAlphaError: false });
        }
        } catch (err) {
          console.error("Internal record error:", err);
          restoreStyles();
          resolve({ success: false, isAlphaError: false });
        }
      });
    };

    try {
      let result = await runEncode();
      if (!result.success) {
        alert(lang === 'id' 
          ? "Ekspor gagal karena memori tidak cukup atau browser tidak mendukung. Coba perpendek durasi atau gunakan desktop." 
          : "Export failed due to insufficient memory or unsupported browser. Try shortening the duration or using desktop.");
      }
    } catch (outerErr) {
      console.error("Outer capture error:", outerErr);
      alert("Terjadi kesalahan saat mengekspor.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const initiateExport = () => {
    setTempProjectName(projectName);
    setIsChangeNameModalOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
      
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsAutoPlay(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        setFadeIndex(prev => (prev + 1) % Math.max(1, credits.length));
        setIsAutoPlay(false);
      } else if (e.code === 'ArrowLeft') {
        setFadeIndex(prev => (prev - 1 + Math.max(1, credits.length)) % Math.max(1, credits.length));
        setIsAutoPlay(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        initiateExport();
      } else if (e.key.toLowerCase() === 'e') {
        setIsRightSidebarCollapsed(prev => !prev);
      } else if (e.key.toLowerCase() === 'q') {
        setIsSidebarCollapsed(prev => !prev);
      } else if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsConsoleCollapsed(prev => !prev);
      } else if (e.key === 'Escape') {
        setActiveConsole('none');
      } else if (e.key === '1') {
        setActiveConsole('font');
      } else if (e.key === '2') {
        setActiveConsole('anim');
      } else if (e.key === '3') {
        setActiveConsole('color');
      } else if (e.key === '4') {
        setActiveConsole('bg');
      } else if (e.key === '5') {
        setActiveConsole('preset');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (view === 'hero') {
          setIsMobileMenuOpen(prev => !prev);
        } else {
          setIsMenuOpen(prev => !prev);
        }
      } else if (e.key === '?' || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, isAutoPlay, credits.length, initiateExport, setIsSidebarCollapsed, setIsRightSidebarCollapsed, setIsConsoleCollapsed, setActiveConsole, setIsShortcutsOpen, view, setIsMobileMenuOpen, setIsMenuOpen]);

  const [tagTextIndex, setTagTextIndex] = useState(0);
  const tagTexts = [
    translations[lang].hero.tag1,
    translations[lang].hero.tag2,
    translations[lang].hero.tag3,
    translations[lang].hero.tag4
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTagTextIndex((prev) => (prev + 1) % tagTexts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tagTexts.length]);

  return (
    <div className={cn(
      "min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black",
      view === 'editor' ? "lg:h-screen lg:overflow-hidden flex flex-col" : "overflow-x-hidden"
    )}>
      <ClapperboardTransition isOpen={isClapping} />
      
      {view !== 'editor' && (
        <Navbar 
          lang={lang} 
          setLang={setLang} 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          view={view}
          setView={setView}
          isHidden={isHidden}
          isScrolled={isScrolled}
          lenisRef={lenisRef}
        />
      )}
      
      <AnimatePresence mode="wait">
        {view === 'hero' ? (
          <main key="landing-wrapper" className="flex flex-col w-full">
            <motion.section 
              key="hero"
              id="home"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8 text-center relative overflow-hidden bg-black"
            >
              <BackgroundElements showPerspectiveGrid={true} />
              
              <div className="max-w-7xl space-y-12 md:space-y-16 z-10 w-full px-4 pt-20 sm:pt-32 pb-10 sm:pb-20">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="inline-flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-1.5 sm:py-2 border border-white/10 rounded-none bg-white/5 backdrop-blur-md mb-6 sm:mb-8"
                  >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse" />
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={tagTexts[tagTextIndex]}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest sm:tracking-[0.5em] text-zinc-400"
                      >
                        {tagTexts[tagTextIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                  
                  <h1 
                    className="text-5xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black tracking-tighter uppercase leading-[0.75] whitespace-normal cursor-default select-none italic"
                  >
                    Daftar<span 
                      className="inline-block" 
                      style={{ 
                        WebkitTextStroke: isMobileDevice ? '0.5px rgba(255,255,255,1)' : '1px rgba(255,255,255,1)', 
                        color: 'transparent',
                        background: 'none'
                      }}
                    >
                      Kru
                    </span><br /> Engine
                  </h1>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.5 }}
                    className="text-[13px] sm:text-[15px] md:text-[17px] font-sans font-medium text-white/60 max-w-2xl mx-auto h-6 flex items-center justify-center py-12 tracking-normal"
                  >
                    <TypingDescription lang={lang} />
                  </motion.div>
                </div>

                <div className="flex flex-col items-center gap-12">
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.8 }}
                    onClick={() => {
                      triggerClapperTransition();
                    }}
                    className="group relative px-8 sm:px-12 py-4 sm:py-6 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] sm:text-[12px] overflow-hidden transition-all duration-300 hero-button shadow-[4px_4px_0px_rgba(255,255,255,0.15)] hover:shadow-[8px_8px_0px_rgba(255,255,255,0.25)] border border-white cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16, 1, 0.3, 1]" />
                    <span className="relative z-10 group-hover:text-white transition-colors duration-300 flex items-center gap-10">
                      {translations[lang].hero.button}
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1], 
                          rotate: [0, 15, -15, 0],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center justify-center"
                      >
                        <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                      </motion.div>
                    </span>
                  </motion.button>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2.5 text-[9px] text-zinc-700 font-black uppercase">
                      <Mouse className="w-3.5 h-3.5 text-zinc-650 shrink-0 animate-bounce" />
                      <span className="tracking-[0.6em] mr-[-0.6em]">{translations[lang].hero.scroll}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            
            <AboutSection lang={lang} onStart={triggerClapperTransition} />
            <Marquee text={translations[lang].editor.rendering + " CREDITS ENGINE"} />
            <DocumentationSection lang={lang} />
            <FAQSection lang={lang} />
            <GetStartedSection lang={lang} onStart={triggerClapperTransition} />

          </main>
        ) : (
          <motion.div 
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col lg:h-screen lg:overflow-hidden"
          >
            {/* Header */}
            <header className={cn("h-16 md:h-20 border-b border-white flex items-center justify-between px-4 md:px-8 bg-black flex-shrink-0 relative", (isHistoryOpen || isMenuOpen) ? "z-[11000]" : "z-[100]")}>
              <div 
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => {
                  // Logo click in workspace acts as a "Home" button
                  // Hard refresh requested for returning home to ensure full reset
                  window.location.href = window.location.origin;
                }}
              >
                <img src="/daftarkru.png" alt="DaftarKru" className="h-5 md:h-10 w-auto" />
              </div>
              
              <div className="flex items-center gap-2 md:gap-4 relative">
                {/* RIWAYAT (HISTORY) COMPONENT POPUP */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsHistoryOpen(!isHistoryOpen);
                      if (isMenuOpen) setIsMenuOpen(false);
                    }}
                    className={cn(
                      "p-2 md:p-3 border border-white transition-all rounded-none flex items-center justify-center gap-2 text-[10px] md:text-sm font-bold tracking-widest cursor-pointer",
                      isHistoryOpen ? "bg-white text-black" : "text-white bg-black hover:bg-white hover:text-black"
                    )}
                    title={lang === 'id' ? "Lihat Riwayat & Batal Khusus" : "View History & Selective Undo"}
                  >
                    <History className="w-4 h-4" />
                    <span className="hidden sm:inline">RIWAYAT</span>
                  </button>

                  <AnimatePresence>
                    {isHistoryOpen && (
                      <>
                        {/* Underlay click out with elegant dim on mobile */}
                        <div 
                          className="fixed inset-0 z-[10998] cursor-default bg-black/50 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none" 
                          onClick={() => setIsHistoryOpen(false)} 
                        />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          transition={{ duration: 0.2 }}
                          className="fixed inset-x-4 top-[72px] mx-auto w-auto max-w-[440px] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96 bg-[#0c0c0c] border border-white p-4 z-[11000] shadow-[10px_10px_0px_rgba(255,255,255,0.03)] flex flex-col font-sans text-xs max-h-[75vh] sm:max-h-[480px] overflow-hidden"
                        >
                          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2">
                            <span className="font-extrabold tracking-widest text-white text-[10px] uppercase font-sans">
                              {lang === 'id' ? "PANEL RIWAYAT DESAIN" : "DESIGN HISTORY PANEL"}
                            </span>
                            <button 
                              onClick={() => setIsHistoryOpen(false)}
                              className="text-white/40 hover:text-white cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Quick description note */}
                          <div className="text-[10px] text-zinc-400 mb-2 leading-relaxed">
                            {lang === 'id' 
                              ? (historyTab === 'timeline' 
                                ? "Tips: Klik pada salah satu aktivitas di bawah untuk melompat langsung ke momen tersebut."
                                : "Tips: Anda bisa membatalkan/mereset satu fitur pilihan saja tanpa merusak perubahan lainnya.")
                              : (historyTab === 'timeline'
                                ? "Tip: Click on any activity below to jump back to that exact moment instanlty."
                                : "Tip: Revert only a specific visual change without losing your other edits.")
                            }
                          </div>

                          {/* QUICK UNDO/REDO ACTION BAR */}
                          <div className="grid grid-cols-2 gap-1.5 mb-3 bg-white/5 border border-white/10 p-1.5">
                            <button
                              onClick={undo}
                              disabled={historyIndex <= 0}
                              className={cn(
                                "py-1.5 flex items-center justify-center gap-1.5 text-[9px] font-bold tracking-wider uppercase transition-all rounded-none border",
                                historyIndex <= 0 
                                  ? "opacity-25 border-transparent text-zinc-600 cursor-not-allowed" 
                                  : "bg-black text-white hover:bg-white hover:text-black cursor-pointer border-white/20 hover:border-white"
                              )}
                              title={lang === 'id' ? "Batal perubahan terakhir" : "Undo last change"}
                            >
                              <Undo className="w-3.5 h-3.5" />
                              {lang === 'id' ? 'BATAL' : 'UNDO'}
                            </button>
                            <button
                              onClick={redo}
                              disabled={historyIndex >= history.length - 1}
                              className={cn(
                                "py-1.5 flex items-center justify-center gap-1.5 text-[9px] font-bold tracking-wider uppercase transition-all rounded-none border",
                                historyIndex >= history.length - 1 
                                  ? "opacity-25 border-transparent text-zinc-600 cursor-not-allowed" 
                                  : "bg-black text-white hover:bg-white hover:text-black cursor-pointer border-white/20 hover:border-white"
                              )}
                              title={lang === 'id' ? "Ulangi perubahan terakhir" : "Redo last change"}
                            >
                              <Redo className="w-3.5 h-3.5" />
                              {lang === 'id' ? 'ULANG' : 'REDO'}
                            </button>
                          </div>

                          {/* Tabs */}
                          <div className="grid grid-cols-2 gap-1 bg-black border border-white/10 p-1 mb-3">
                            <button
                              onClick={() => setHistoryTab('timeline')}
                              className={cn(
                                "py-1.5 text-center text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer",
                                historyTab === 'timeline' ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                              )}
                            >
                              {lang === 'id' ? 'URUTAN WAKTU' : 'TIMELINE'}
                            </button>
                            <button
                              onClick={() => setHistoryTab('selective')}
                              className={cn(
                                "py-1.5 text-center text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer",
                                historyTab === 'selective' ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                              )}
                            >
                              {lang === 'id' ? 'BATAL FITUR PILIHAN' : 'SELECTIVE RESET'}
                            </button>
                          </div>

                          {/* TIMELINE VIEW */}
                          {historyTab === 'timeline' && (
                            <div className="flex flex-col flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-[220px] custom-scrollbar scrollbar-thin">
                              {history.map((frame, idx) => {
                                const isActive = idx === historyIndex;
                                const isRedoState = idx > historyIndex;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => jumpToHistoryIndex(idx)}
                                    className={cn(
                                      "w-full text-left p-2 border transition-all flex items-center justify-between group cursor-pointer",
                                      isActive 
                                        ? "bg-white/10 border-white text-white font-bold" 
                                        : isRedoState 
                                          ? "bg-transparent border-dashed border-white/5 text-zinc-600 hover:border-white/20 hover:text-zinc-400"
                                          : "bg-transparent border-white/10 text-zinc-400 hover:border-white/30 hover:text-white"
                                    )}
                                  >
                                    <div className="flex flex-col gap-0.5 font-sans">
                                      <span className="text-[10px] font-medium tracking-wide truncate max-w-[200px] md:max-w-[260px]">
                                        {lang === 'id' ? frame.labelId : frame.labelEn}
                                      </span>
                                      <span className="text-[8px] opacity-40 font-mono">
                                        ⏱️ {frame.timestamp}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 font-mono">
                                      {isActive && (
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                      )}
                                      <span className="text-[8px] opacity-30">
                                        #{idx + 1}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* SELECTIVE FEATURE UNDO VIEW */}
                          {historyTab === 'selective' && (
                            <div className="flex flex-col flex-1 overflow-y-auto pr-1 space-y-2 max-h-[220px] custom-scrollbar">
                              {(() => {
                                if (history.length === 0) return (
                                  <div className="py-8 text-center text-zinc-500 text-[10px] font-sans">
                                    {lang === 'id' ? 'BELUM ADA PERUBAHAN GAYA' : 'NO STYLE CHANGES YET'}
                                  </div>
                                );

                                const originalSettings = history[0]?.settings;
                                if (!originalSettings) return null;

                                // Filter to only see properties that have changed from original index 0
                                const selectiveFeaturesList = [
                                  { key: 'fontFamily' as keyof ProjectSettings, labelId: 'Gaya Font', labelEn: 'Font Family', value: settings.fontFamily },
                                  { key: 'fontSize' as keyof ProjectSettings, labelId: 'Ukuran Nama', labelEn: 'Name Font Size', value: `${settings.fontSize}px` },
                                  { key: 'roleFontSize' as keyof ProjectSettings, labelId: 'Ukuran Posisi', labelEn: 'Role Font Size', value: `${settings.roleFontSize}px` },
                                  { key: 'roleColor' as keyof ProjectSettings, labelId: 'Warna Posisi', labelEn: 'Role Color', value: settings.roleColor, isColor: true },
                                  { key: 'namesColor' as keyof ProjectSettings, labelId: 'Warna Nama', labelEn: 'Names Color', value: settings.namesColor, isColor: true },
                                  { key: 'bgColor' as keyof ProjectSettings, labelId: 'Warna Latar', labelEn: 'Backdrop Color', value: settings.bgColor, isColor: true },
                                  { key: 'marginBlock' as keyof ProjectSettings, labelId: 'Jarak Blok', labelEn: 'Block Spacing', value: `${settings.marginBlock}px` },
                                  { key: 'pairsGap' as keyof ProjectSettings, labelId: 'Jarak Pairs', labelEn: 'Pairs Gaps', value: `${settings.pairsGap}px` },
                                  { key: 'animationType' as keyof ProjectSettings, labelId: 'Tipe Animasi', labelEn: 'Animation Type', value: settings.activePreset !== 'default' ? `${settings.animationType} (${settings.activePreset})` : settings.animationType },
                                  { key: 'showNoise' as keyof ProjectSettings, labelId: 'Film Grain', labelEn: 'Film Grain Overlay', value: settings.showNoise ? 'ON' : 'OFF' },
                                  { key: 'showScanlines' as keyof ProjectSettings, labelId: 'Scanlines', labelEn: 'Scanlines Overlay', value: settings.showScanlines ? 'ON' : 'OFF' },
                                  { key: 'vignette' as keyof ProjectSettings, labelId: 'Vignette', labelEn: 'Vignette Amount', value: settings.vignette },
                                  { key: 'letterSpacing' as keyof ProjectSettings, labelId: 'Jarak Huruf', labelEn: 'Letter Spacing', value: `${settings.letterSpacing}px` },
                                ];

                                const modifiedFeaturesList = selectiveFeaturesList.filter(f => settings[f.key] !== originalSettings[f.key]);

                                if (modifiedFeaturesList.length === 0) {
                                  return (
                                    <div className="py-8 text-center text-zinc-500 text-[10px] leading-relaxed uppercase font-sans">
                                      {lang === 'id' 
                                        ? 'Semua konfigurasi sesuai bawaan asli.' 
                                        : 'All configurations match baseline defaults.'}
                                    </div>
                                  );
                                }

                                return modifiedFeaturesList.map((feature, i) => (
                                  <div 
                                    key={i}
                                    className="p-2 bg-black border border-white/5 flex items-center justify-between font-sans"
                                  >
                                    <div className="flex flex-col pr-2">
                                      <span className="font-extrabold tracking-wider text-[10px] text-zinc-300">
                                        {lang === 'id' ? feature.labelId : feature.labelEn}
                                      </span>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        {feature.isColor && (
                                          <div 
                                            className="w-2.5 h-2.5 border border-white/20 rounded-full animate-none" 
                                            style={{ backgroundColor: String(feature.value) }} 
                                          />
                                        )}
                                        <span className="text-[9px] text-zinc-500 font-mono">
                                          {String(feature.value)}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        resetSelectiveFeature(feature.key);
                                      }}
                                      className="p-1.5 border border-white/10 hover:border-white hover:bg-white hover:text-black transition-all rounded-none cursor-pointer"
                                      title={lang === 'id' ? `Kembalikan ${feature.labelId}` : `Reset ${feature.labelEn}`}
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                    </button>
                                  </div>
                                ));
                              })()}
                            </div>
                          )}

                          {/* Footer details */}
                          <div className="mt-3 border-t border-white/10 pt-2 flex justify-between items-center text-[8px] text-zinc-500 uppercase tracking-widest font-mono">
                            <span>{lang === 'id' ? `TOTAL: ${history.length} LANGKAH` : `TOTAL: ${history.length} STEPS`}</span>
                            <span>{lang === 'id' ? `POSISI: KE-${historyIndex + 1}` : `ACTIVE: #${historyIndex + 1}`}</span>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                    if (isHistoryOpen) setIsHistoryOpen(false);
                  }}
                  className={cn(
                    "p-2 md:p-3 border border-white transition-all rounded-none flex items-center justify-center",
                    isMenuOpen ? "bg-white text-black" : "hover:bg-white hover:text-black cursor-pointer"
                  )}
                >
                  <Menu2Lines className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </header>

            {/* Sidebar Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  key="workspace-drawer-menu"
                  initial={{ opacity: 0, clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' }}
                  animate={{ opacity: 1, clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-0 z-[12000] bg-black/98 backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-24"
                >
                  {/* Top glowing laser line during opening */}
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-800 via-white to-zinc-800 origin-left"
                  />

                  {/* Tech-brutalist grid background behind the menu */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                  
                  {/* Header Area */}
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10 shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-[0.25em]">
                        {translations[lang].editor.projectOptions.toUpperCase()}
                      </span>
                    </div>
                    <button 
                      onClick={() => setIsMenuOpen(false)} 
                      className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-white/10 hover:border-white hover:bg-white hover:text-black transition-all duration-200 cursor-pointer text-white"
                    >
                      <X size={18} />
                    </button>
                  </motion.div>

                  {/* Nav Links Container */}
                  <div className="flex-1 flex flex-col justify-center py-8 relative z-10">
                    <div className="space-y-4 sm:space-y-6 max-w-md w-full mx-auto">
                      
                      {/* 01 // BERANDA */}
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="border-b border-white/5 pb-2"
                      >
                        <button
                          onClick={() => {
                            if (view === 'editor') {
                              // User requested to "refresh" the page when returning from workspace to home to ensure clean state
                              window.location.href = window.location.origin;
                              return;
                            }
                            
                            setIsMenuOpen(false);
                            window.scrollTo(0, 0);
                            setActiveSection('home');
                            
                            setTimeout(() => {
                              window.scrollTo(0, 0);
                              ScrollTrigger.refresh();
                              setActiveSection('home');
                            }, 100);
                          }}
                          className="w-full text-left font-black tracking-widest uppercase transition-all duration-300 py-3 sm:py-4 flex items-center justify-between bg-transparent text-white border-none cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="font-mono text-[9px] sm:text-[10px] text-zinc-600">01 //</span>
                            <span className="text-base sm:text-lg md:text-xl lg:text-2xl tracking-[0.25em] group-hover:text-zinc-300 transition-colors">
                              {lang === 'id' ? "BERANDA" : "HOME"}
                            </span>
                          </div>
                          <div className="text-zinc-500 group-hover:text-white transition-colors">
                             <ArrowUpRight size={18} className="rotate-45 sm:scale-125" />
                          </div>
                        </button>
                      </motion.div>

                      {/* 02 // FITUR CHANGE PROJECT NAME */}
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.22, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="border-b border-white/5 pb-4"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 py-3">
                          <span className="font-mono text-[9px] sm:text-[10px] text-zinc-600">02 //</span>
                          <span className="font-black tracking-widest text-base sm:text-lg md:text-xl lg:text-2xl text-white uppercase tracking-[0.25em]">
                            {translations[lang].editor.projectName}
                          </span>
                        </div>
                        <div className="pl-6 sm:pl-8">
                          <div className="relative overflow-hidden max-w-sm flex items-center gap-2">
                            <input 
                              type="text" 
                              value={projectName}
                              onChange={(e) => setProjectName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setShowSaveToast(true);
                                  setTimeout(() => setShowSaveToast(false), 1500);
                                  // Add logic to save to localStorage
                                  localStorage.setItem('daftarkru_projectName', projectName);
                                }
                              }}
                              className="flex-1 bg-zinc-950 border border-white/10 p-3 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-white transition-all rounded-none uppercase"
                              placeholder="PROJECT_MASTER"
                            />
                            {projectName !== initialProjectName && (
                              <button
                                type="button"
                                onClick={() => {
                                  setInitialProjectName(projectName);
                                  setShowSaveToast(true);
                                  setTimeout(() => setShowSaveToast(false), 1500);
                                  // Add logic to save to localStorage
                                  localStorage.setItem('daftarkru_projectName', projectName);
                                }}
                                className="h-[46px] w-[46px] bg-white text-black border border-white hover:bg-zinc-200 transition-all flex items-center justify-center cursor-pointer rounded-none active:scale-95 shrink-0"
                                title={lang === 'id' ? "Simpan nama proyek" : "Save project name"}
                              >
                                <Check className="w-5 h-5" />
                              </button>
                            )}

                            {/* Inline sliding block covering the inputs */}
                            <AnimatePresence>
                              {showSaveToast && (
                                <motion.div
                                  initial={{ x: "-100%" }}
                                  animate={{ x: 0 }}
                                  exit={{ x: "100%" }}
                                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                  className="absolute inset-0 bg-white text-black flex items-center justify-center font-mono font-black text-[10px] sm:text-xs tracking-widest uppercase z-10 px-4 whitespace-nowrap"
                                >
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.15, duration: 0.3 }}
                                    className="flex items-center gap-2"
                                  >
                                  <Check className="w-4 h-4 block shrink-0" />
                                  <span>{lang === 'id' ? "NAMA PROYEK DISIMPAN" : "PROJECT NAME SAVED"}</span>
                                  </motion.div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>

                      {/* 03 // KEYBOARD SHORTCUTS */}
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.29, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="border-b border-white/5"
                      >
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsShortcutsOpen(true);
                          }}
                          className="w-full text-left font-black tracking-widest uppercase transition-all duration-300 py-3 sm:py-4 flex items-center justify-between bg-transparent text-white border-none cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="font-mono text-[9px] sm:text-[10px] text-zinc-600">03 //</span>
                            <span className="text-base sm:text-lg md:text-xl lg:text-2xl tracking-[0.25em] text-zinc-400 group-hover:text-white transition-colors">
                              {lang === 'id' ? "PINTASAN KEYBOARD" : "KEYBOARD SHORTCUTS"}
                            </span>
                          </div>
                          <div className="w-1.5 h-1.5 bg-white/0 group-hover:bg-white/20 transition-all shrink-0" />
                        </button>
                      </motion.div>

                    </div>
                  </div>

                  {/* Language Selection inside Drawer Menu */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.36, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="border-t border-white/10 pt-6 relative z-10 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-md w-full mx-auto pb-6"
                  >
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{translations[lang].nav.selectLanguage}</span>
                    <div className="flex gap-2 w-full sm:w-auto">
                      {(['id', 'en'] as Lang[]).map((l) => (
                        <button
                          key={l}
                          onClick={() => setLang(l)}
                          className={cn(
                            "flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-bold text-center uppercase tracking-widest transition-all cursor-pointer border",
                            lang === l 
                              ? "bg-white border-white text-black font-black" 
                              : "bg-zinc-950/20 border-white/10 text-zinc-400 hover:text-white hover:border-white"
                          )}
                        >
                          {l.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </motion.div>

                  {/* SAVING INDICATOR INTEGRATED IN MENU */}
                  <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} lang={lang} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Change Name Modal before Export */}
            <AnimatePresence>
              {isChangeNameModalOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsChangeNameModalOpen(false)}
                    className="fixed inset-0 bg-black/95 backdrop-blur-md z-[2000] cursor-pointer"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    transition={{ type: "spring", damping: 25, stiffness: 350 }}
                    className="fixed inset-x-4 top-[15%] sm:top-1/2 sm:-translate-y-1/2 mx-auto max-w-md bg-black border-2 border-white/40 z-[2001] p-6 sm:p-8 flex flex-col shadow-[12px_12px_0px_rgba(255,255,255,0.05)] overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-white rounded-none animate-pulse" />
                        <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-white">
                          {lang === 'id' ? "NAMA FILE EKSPOR" : "EXPORT FILE NAME"}
                        </h3>
                      </div>
                      <button 
                        onClick={() => setIsChangeNameModalOpen(false)} 
                        className="px-3 py-1.5 text-[9px] sm:text-[10px] font-bold border border-white/10 hover:border-white text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer uppercase font-mono bg-zinc-950"
                      >
                        CLOSE
                      </button>
                    </div>

                    {/* Looping Ambient Line mirroring FAQ line style */}
                    <div className="w-full h-[1.5px] bg-zinc-900/60 overflow-hidden relative mb-6">
                      <motion.div 
                        className="h-full w-full bg-gradient-to-r from-zinc-800 via-white to-zinc-800"
                        animate={{ 
                          scaleX: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: [0.16, 1, 0.3, 1],
                          times: [0, 0.5, 1]
                        }}
                        style={{ originX: 0 }}
                      />
                    </div>

                    {/* Form elements */}
                    <div className="space-y-4">
                      <p className="text-[11px] sm:text-xs text-zinc-400 font-medium leading-relaxed">
                        {lang === 'id' 
                          ? "Silahkan tentukan atau ubah nama proyek sebelum memulai proses ekspor."
                          : "Please set or modify the project name before initiating the export."}
                      </p>

                      <div className="relative w-full overflow-hidden bg-zinc-950 border border-white/20 flex items-center transition-all focus-within:border-white">
                        <input 
                          type="text" 
                          value={tempProjectName}
                          onChange={(e) => setTempProjectName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const trimmedName = tempProjectName.trim();
                              const finalName = trimmedName !== '' ? trimmedName : 'UNTITLED_PROJECT';
                              setProjectName(finalName);
                              localStorage.setItem('daftarkru_projectName', finalName);
                              setIsChangeNameModalOpen(false);
                              setTimeout(() => {
                                recordVideo();
                              }, 100);
                            }
                          }}
                          className="w-full bg-transparent p-4 text-xs sm:text-sm font-mono text-white focus:outline-none uppercase tracking-wide"
                          placeholder="PROJECT_MASTER"
                          autoFocus
                        />
                        <AnimatePresence>
                          {tempProjectName !== projectName && (
                            <motion.button
                              initial={{ width: 0, opacity: 0 }}
                              animate={{ width: 52, opacity: 1 }}
                              exit={{ width: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                              type="button"
                              onClick={() => {
                                const trimmedName = tempProjectName.trim();
                                const finalName = trimmedName !== '' ? trimmedName : 'UNTITLED_PROJECT';
                                setProjectName(finalName);
                                localStorage.setItem('daftarkru_projectName', finalName);
                                setShowSaveToast(true);
                                setTimeout(() => setShowSaveToast(false), 1500);
                              }}
                              className="h-[52px] w-[52px] bg-white text-black hover:bg-zinc-200 transition-all flex items-center justify-center cursor-pointer rounded-none active:scale-95 shrink-0 overflow-hidden"
                              title={lang === 'id' ? "Simpan nama" : "Save name"}
                            >
                              <Check className="w-5 h-5" />
                            </motion.button>
                          )}
                        </AnimatePresence>
                        
                        <AnimatePresence>
                          {showSaveToast && (
                            <motion.div
                              initial={{ x: "-100%" }}
                              animate={{ x: 0 }}
                              exit={{ x: "100%" }}
                              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                              className="absolute inset-0 bg-white text-black flex items-center justify-center gap-2 font-mono font-black text-[10px] sm:text-xs tracking-widest uppercase z-10 px-4 whitespace-nowrap"
                            >
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                              {lang === 'id' ? "NAMA TERSIMPAN" : "NAME SAVED"}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-8 flex gap-3">
                      <button
                        onClick={() => setIsChangeNameModalOpen(false)}
                        className="flex-1 px-4 py-3 border border-white/10 text-zinc-400 hover:text-white hover:border-white text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all rounded-none bg-transparent active:scale-[0.98]"
                      >
                        {lang === 'id' ? "BATAL" : "CANCEL"}
                      </button>
                      <button
                        onClick={() => {
                          const trimmedName = tempProjectName.trim();
                          const finalName = trimmedName !== '' ? trimmedName : 'UNTITLED_PROJECT';
                          setProjectName(finalName);
                          localStorage.setItem('daftarkru_projectName', finalName);
                          setIsChangeNameModalOpen(false);
                          setTimeout(() => {
                            recordVideo();
                          }, 100);
                        }}
                        className="group relative flex-1 px-4 py-3 bg-white text-black font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[0.98] active:scale-95 border border-white shadow-[4px_4px_0px_rgba(255,255,255,0.15)] hover:shadow-[8px_8px_0px_rgba(255,255,255,0.25)]"
                      >
                        <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16, 1, 0.3, 1]" />
                        <span className="relative z-10 text-[10px] sm:text-xs group-hover:text-white transition-colors duration-300">
                          {lang === 'id' ? "RENDER" : "RENDER"}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Keyboard Shortcuts Cheat Sheet Modal */}
            <AnimatePresence>
              {isShortcutsOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsShortcutsOpen(false)}
                    className="fixed inset-0 bg-black/95 backdrop-blur-md z-[2000] cursor-pointer"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    transition={{ type: "spring", damping: 25, stiffness: 350 }}
                    className="fixed inset-x-4 top-[8%] sm:top-1/2 -sm:translate-y-0 sm:-translate-y-1/2 mx-auto max-w-xl bg-black border border-white z-[2001] p-6 sm:p-8 flex flex-col shadow-[12px_12px_0px_rgba(255,255,255,0.05)] overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-white">
                          {lang === 'id' ? "PINTASAN KEYBOARD //" : "KEYBOARD SHORTCUTS //"}
                        </h3>
                      </div>
                      <button 
                        onClick={() => setIsShortcutsOpen(false)} 
                        className="px-3 py-1.5 text-[9px] sm:text-[10px] font-bold border border-white/10 hover:border-white text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer uppercase font-mono bg-zinc-950"
                      >
                        ESC / CLOSE
                      </button>
                    </div>

                    {/* Shortcuts Grid/List */}
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-none">
                      {[
                        { key: "Space", desc: lang === 'id' ? "Putar / Jeda Pratinjau Kredit" : "Play / Pause Credits Preview" },
                        { key: "Q", desc: lang === 'id' ? "Sembunyikan / Tampilkan Input Kredit (Kiri)" : "Toggle Credit Input Sidebar (Left)" },
                        { key: "E", desc: lang === 'id' ? "Sembunyikan / Tampilkan Kontrol Fine-Tuning (Kanan)" : "Toggle Fine-Tuning Sidebar (Right)" },
                        { key: "S", desc: lang === 'id' ? "Sembunyikan / Tampilkan Konsol Desainer (Bawah)" : "Toggle Designer Console (Bottom)" },
                        { key: "1 - 5", desc: lang === 'id' ? "Buka Menu Pilihan Desain (Font, Gerak, Tampilan, Backdrop, Preset)" : "Open Submenus (Font, Motion, Appearance, Backdrop, Presets)" },
                        { key: "ESC", desc: lang === 'id' ? "Tutup Popover / Menu Desain Aktif" : "Close Active Submenu Dialog" },
                        { key: "← / →", desc: lang === 'id' ? "Navigasi Frame / Lompati Detik Video" : "Skip Seconds / Frame Navigation" },
                        { key: "Ctrl + S", desc: lang === 'id' ? "Inisiasi Render & Unduh File Hasil" : "Trigger Render & Export Download" },
                        { key: "Ctrl + Z", desc: lang === 'id' ? "Batal Tindakan Terakhir (Undo)" : "Undo Last Action" },
                        { key: "? / H", desc: lang === 'id' ? "Sembunyikan / Tampilkan Cheat Sheet Ini" : "Toggle This Cheat Sheet" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2.5 border-b border-white/[0.03] group hover:bg-white/[0.02] px-2 transition-colors">
                          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium group-hover:text-zinc-200 transition-colors uppercase tracking-wider">{item.desc}</span>
                          <kbd className="min-w-[44px] text-center font-mono text-[9px] sm:text-[10px] font-bold text-white bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 shadow-[2px_2px_0px_rgba(255,255,255,0.1)] uppercase select-none shrink-0 ml-4">
                            {item.key}
                          </kbd>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase">
                      <span>DAFTARKRU ENGINE v1.12 //</span>
                      <span>PRESS "?" OR "H" TO TOGGLE</span>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden relative">
              {/* Export Overlay */}
              <AnimatePresence>
                {isExporting && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] bg-[#020202] flex flex-col items-center justify-center p-6 sm:p-12 select-none"
                  >
                    <div
                      className="absolute inset-0 pointer-events-none opacity-[0.05]"
                      style={{
                        backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
                        backgroundSize: '80px 80px',
                      }}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 12, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="max-w-md w-full space-y-10 text-center relative z-10"
                    >
                      {/* Top Header Status */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="flex flex-col items-center gap-3 bg-white/[0.03] border border-white/10 py-2.5 px-5 rounded-none relative overflow-hidden min-w-[180px] shadow-[8px_8px_0px_rgba(255,255,255,0.02)]">
                          {/* Animated Looping Line at top */}
                          <div className="absolute top-0 left-0 w-full h-[1.5px] bg-zinc-900/60 overflow-hidden">
                            <motion.div 
                              animate={{ 
                                x: ["-100%", "100%"]
                              }}
                              transition={{ 
                                duration: 2.5, 
                                repeat: Infinity, 
                                ease: "linear"
                              }}
                              className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent"
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="relative flex items-center justify-center">
                              {exportProgress < 100 ? (
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                              ) : (
                                <Check className="w-3.5 h-3.5 text-white" />
                              )}
                            </span>
                            
                            <div className="h-6 flex items-center justify-center overflow-hidden">
                              <AnimatePresence mode="wait">
                                {exportProgress < 100 ? (
                                  <motion.span
                                    key={exportProgress >= 80 ? 'finishing' : renderingTextIndex}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-[9px] font-black font-mono text-white tracking-[0.35em] uppercase whitespace-nowrap"
                                  >
                                    {exportProgress >= 80 ? (lang === 'id' ? "MENYEMPURNAKAN HASIL" : "FINALIZING RESULT") : RENDERING_TEXTS[renderingTextIndex]}
                                  </motion.span>
                                ) : (
                                  <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[9px] font-black font-mono text-white tracking-[0.35em] uppercase"
                                  >
                                    {lang === 'id' ? "PROSES SELESAI" : "PROCESS COMPLETED"}
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Giant Clean Progress Numbers */}
                      <div className="space-y-2">
                        <div className="text-7xl sm:text-8xl font-black font-sans tracking-tighter text-white tabular-nums leading-none">
                          {exportProgress}%
                        </div>
                        <div className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed font-sans max-w-sm mx-auto">
                          {lang === 'id' ? "Membuat frame video untuk" : "Generating video frames for"}{" "}
                          <span className="text-white font-semibold">{projectName}</span>
                        </div>
                      </div>

                      {/* Smooth Slider Line */}
                      <div className="space-y-3">
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                          <motion.div 
                            className="absolute inset-y-0 left-0 bg-white"
                            animate={{ width: `${exportProgress}%` }}
                            transition={{ type: "spring", bounce: 0, duration: 0.8 }}
                          >
                            <motion.div 
                              animate={{ 
                                opacity: [0.3, 1, 0.3],
                                scaleX: [1, 1.2, 1],
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                ease: "easeInOut"
                              }}
                              className="absolute inset-0 bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                            />
                            <motion.div 
                              animate={{ 
                                x: ["-100%", "200%"]
                              }}
                              transition={{ 
                                duration: 3, 
                                repeat: Infinity, 
                                ease: "linear"
                              }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full"
                            />
                          </motion.div>
                        </div>
                        
                        {/* Extra Status details in sentence case */}
                        <div className="flex justify-between items-center text-[10px] sm:text-xs text-zinc-500 font-mono">
                          <span>
                            {exportProgress >= 100 
                              ? (lang === 'id' ? "Menyimpan file..." : "Saving file...") 
                              : (lang === 'id' ? "Sedang memproses..." : "Processing...")
                            }
                          </span>
                          <span>
                            {Math.min(240, Math.floor(exportProgress * 2.4))} / 240 frames
                          </span>
                        </div>
                      </div>

                      {/* Technical details in a calm, flat grid */}
                      <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-4 text-center text-[10px] sm:text-[11px] font-sans">
                        <div className="space-y-1">
                          <div className="text-zinc-600 font-bold uppercase tracking-wider text-[8px] sm:text-[9px]">Format</div>
                          <div className="text-zinc-300 font-semibold">WebM / VP9</div>
                        </div>
                        <div className="space-y-1 border-x border-white/5">
                          <div className="text-zinc-600 font-bold uppercase tracking-wider text-[8px] sm:text-[9px]">Resolusi</div>
                          <div className="text-zinc-300 font-semibold">FHD 1080p</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-zinc-600 font-bold uppercase tracking-wider text-[8px] sm:text-[9px]">Status</div>
                          <div className="text-zinc-300 font-semibold">Optimized</div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls Column (Left) */}
              <motion.aside 
                animate={isDesktop ? { 
                  width: isSidebarCollapsed ? 32 : 420
                } : { width: '100%' }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full lg:w-[420px] border-b lg:border-b-0 lg:border-r border-white lg:overflow-y-auto lg:scrollbar-hide bg-black order-2 lg:order-1 flex-shrink-0 relative overflow-hidden group/sidebar flex flex-row-reverse"
              >
                {/* Sidebar Toggle Button (Desktop only) */}
                <button 
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex sticky top-8 mt-8 mb-auto h-16 w-8 bg-[#111111] border border-white/10 hover:bg-white hover:text-black transition-all items-center justify-center z-[250] group/toggle cursor-pointer shrink-0 rounded-none hover:pr-1"
                  title={isSidebarCollapsed ? (lang === 'id' ? "Buka Sidebar (Q)" : "Expand Sidebar (Q)") : (lang === 'id' ? "Tutup Sidebar (Q)" : "Collapse Sidebar (Q)")}
                >
                  {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <div className={cn(
                  "flex-1 p-5 lg:p-10 space-y-12 transition-opacity duration-300 min-w-0 lg:min-w-[350px]",
                  isSidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                )}>
                  {/* Management Section */}
                  <div className="space-y-6 credit-input">
                  <div className="flex items-center justify-between border-b border-white pb-3">
                    <h2 className="text-[11px] lg:text-[13px] font-bold uppercase tracking-[0.4em]">{translations[lang].editor.creditInput}</h2>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder={translations[lang].editor.rolePlaceholder}
                      className="w-full bg-black border border-white p-4 lg:p-5 text-xs lg:text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-white rounded-none placeholder:text-zinc-700 font-mono transition-colors hover:border-white/40"
                    />
                    <textarea 
                      value={newNames}
                      onChange={(e) => setNewNames(e.target.value)}
                      placeholder={translations[lang].editor.namesPlaceholder}
                      className="w-full h-32 lg:h-40 bg-black border border-white p-4 lg:p-5 text-xs lg:text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-white rounded-none resize-none placeholder:text-zinc-700 font-mono transition-colors hover:border-white/40"
                    />

                    <button 
                      onClick={addRole}
                      disabled={!newRole.trim() || !newNames.trim()}
                      className={cn(
                        "relative w-full h-16 lg:h-20 border border-white flex items-center justify-center overflow-hidden transition-all duration-300 ease-out disabled:opacity-20 rounded-none group cursor-pointer",
                        editingId ? "bg-white" : "bg-zinc-950"
                      )}
                    >
                      <div className={cn(
                        "absolute inset-0 transition-transform duration-500 ease-[0.16,1,0.3,1]",
                        editingId 
                          ? "bg-black translate-y-full group-hover:translate-y-0" 
                          : "bg-white translate-y-full group-hover:translate-y-0"
                      )} />
                      <div className={cn(
                        "relative z-10 transition-colors duration-300 flex items-center justify-center w-full h-full",
                        editingId 
                          ? "text-black group-hover:text-white" 
                          : "text-white group-hover:text-black"
                      )}>
                        {editingId ? <Check className="w-8 h-8" /> : <Plus className="w-8 h-8 transition-transform group-hover:rotate-90" />}
                      </div>
                    </button>
                    {editingId && (
                      <button 
                        onClick={cancelEdit}
                        className="relative w-full border border-white/20 text-white p-4 lg:p-5 text-[10px] lg:text-[11px] font-bold uppercase tracking-widest overflow-hidden transition-all duration-300 ease-out font-mono cursor-pointer group"
                      >
                        <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
                        <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                          {translations[lang].editor.cancelEditing}
                        </span>
                      </button>
                    )}
                  </div>
                </div>


                {/* Tape List Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white pb-3">
                    <h2 className="text-[11px] lg:text-[13px] font-bold uppercase tracking-[0.4em]">{translations[lang].editor.tapeList}</h2>
                    <div className="flex gap-4">
                      {selectedIds.size > 0 && (
                        <button 
                          onClick={bulkDelete}
                          className="text-[10px] lg:text-[11px] font-bold text-white hover:text-red-500 hover:scale-105 transition-all uppercase tracking-widest flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {translations[lang].editor.delete} ({selectedIds.size})
                        </button>
                      )}
                      <button 
                        onClick={toggleSelectAll}
                        className="text-[10px] lg:text-[12px] font-black hover:text-zinc-400 transition-colors uppercase tracking-[0.15em]"
                      >
                        {selectedIds.size === credits.length && credits.length > 0 ? translations[lang].editor.unselectAll : translations[lang].editor.selectAll}
                      </button>
                    </div>
                  </div>
                  
                  <Reorder.Group 
                    axis="y" 
                    values={credits} 
                    onReorder={(newOrder) => {
                      setCredits(newOrder);
                    }}
                    className={cn("space-y-2 tape-list", isExporting && "hidden")}
                  >
                    {credits.map((item) => (
                      <CreditItem 
                        key={item.id}
                        item={item}
                        selectedIds={selectedIds}
                        toggleSelect={toggleSelect}
                        openSettingsId={openSettingsId}
                        setOpenSettingsId={setOpenSettingsId}
                        startEditing={startEditing}
                        removeRole={removeRole}
                        duplicateTape={duplicateTape}
                        togglePairs={togglePairs}
                        lang={lang}
                      />
                    ))}
                    {credits.length === 0 && (
                      <p className="text-xs sm:text-sm text-zinc-500 tracking-normal text-center py-8 italic font-light">{translations[lang].editor.emptyList}</p>
                    )}
                  </Reorder.Group>
                </div>

                {/* Console Section (Mobile only) */}
                <div className="space-y-12 lg:hidden px-4 md:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-12 lg:gap-24">
                    <div className="space-y-6">
                      <div className="border-b border-white pb-2">
                        <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-white">VISUAL DESIGNER CONSOLE</h2>
                      </div>
                      <ConsoleContent 
                        settings={settings} 
                        setSettings={setSettings} 
                        activeConsole={activeConsole} 
                        setActiveConsole={setActiveConsole}
                        setFadeIndex={setFadeIndex}
                        customFonts={customFonts}
                        lang={lang}
                        onFontUpload={handleFontUpload}
                        onDeleteFont={handleDeleteFont}
                      />
                    </div>

                    <div className="space-y-6">
                      <TuningControls settings={settings} setSettings={setSettings} lang={lang} credits={credits} />
                    </div>
                  </div>

                  {/* Move Export here for Mobile */}
                  <div className="pt-6 border-t border-white/20">
                    <button 
                      onClick={() => initiateExport()}
                      disabled={isExporting}
                      className={cn(
                        "relative w-full bg-white text-black border border-white py-4 text-[12px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 rounded-none transition-all duration-500 ease-[0.16,1,0.3,1] shadow-[8px_8px_0px_rgba(255,255,255,0.05)] overflow-hidden group cursor-pointer",
                        isExporting ? "opacity-40 cursor-not-allowed" : "hover:shadow-[12px_12px_0px_rgba(255,255,255,0.1)]"
                      )}
                    >
                      <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
                      <div className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
                        {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />}
                        {isExporting ? `${translations[lang].editor.rendering} ${exportProgress}%` : translations[lang].editor.renderExport}
                      </div>
                    </button>
                    <div className="mt-2 text-[8px] text-zinc-600 uppercase tracking-widest text-center hidden sm:block">Shortcut: Space (Play/Pause) • Q/E/S (Layout) • 1-5 (Menu) • Arrows (Skip) • Ctrl+S (Export)</div>
                  </div>
                  </div>
                </div>
              </motion.aside>

              {/* Preview & Desktop Console Container */}
              <div className={cn(
                "flex-1 flex flex-col min-w-0 bg-[#050505] order-1 lg:order-2 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] lg:shadow-none border-b border-white/20 lg:border-b-0 backdrop-blur-md",
                activeConsole !== 'none' ? "z-[500]" : "z-[150]"
              )}>
                
                {/* Mobile Preview Control Header (Only below lg) */}
                <div className="flex lg:hidden bg-[#0a0a0a] border-b border-white/10 px-4 py-2.5 items-center justify-between z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                      PREVIEW ({settings.animationType.toUpperCase()})
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPreviewCollapsedMobile(!isPreviewCollapsedMobile)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all cursor-pointer rounded-none text-white bg-transparent"
                  >
                    {isPreviewCollapsedMobile ? (
                      <>
                        <Eye className="w-3" />
                        <span>{lang === 'id' ? 'Tampilkan' : 'Show'}</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3" />
                        <span>{lang === 'id' ? 'Sembunyikan' : 'Hide'}</span>
                      </>
                    )}
                  </button>
                </div>

                <main className={cn(
                  "flex-1 p-2 sm:p-4 lg:p-10 flex flex-col items-center justify-center overflow-hidden relative transition-all duration-300",
                  isPreviewCollapsedMobile ? "hidden lg:flex lg:min-h-0 lg:p-10" : "min-h-[250px] sm:min-h-[300px] lg:min-h-0"
                )}>
                   <div 
                    className={cn(
                      "w-full aspect-video relative border border-white/10 group shadow-[0_0_100px_rgba(255,255,255,0.05)] overflow-hidden bg-black ring-1 ring-white/5 preview-viewport transition-all duration-500",
                      isSidebarCollapsed ? "max-w-[1400px]" : "max-w-[1100px]",
                      isConsoleCollapsed ? "max-h-[75vh] lg:max-h-[90vh]" : "max-h-[75vh]"
                    )}
                    style={{
                      fontSize: `${(previewWidth / DESIGN_BASE_WIDTH) * settings.fontSize}px`
                    }}
                  >

              {/* Viewport Grid Overlay */}
              <div className="absolute inset-x-0 bottom-0 top-6 pointer-events-none grid grid-cols-6 grid-rows-6 opacity-0 lg:group-hover:opacity-10 transition-opacity z-20">
                      {[...Array(36)].map((_, i) => (
                        <div key={i} className="border-[0.5px] border-dashed border-white/20" />
                      ))}
                    </div>


                    {/* Preview Area Tools */}
                    <div className="absolute top-4 right-4 flex gap-2 z-[70] opacity-100 transition-opacity">
                      <button 
                        onClick={() => setIsFullscreen(true)}
                        className="p-2 bg-black/60 backdrop-blur-md border border-white/20 hover:bg-white hover:text-black transition-all flex items-center justify-center cursor-pointer"
                        title="Fullscreen Preview"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Seeker Slider */}
                    {credits.length > 0 && (
                      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 z-[70] bg-black/40 backdrop-blur-md border border-white/10 p-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <button 
                          onClick={() => setIsAutoPlay(!isAutoPlay)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white hover:text-black transition-all rounded-none bg-black/40 border border-white/10"
                        >
                          {isAutoPlay ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>
                        
                        <div className="flex-1 flex flex-col gap-1">
                          <input 
                            type="range"
                            min="0"
                            max={settings.animationType === 'scroll' ? 1000 : Math.max(0, credits.length - 1)}
                            value={settings.animationType === 'scroll' ? fadeIndex : (fadeIndex % Math.max(1, credits.length))}
                            onChange={(e) => {
                              setFadeIndex(parseInt(e.target.value));
                              setIsAutoPlay(false);
                            }}
                            className="w-full h-1 bg-white/20 appearance-none cursor-pointer accent-white hover:accent-zinc-300 transition-all rounded-none"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-[10px] font-mono tabular-nums text-white/60 min-w-[60px] text-center bg-black/40 px-2 py-1 border border-white/5">
                            {settings.animationType === 'scroll' ? `${Math.round((fadeIndex / 1000) * 100)}%` : `${(fadeIndex % credits.length) + 1} / ${credits.length}`}
                          </div>
                          
                          <button 
                            onClick={() => {
                              setFadeIndex(0);
                              setIsAutoPlay(true);
                            }}
                            className="p-1 text-white/40 hover:text-white transition-colors"
                            title="Reset"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div 
                      ref={previewRef}
                      className="absolute inset-0 overflow-hidden flex items-center justify-center"
                    >
                      <div 
                        ref={canvasRef}
                        className="absolute flex-shrink-0 transition-all duration-300"
                        style={{ 
                          width: DESIGN_BASE_WIDTH,
                          height: DESIGN_BASE_HEIGHT,
                          transform: `scale(${previewScale})`,
                          transformOrigin: 'center center',
                          backgroundColor: settings.bgColor,
                        }}
                      >
                      
                        {/* Credits Container */}
                        {/* LUT / Color Filter */}
                        {settings.lut !== 'none' && (
                          <div 
                            className="absolute inset-0 pointer-events-none z-[60]" 
                            style={{ 
                              mixBlendMode: 'overlay',
                              backdropFilter: settings.lut === 'noir' ? 'grayscale(1) contrast(1.2)' :
                                              settings.lut === 'sepia' ? 'sepia(0.8) contrast(1.1)' :
                                              settings.lut === 'cold' ? 'saturate(0.6) hue-rotate(20deg) brightness(0.9) sepia(0.2)' :
                                              settings.lut === 'warm' ? 'saturate(1.4) hue-rotate(-10deg) brightness(1.05)' :
                                              settings.lut === 'mute' ? 'saturate(0.2) contrast(0.9)' : 'none'
                            }} 
                          />
                        )}

                        <div 
                          ref={scrollRef}
                          className={cn(
                            "absolute transition-all ease-linear will-change-transform z-10",
                            settings.animationType !== 'scroll' ? "opacity-0 pointer-events-none" : "",
                            settings.direction
                          )}
                          key={settings.animationType + (isAutoPlay ? 'play' : `pause-${fadeIndex}`)}
                          style={{
                            fontFamily: `'${settings.fontFamily}', sans-serif`,
                            textAlign: 'center',
                            left: `50%`,
                            top: 0,
                            animationName: settings.animationType === 'scroll' ? `scroll-${settings.direction}` : 'none',
                            animationDuration: `${getAnimationTotalDuration()}s`,
                            animationTimingFunction: 'linear',
                            animationIterationCount: 'infinite',
                            animationPlayState: isAutoPlay ? 'running' : 'paused',
                            animationDelay: settings.animationType === 'scroll' && !isAutoPlay ? `-${(fadeIndex / 1000) * getAnimationTotalDuration()}s` : '0s',
                            width: `100%`,
                            maxWidth: `${DESIGN_BASE_WIDTH}px`,
                            transform: `translate(-50%, 900px)`,
                            fontSize: `${settings.fontSize}px`,
                          }}
                        >
                            <div className="flex flex-col pt-0 pb-0" style={{ gap: `${settings.marginBlock}px` }}>
                              {credits.length === 0 ? (
                                <div className="text-center text-white/5 uppercase tracking-[1em] text-[20px] py-40 font-black">{translations[lang].editor.designBase}</div>
                              ) : (
                                <>
                                  {credits.map((item) => (
                                    <div 
                                      key={item.id} 
                                      className="credit-block w-full"
                                    >
                                      {item.isPairs ? (
                                        <div className="flex justify-center items-start">
                                          <div className="flex justify-center items-start" style={{ gap: `${settings.pairsGap}px` }}>
                                            <div className="text-right">
                                              <div 
                                                className="role-text tracking-[0.8em] break-words"
                                                style={{ 
                                                  fontSize: `${settings.roleFontSize}px`,
                                                  color: settings.roleColor,
                                                  opacity: settings.roleOpacity,
                                                  fontWeight: settings.roleBold ? 900 : 500,
                                                  fontStyle: settings.roleItalic ? 'italic' : 'normal',
                                                  letterSpacing: `${settings.letterSpacing}px`,
                                                  textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                                  WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                                  textAlign: 'right',
                                                  paddingTop: `${(settings.lineHeight * settings.fontSize - settings.roleFontSize) / 2}px`
                                                }}
                                              >
                                                {item.role}
                                              </div>
                                            </div>
                                            <div className="text-left">
                                              <div 
                                                className="names-text leading-tight tracking-[0.5em] flex flex-col items-start"
                                                style={{ 
                                                  fontSize: `${settings.fontSize}px`,
                                                  lineHeight: settings.lineHeight,
                                                  gap: `${settings.namesGap}px`,
                                                  color: settings.namesColor,
                                                  opacity: settings.namesOpacity,
                                                  fontWeight: settings.namesBold ? 700 : 500,
                                                  fontStyle: settings.namesItalic ? 'italic' : 'normal',
                                                  letterSpacing: `${settings.letterSpacing}px`,
                                                  textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                                  WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                                  textAlign: 'left',
                                                }}
                                              >
                                                {(item.names || []).map((name, i) => (
                                                  <div 
                                                    key={i} 
                                                    className="break-words text-left" 
                                                  >
                                                    {name}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div 
                                          className="w-full flex flex-col items-center"
                                          style={{ 
                                            textAlign: 'center',
                                            maxWidth: `80%`,
                                            margin: '0 auto'
                                          }}
                                        >
                                          <div 
                                            className="role-text tracking-[0.8em] w-full break-words"
                                            style={{ 
                                              fontSize: `${settings.roleFontSize}px`,
                                              marginBottom: `${settings.roleNameGap}px`,
                                              color: settings.roleColor,
                                              opacity: settings.roleOpacity,
                                              fontWeight: settings.roleBold ? 900 : 500,
                                              fontStyle: settings.roleItalic ? 'italic' : 'normal',
                                              letterSpacing: `${settings.letterSpacing}px`,
                                              textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                              WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                              textAlign: 'center',
                                            }}
                                          >
                                            {item.role}
                                          </div>
                                          <div 
                                            className="names-text leading-tight tracking-[0.5em] w-full flex flex-col items-center"
                                            style={{ 
                                              fontSize: `${settings.fontSize}px`,
                                              lineHeight: settings.lineHeight,
                                              gap: `${settings.namesGap}px`,
                                              color: settings.namesColor,
                                              opacity: settings.namesOpacity,
                                              fontWeight: settings.namesBold ? 700 : 500,
                                              fontStyle: settings.namesItalic ? 'italic' : 'normal',
                                              letterSpacing: `${settings.letterSpacing}px`,
                                              textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                              WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                              textAlign: 'center',
                                            }}
                                          >
                                            {(item.names || []).map((name, i) => (
                                              <div 
                                                key={i} 
                                                className="break-words w-full text-center" 
                                              >
                                                {name}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </>
                              )}
                            </div>
                        </div>
                        
                        {settings.animationType !== 'scroll' && (
                          <div 
                            className="absolute inset-0 flex pointer-events-none items-center justify-center p-20 z-10"
                          >
                            <AnimatePresence mode="wait">
                              {credits.length > 0 && credits[fadeIndex % credits.length] && (
                                <motion.div 
                                  key={credits[fadeIndex % credits.length].id + settings.animationType}
                                  initial={{ 
                                    opacity: 0, 
                                    y: settings.animationType === 'fade' ? 10 : settings.animationType === 'slide' ? 40 : 0,
                                    scale: settings.animationType === 'zoom' ? 0.9 : 1,
                                    filter: settings.animationType === 'blur' ? 'blur(40px)' : 'none'
                                  }}
                                  animate={{ 
                                    opacity: 1, 
                                    y: 0,
                                    scale: 1,
                                    filter: 'blur(0px)',
                                    x: settings.animationType === 'glitch' ? [0, -5, 5, -2, 0] : 0,
                                  }}
                                  exit={{ 
                                    opacity: 0, 
                                    y: settings.animationType === 'fade' ? -10 : settings.animationType === 'slide' ? -40 : 0,
                                    scale: settings.animationType === 'zoom' ? 1.1 : 1,
                                    filter: settings.animationType === 'blur' ? 'blur(40px)' : 'none'
                                  }}
                                  transition={{ 
                                    duration: settings.animationType === 'glitch' ? 0.3 : 1, 
                                    ease: "easeInOut" 
                                  }}
                                  className="flex flex-col items-center w-full"
                                  style={{
                                    fontFamily: `'${settings.fontFamily}', sans-serif`,
                                    textAlign: 'center',
                                    width: `100%`,
                                  }}
                                >
                                  {credits[fadeIndex % credits.length].isPairs ? (
                                    <div className="flex justify-center items-start">
                                      <div className="flex justify-center items-start" style={{ gap: `${settings.pairsGap}px` }}>
                                        <div className="text-right">
                                          <div 
                                            className="role-text tracking-[0.8em] break-words"
                                            style={{ 
                                              fontSize: `${settings.roleFontSize}px`,
                                              color: settings.roleColor,
                                              opacity: settings.roleOpacity,
                                              fontWeight: settings.roleBold ? 900 : 500,
                                              fontStyle: settings.roleItalic ? 'italic' : 'normal',
                                              letterSpacing: `${settings.letterSpacing}px`,
                                              textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                              WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                              textAlign: 'right',
                                              paddingTop: `${(settings.lineHeight * settings.fontSize - settings.roleFontSize) / 2}px`
                                            }}
                                          >
                                            {credits[fadeIndex % credits.length].role}
                                          </div>
                                        </div>
                                        <div className="text-left">
                                          <div 
                                            className="names-text leading-tight tracking-[0.5em] flex flex-col items-start"
                                            style={{ 
                                              fontSize: `${settings.fontSize}px`,
                                              lineHeight: settings.lineHeight,
                                              gap: `${settings.namesGap}px`,
                                              color: settings.namesColor,
                                              opacity: settings.namesOpacity,
                                              fontWeight: settings.namesBold ? 700 : 500,
                                              fontStyle: settings.namesItalic ? 'italic' : 'normal',
                                              letterSpacing: `${settings.letterSpacing}px`,
                                              textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                              WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                              textAlign: 'left',
                                            }}
                                          >
                                            {(credits[fadeIndex % credits.length].names || []).map((name, i) => (
                                              <div 
                                                key={i} 
                                                className="break-words text-left" 
                                              >
                                                {name}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div 
                                      className="flex flex-col items-center"
                                      style={{
                                        width: `100%`,
                                        maxWidth: `80%`,
                                      }}
                                    >
                                      <div 
                                        className="tracking-[0.8em] w-full break-words"
                                        style={{ 
                                          fontSize: `${settings.roleFontSize}px`,
                                          marginBottom: `${settings.roleNameGap}px`,
                                          color: settings.roleColor,
                                          opacity: settings.roleOpacity,
                                          fontWeight: settings.roleBold ? 900 : 500,
                                          fontStyle: settings.roleItalic ? 'italic' : 'normal',
                                          letterSpacing: `${settings.letterSpacing}px`,
                                          textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                          WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                          textAlign: 'center',
                                        }}
                                      >
                                        {credits[fadeIndex % credits.length].role}
                                      </div>
                                      <div 
                                        className="leading-tight tracking-[0.5em] w-full flex flex-col items-center"
                                        style={{ 
                                          fontSize: `${settings.fontSize}px`,
                                          lineHeight: settings.lineHeight,
                                          gap: `${settings.namesGap}px`,
                                          color: settings.namesColor,
                                          opacity: settings.namesOpacity,
                                          fontWeight: settings.namesBold ? 700 : 500,
                                          fontStyle: settings.namesItalic ? 'italic' : 'normal',
                                          letterSpacing: `${settings.letterSpacing}px`,
                                          textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                          WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                          textAlign: 'center',
                                        }}
                                      >
                                        {(credits[fadeIndex % credits.length].names || []).map((name, i) => (
                                          <div 
                                            key={i} 
                                            className="break-words w-full text-center" 
                                          >
                                            {name}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Effects Layer - ensuring they are over everything */}
                        <div className="absolute inset-0 z-[100] pointer-events-none">
                          {settings.showNoise && (
                            <FilmGrainPreview opacity={settings.noiseOpacity} />
                          )}
                          {settings.showScanlines && (
                             <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_2px]" />
                          )}
                          {settings.vignette > 0 && (
                            <div 
                              className="absolute inset-0" 
                              style={{ 
                                background: `radial-gradient(circle, transparent ${100 - settings.vignette * 100}%, rgba(0,0,0,${settings.vignette * 0.95}) 100%)` 
                              }} 
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Corner Markers */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 md:w-4 md:h-4 border-t-2 border-l-2 border-white z-30" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 border-t-2 border-r-2 border-white z-30" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 md:w-4 md:h-4 border-b-2 border-l-2 border-white z-30" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 border-b-2 border-r-2 border-white z-30" />
                  </div>

                  {/* Info Text / Export Warning di bawah Preview */}
                  {showInfo && (
                    <div className="mt-4 w-full max-w-[1400px] bg-white/[0.02] border border-white/10 p-4 sm:p-6 pr-12 sm:pr-16 flex gap-3 items-start relative transition-all duration-300">
                      <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white mt-0.5 flex-shrink-0" />
                      <div className="space-y-1 sm:space-y-2">
                        <div className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-white/40">
                          {lang === 'id' ? 'INFORMASI TAMBAHAN' : 'ADDITIONAL INFORMATION'}
                        </div>
                        <p className="text-[10px] sm:text-[13px] md:text-sm text-zinc-300 font-medium leading-relaxed tracking-normal">
                          {translations[lang].editor.exportWarning}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowInfo(false)}
                        className="absolute top-3 right-3 sm:top-5 sm:right-5 text-white/40 hover:text-white transition-colors cursor-pointer active:scale-90"
                        title={lang === 'id' ? 'Tutup' : 'Close'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </main>

                    {/* Visual Console for Desktop */}
                    <motion.div 
                      animate={{ height: isConsoleCollapsed ? 64 : 'auto' }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        "hidden lg:block border-t border-white bg-black flex-shrink-0 relative z-[200] visual-console",
                        isConsoleCollapsed ? "overflow-hidden" : "overflow-visible"
                      )}
                    >
                      <div className="px-12 py-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black z-10">
                         <h2 className="text-[11px] lg:text-[13px] font-medium uppercase tracking-[0.3em] text-white">VISUAL DESIGNER CONSOLE</h2>
                         <button 
                           onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
                           className="p-2 text-zinc-500 hover:text-white transition-all cursor-pointer hover:bg-white/5 active:scale-95"
                           title={isConsoleCollapsed ? (lang === 'id' ? "Buka Konsol (S)" : "Expand Console (S)") : (lang === 'id' ? "Tutup Konsol (S)" : "Collapse Console (S)")}
                         >
                           {isConsoleCollapsed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                         </button>
                      </div>
                      <div className="px-12 py-10">
                        <ConsoleContent 
                          settings={settings} 
                          setSettings={setSettings} 
                          activeConsole={activeConsole} 
                          setActiveConsole={setActiveConsole}
                          setFadeIndex={setFadeIndex}
                          customFonts={customFonts}
                          lang={lang}
                          onFontUpload={handleFontUpload}
                          onDeleteFont={handleDeleteFont}
                        />

                        {/* Export Button for Desktop */}
                        <div className="mt-10 pt-10 border-t border-white/10 flex justify-end">
                        <button 
                            onClick={() => initiateExport()}
                            disabled={isExporting}
                            title={translations[lang].editor.renderExport}
                            className={cn(
                              "min-w-[240px] bg-white text-black py-4 lg:py-5 text-[11px] lg:text-[13px] font-bold uppercase tracking-[0.3em] rounded-none transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-[12px_12px_0px_rgba(255,255,255,0.1)] active:scale-[0.99] shadow-[8px_8px_0px_rgba(255,255,255,0.05)] render-button",
                              isExporting ? "opacity-40 cursor-not-allowed scale-100 shadow-[8px_8px_0px_rgba(255,255,255,0.05)]" : "hover:bg-zinc-100"
                            )}
                          >
                            {isExporting ? (
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {translations[lang].editor.rendering}
                              </div>
                            ) : (
                              translations[lang].editor.renderExport
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Fine Tuning Panel (Right) */}
                  <motion.aside 
                    animate={{ 
                      width: isRightSidebarCollapsed ? 32 : 420
                    }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden lg:flex border-l border-white lg:overflow-y-auto lg:scrollbar-hide bg-black order-3 flex-shrink-0 relative overflow-hidden group/right-sidebar flex-row"
                  >
                    {/* Right Sidebar Toggle Button */}
                    <button 
                      onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
                      className="hidden lg:flex sticky top-8 mt-8 mb-auto h-16 w-8 bg-[#111111] border border-white/10 hover:bg-white hover:text-black transition-all items-center justify-center z-[250] group/toggle cursor-pointer shrink-0 rounded-none hover:pl-1"
                      title={isRightSidebarCollapsed ? (lang === 'id' ? "Buka Panel Tuning (E)" : "Expand Tuning Panel (E)") : (lang === 'id' ? "Tutup Panel Tuning (E)" : "Collapse Tuning Panel (E)")}
                    >
                      {isRightSidebarCollapsed ? <ChevronLeft className="w-4 h-4 ml-[-2px]" /> : <ChevronRight className="w-4 h-4 ml-[-2px]" />}
                    </button>

                    <div className={cn(
                      "flex-1 p-5 lg:p-10 space-y-12 transition-opacity duration-300 min-w-[388px]",
                      isRightSidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                    )}>
                      <TuningControls settings={settings} setSettings={setSettings} lang={lang} credits={credits} />
                    </div>
                  </motion.aside>
                </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Preview Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-white/10 z-[1010] gap-4">
              <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-zinc-500 truncate">{translations[lang].editor.previewMode}</span>
              </div>
              <button 
                onClick={() => setIsFullscreen(false)}
                className="group relative flex items-center gap-1.5 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 rounded-none bg-black border border-white/20 hover:border-white transition-all duration-500 overflow-hidden shrink-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <X className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.3em] text-zinc-500 group-hover:text-white transition-colors">
                  {translations[lang].editor.exitFullscreen}
                </span>
              </button>
            </div>
            
            <div 
              ref={fullscreenContainerRef}
              className="flex-1 relative overflow-hidden flex items-center justify-center p-0 bg-black"
              style={{
                fontSize: `${(fullscreenWidth / DESIGN_BASE_WIDTH) * settings.fontSize}px`
              }}
            >
              <div 
                className="flex-shrink-0 border border-white/5 bg-black shadow-2xl"
                    style={{ 
                      width: DESIGN_BASE_WIDTH,
                      height: DESIGN_BASE_HEIGHT,
                      transform: `scale(${fullscreenScale})`,
                      transformOrigin: 'center center',
                      backgroundColor: settings.bgColor,
                    }}
                  >
                    {/* Reuse inner preview content */}

                    {/* LUT / Color Filter */}
                    {settings.lut !== 'none' && (
                      <div 
                        className="absolute inset-0 pointer-events-none z-[60]" 
                        style={{ 
                          mixBlendMode: 'overlay',
                          backdropFilter: settings.lut === 'noir' ? 'grayscale(1) contrast(1.2)' :
                                          settings.lut === 'sepia' ? 'sepia(0.8) contrast(1.1)' :
                                          settings.lut === 'cold' ? 'saturate(0.6) hue-rotate(20deg) brightness(0.9) sepia(0.2)' :
                                          settings.lut === 'warm' ? 'saturate(1.4) hue-rotate(-10deg) brightness(1.05)' :
                                          settings.lut === 'mute' ? 'saturate(0.2) contrast(0.9)' : 'none'
                        }} 
                      />
                    )}
                    
                    <div 
                      className={cn(
                        "absolute transition-all ease-linear will-change-transform z-10",
                        settings.animationType !== 'scroll' ? "opacity-0 pointer-events-none" : "",
                        settings.direction
                      )}
                      key={settings.animationType + (isAutoPlay ? 'play' : `pause-${fadeIndex}`)}
                      style={{
                        fontFamily: `'${settings.fontFamily}', sans-serif`,
                        textAlign: 'center',
                        left: `50%`,
                        top: 0,
                        animationName: settings.animationType === 'scroll' ? `scroll-${settings.direction}` : 'none',
                        animationDuration: `${getAnimationTotalDuration()}s`,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        animationPlayState: isAutoPlay ? 'running' : 'paused',
                        animationDelay: settings.animationType === 'scroll' && !isAutoPlay ? `-${(fadeIndex / 1000) * getAnimationTotalDuration()}s` : '0s',
                        width: `100%`,
                        maxWidth: `${DESIGN_BASE_WIDTH}px`,
                        transform: `translate(-50%, 900px)`,
                        fontSize: `${settings.fontSize}px`,
                      }}
                    >
                      <div className="flex flex-col pt-0 pb-0" style={{ gap: `${settings.marginBlock}px` }}>
                        {credits.map((item) => (
                           <div key={item.id} className="credit-block w-full">
                             {item.isPairs ? (
                               <div className="flex justify-center items-start" style={{ gap: `${settings.pairsGap}px` }}>
                                 <div className="text-right">
                                   <div 
                                     className="role-text tracking-[0.8em] w-full break-words"
                                     style={{ 
                                       fontSize: `${settings.roleFontSize}px`,
                                       color: settings.roleColor,
                                       opacity: settings.roleOpacity,
                                       fontWeight: settings.roleBold ? 900 : 500,
                                       fontStyle: settings.roleItalic ? 'italic' : 'normal',
                                       letterSpacing: `${settings.letterSpacing}px`,
                                       textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                       WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                       textAlign: 'right',
                                       paddingTop: `${(settings.lineHeight * settings.fontSize - settings.roleFontSize) / 2}px`
                                     }}
                                   >
                                     {item.role}
                                   </div>
                                 </div>
                                 <div className="text-left">
                                   <div 
                                     className="names-text leading-tight tracking-[0.5em] w-full flex flex-col items-start"
                                     style={{ 
                                       fontSize: `${settings.fontSize}px`,
                                       lineHeight: settings.lineHeight,
                                       gap: `${settings.namesGap}px`,
                                       color: settings.namesColor,
                                       opacity: settings.namesOpacity,
                                       fontWeight: settings.namesBold ? 700 : 500,
                                       fontStyle: settings.namesItalic ? 'italic' : 'normal',
                                       letterSpacing: `${settings.letterSpacing}px`,
                                       textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                       WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                       textAlign: 'left',
                                     }}
                                   >
                                     {(item.names || []).map((name, i) => (
                                       <div 
                                         key={i} 
                                         className="break-words w-full text-left" 
                                       >
                                         {name}
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               </div>
                             ) : (
                               <div className="w-full flex flex-col items-center" style={{ textAlign: 'center', maxWidth: `80%`, margin: '0 auto' }}>
                                 <div 
                                   className="role-text tracking-[0.8em] w-full" 
                                   style={{ 
                                     fontSize: `${settings.roleFontSize}px`, 
                                     marginBottom: `${settings.roleNameGap}px`, 
                                     color: settings.roleColor, 
                                     opacity: settings.roleOpacity, 
                                     fontWeight: settings.roleBold ? 900 : 500, 
                                     fontStyle: settings.roleItalic ? 'italic' : 'normal',
                                     letterSpacing: `${settings.letterSpacing}px`,
                                     textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                     WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                     textAlign: 'center' 
                                   }}
                                 >
                                   {item.role}
                                 </div>
                                 <div 
                                     className="names-text leading-tight tracking-[0.5em] w-full flex flex-col items-center"
                                     style={{ 
                                       fontSize: `${settings.fontSize}px`, 
                                       lineHeight: settings.lineHeight, 
                                       gap: `${settings.namesGap}px`, 
                                       color: settings.namesColor, 
                                       opacity: settings.namesOpacity, 
                                       fontWeight: settings.namesBold ? 700 : 500, 
                                       fontStyle: settings.namesItalic ? 'italic' : 'normal', 
                                       letterSpacing: `${settings.letterSpacing}px`,
                                       textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                       WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                       textAlign: 'center' 
                                     }}>
                                   {(item.names || []).map((name, i) => (
                                     <div 
                                       key={i} 
                                       className="break-words w-full text-center" 
                                     >
                                       {name}
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}
                           </div>
                        ))}
                      </div>
                    </div>

                    {settings.animationType !== 'scroll' && (
                      <div className="absolute inset-0 flex pointer-events-none items-center justify-center p-20 z-10">
                        <AnimatePresence mode="wait">
                          {credits.length > 0 && credits[fadeIndex % credits.length] && (
                            <motion.div 
                              key={credits[fadeIndex % credits.length].id + settings.animationType + "fs"}
                              initial={{ opacity: 0, y: settings.animationType === 'fade' ? 10 : settings.animationType === 'slide' ? 40 : 0, scale: settings.animationType === 'zoom' ? 0.9 : 1, filter: settings.animationType === 'blur' ? 'blur(40px)' : 'none' }}
                              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', x: settings.animationType === 'glitch' ? [0, -5, 5, -2, 0] : 0 }}
                              exit={{ opacity: 0, y: settings.animationType === 'fade' ? -10 : settings.animationType === 'slide' ? -40 : 0, scale: settings.animationType === 'zoom' ? 1.1 : 1, filter: settings.animationType === 'blur' ? 'blur(40px)' : 'none' }}
                              transition={{ duration: settings.animationType === 'glitch' ? 0.3 : 1, ease: "easeInOut" }}
                              className="flex flex-col items-center w-full"
                              style={{ fontFamily: `'${settings.fontFamily}', sans-serif`, textAlign: 'center', width: `100%` }}
                            >
                              {credits[fadeIndex % credits.length].isPairs ? (
                                <>
                                  <div className="flex justify-center items-start" style={{ gap: `${settings.pairsGap}px` }}>
                                    <div className="text-right">
                                      <div 
                                        className="role-text tracking-[0.8em] w-full break-words"
                                        style={{ 
                                          fontSize: `${settings.roleFontSize}px`,
                                          color: settings.roleColor,
                                          opacity: settings.roleOpacity,
                                          fontWeight: settings.roleBold ? 900 : 500,
                                          fontStyle: settings.roleItalic ? 'italic' : 'normal',
                                          letterSpacing: `${settings.letterSpacing}px`,
                                          textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                          WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                          textAlign: 'right',
                                          paddingTop: `${(settings.lineHeight * settings.fontSize - settings.roleFontSize) / 2}px`
                                        }}
                                      >
                                        {credits[fadeIndex % credits.length].role}
                                      </div>
                                    </div>
                                    <div className="text-left">
                                      <div 
                                        className="names-text leading-tight tracking-[0.5em] w-full flex flex-col items-start"
                                        style={{ 
                                          fontSize: `${settings.fontSize}px`,
                                          lineHeight: settings.lineHeight,
                                          gap: `${settings.namesGap}px`,
                                          color: settings.namesColor,
                                          opacity: settings.namesOpacity,
                                          fontWeight: settings.namesBold ? 700 : 500,
                                          fontStyle: settings.namesItalic ? 'italic' : 'normal',
                                          letterSpacing: `${settings.letterSpacing}px`,
                                          textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                          WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                          textAlign: 'left',
                                        }}
                                      >
                                        {(credits[fadeIndex % credits.length].names || []).map((name, i) => (
                                          <div 
                                            key={i} 
                                            className="break-words w-full text-left" 
                                          >
                                            {name}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center" style={{ width: `100%`, maxWidth: `80%` }}>
                                  <div 
                                    className="tracking-[0.8em] w-full" 
                                    style={{ 
                                      fontSize: `${settings.roleFontSize}px`, 
                                      marginBottom: `${settings.roleNameGap}px`, 
                                      color: settings.roleColor, 
                                      opacity: settings.roleOpacity, 
                                      fontWeight: settings.roleBold ? 900 : 500, 
                                      fontStyle: settings.roleItalic ? 'italic' : 'normal',
                                      letterSpacing: `${settings.letterSpacing}px`,
                                      textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                      WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                      textAlign: 'center' 
                                    }}
                                  >
                                    {credits[fadeIndex % credits.length].role}
                                  </div>
                                  <div 
                                      className="leading-tight tracking-[0.5em] w-full flex flex-col items-center"
                                      style={{ 
                                        fontSize: `${settings.fontSize}px`, 
                                        lineHeight: settings.lineHeight, 
                                        gap: `${settings.namesGap}px`, 
                                        color: settings.namesColor, 
                                        opacity: settings.namesOpacity, 
                                        fontWeight: settings.namesBold ? 700 : 500, 
                                        fontStyle: settings.namesItalic ? 'italic' : 'normal', 
                                        letterSpacing: `${settings.letterSpacing}px`,
                                        textShadow: settings.textShadowBlur > 0 ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}${Math.round(settings.textShadowOpacity * 255).toString(16).padStart(2, '0')}` : 'none',
                                        WebkitTextStroke: settings.textOutline ? `${settings.textOutlineWidth}px ${settings.textOutlineColor}` : 'none',
                                        textAlign: 'center' 
                                      }}>
                                      {(credits[fadeIndex % credits.length].names || []).map((name, i) => (
                                        <div 
                                          key={i} 
                                          className="break-words w-full text-center" 
                                        >
                                        {name}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Effects Layer */}
                    <div className="absolute inset-0 z-[100] pointer-events-none">
                      {settings.showNoise && (
                        <FilmGrainPreview opacity={settings.noiseOpacity} />
                      )}
                      {settings.showScanlines && (
                         <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_2px]" />
                      )}
                      {settings.vignette > 0 && (
                        <div 
                          className="absolute inset-0" 
                          style={{ 
                            background: `radial-gradient(circle, transparent ${100 - settings.vignette * 100}%, rgba(0,0,0,${settings.vignette * 0.95}) 100%)` 
                          }} 
                        />
                      )}
                    </div>
                  </div>
               </div>

            {/* Fullscreen Seeker Slider */}
            {credits.length > 0 && (
              <div className="bg-black/80 backdrop-blur-2xl border-t border-white/10 p-4 sm:p-8 flex flex-shrink-0 z-[1010]">
                 <div className="max-w-[1200px] mx-auto w-full flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                   <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                     <button 
                       onClick={() => setIsAutoPlay(!isAutoPlay)}
                       className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center hover:bg-white hover:text-black transition-all rounded-none bg-white/5 border border-white/20 active:scale-95"
                     >
                       {isAutoPlay ? <Pause className="w-6 h-6 sm:w-8 sm:h-8 fill-current" /> : <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1" />}
                     </button>
                     
                     <div className="flex flex-col sm:hidden">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Seek</span>
                        <span className="text-[14px] font-mono tabular-nums text-white">
                            {settings.animationType === 'scroll' ? `${Math.round((fadeIndex / 1000) * 100)}%` : `${(fadeIndex % credits.length) + 1} / ${credits.length}`}
                        </span>
                     </div>

                     <button 
                       onClick={() => {
                         setFadeIndex(0);
                         setIsAutoPlay(true);
                       }}
                       className="p-3 bg-white/5 border border-white/10 rounded-none sm:hidden flex items-center gap-2"
                     >
                       <RotateCcw className="w-4 h-4 text-white/60" />
                       <span className="text-[10px] font-bold uppercase text-zinc-400">Reset</span>
                     </button>
                   </div>
                   
                   <div className="flex-1 flex flex-col gap-3 w-full">
                      <div className="hidden sm:flex justify-between items-center px-1">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Timeline Architecture</span>
                         <span className="text-[12px] font-mono tabular-nums text-white/50 bg-black/40 px-3 py-1 border border-white/5">
                            {settings.animationType === 'scroll' ? `${Math.round((fadeIndex / 1000) * 100)}%` : `${(fadeIndex % credits.length) + 1} / ${credits.length}`}
                         </span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max={settings.animationType === 'scroll' ? 1000 : Math.max(0, credits.length - 1)}
                        value={settings.animationType === 'scroll' ? fadeIndex : (fadeIndex % Math.max(1, credits.length))}
                        onChange={(e) => {
                          setFadeIndex(parseInt(e.target.value));
                          setIsAutoPlay(false);
                        }}
                        className="w-full h-2 sm:h-3 bg-white/10 appearance-none cursor-pointer accent-white hover:accent-zinc-300 transition-all rounded-none"
                      />
                   </div>

                   <button 
                     onClick={() => {
                       setFadeIndex(0);
                       setIsAutoPlay(true);
                     }}
                     className="hidden sm:flex flex-col items-center gap-1 group transition-all hover:scale-110"
                   >
                     <div className="p-3 bg-white/5 border border-white/10 rounded-none group-hover:bg-white group-hover:text-black transition-all">
                       <RotateCcw className="w-5 h-5" />
                     </div>
                     <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-600 mt-1">Replay</span>
                   </button>
                 </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .scanline-effect {
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0) 50%,
            rgba(0, 0, 0, 0.4) 50%
          );
          background-size: 100% 4px;
        }

        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          filter: contrast(150%) brightness(1000%);
          animation: noise-move 0.2s infinite steps(2);
        }

        @keyframes noise-move {
          0% { background-position: 0 0; }
          100% { background-position: 10% 10%; }
        }

        @keyframes scroll-bottomToTop {
          0% { transform: translate(-50%, 900px); }
          100% { transform: translate(-50%, -100%); }
        }

        @keyframes scroll-topToBottom {
          0% { transform: translate(-50%, -100%); }
          100% { transform: translate(-50%, 900px); }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #000;
        }
        ::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 0px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #444;
        }

        input[type="range"] {
          -webkit-appearance: none;
          background: #333;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 8px;
          height: 16px;
          background: white;
          cursor: pointer;
          border-radius: 0;
        }
      `}</style>
    </div>
  );
}
