import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Minus,
  Settings2,
  Film, 
  Loader2,
  Undo2,
  CheckSquare,
  Square,
  Rocket,
  Menu,
  X,
  ChevronRight,
  Home,
  ChevronDown,
  GripVertical,
  Check,
  Maximize,
  Minimize,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Info,
  Upload,
  Columns,
  Trash
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls, useSpring, useTransform, useScroll, useMotionValueEvent } from 'motion/react';
import Lenis from 'lenis';
import { cn } from './lib/utils';
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
  transparentBg: boolean;
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
  lut: string;
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

const translations = {
  id: {
    nav: { home: 'BERANDA', documentation: 'TENTANG', faq: 'FAQ' },
    hero: {
      tag1: "Next Generation Credits Engine",
      tag2: "Sangat mudah digunakan",
      tag3: "Buat credit dengan gratis",
      tag4: "Buat credit dimana pun dan kapanpun",
      description: "Alat Profesional untuk membuat kredit film secara otomatis",
      button: "Mulai Produksi",
      scroll: "SCROLL_UNTUK_EKSPLORASI"
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
    faq: {
      title: "Pusat Bantuan",
      heading: "Pertanyaan\nPopuler",
      subheading: "Semua jawaban yang anda butuhkan untuk memulai produksi kredit film anda hari ini.",
      q1: "Apa itu DaftarKru Engine?",
      a1: "DaftarKru Engine adalah toolkit berbasis web untuk membuat credit film secara otomatis dengan berbagai pilihan desain dan animasi profesional yang siap pakai.",
      q2: "Apakah hasil ekspor bisa transparan?",
      a2: "Ya, kami mendukung ekspor format WEBM dengan channel Alpha (transparan). Anda bisa mengaktifkan mode 'Transparent' pada menu Backdrop sebelum melakukan render.",
      q3: "Berapa resolusi maksimal ekspor?",
      a3: "Standar ekspor kami adalah Full HD (1920x1080) dengan framerate hingga 60 FPS untuk kualitas video yang sangat halus dan tajam.",
      q4: "Bagaimana cara memasukkan banyak nama sekaligus?",
      a4: "Sangat mudah. Anda cukup menyalin (copy) daftar nama dari file dokumen anda, lalu tempel (paste) ke kolom 'Names'. Engine kami akan otomatis memproses setiap baris sebagai satu nama."
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
      colorLut: "Color Mood / LUT",
      filmGrainIntensity: "Intensitas Grain",
      transparent: "Transparan",
      sceneSpeed: "KECEPATAN SCENE",
      scrollModes: "Hanya berpengaruh pada mode non-scroll",
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
    nav: { home: 'HOME', documentation: 'ABOUT', faq: 'FAQ' },
    hero: {
      tag1: "Next Generation Credits Engine",
      tag2: "Extremely easy to use",
      tag3: "Create credits for free",
      tag4: "Create credits anywhere, anytime",
      description: "Professional tool for automated film credits generation",
      button: "Start Production",
      scroll: "SCROLL_TO_EXPLORE"
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
    faq: {
      title: "Support Center",
      heading: "Popular\nQuestions",
      subheading: "All the answers you need to start producing your film credits today.",
      q1: "What is DaftarKru Engine?",
      a1: "DaftarKru Engine is a web-based toolkit for creating film credits automatically with various professional design and animation options ready to use.",
      q2: "Can export results be transparent?",
      a2: "Yes, we support WEBM format export with Alpha channel (transparent). You can activate 'Transparent' mode in the Backdrop menu before rendering.",
      q3: "What is the maximum export resolution?",
      a3: "Our export standard is Full HD (1920x1080) with a framerate of up to 60 FPS for smooth and sharp video quality.",
      q4: "How to input many names at once?",
      a4: "It's very easy. Just copy the list of names from your document, then paste it into the 'Names' column. Our engine will automatically process each line as one name."
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
      colorLut: "Color Mood / LUT",
      filmGrainIntensity: "Grain Intensity",
      transparent: "Transparent",
      sceneSpeed: "SCENE SPEED",
      scrollModes: "Only affects non-scroll modes",
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
  }
};

type Lang = 'id' | 'en';

const TypingDescription = ({ lang }: { lang: Lang }) => {
  const text = translations[lang].hero.description;
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsDeleting(false);
  }, [lang]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (!isDeleting && displayedText.length < text.length) {
      if (text.startsWith(displayedText)) {
        // Typing
        timeout = setTimeout(() => {
          setDisplayedText(text.slice(0, displayedText.length + 1));
        }, 100);
      } else {
        setDisplayedText("");
      }
    } else if (!isDeleting && displayedText.length === text.length) {
      // Pause after typing
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 3000);
    } else if (isDeleting && displayedText.length > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length - 1));
      }, 50);
    } else if (isDeleting && displayedText.length === 0) {
      // Pause after deleting
      setIsDeleting(false);
      timeout = setTimeout(() => {}, 500);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, text]);

  return <span className="inline-block">{displayedText}<span className="inline-block w-1 h-4 bg-white ml-1 animate-pulse" /></span>;
};

const Navbar = ({ lang, setLang, isMobileMenuOpen, setIsMobileMenuOpen }: { lang: Lang, setLang: (l: Lang) => void, isMobileMenuOpen: boolean, setIsMobileMenuOpen: (v: boolean) => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    const diff = latest - previous;
    
    if (latest > 100) {
      if (diff > 10) { // Scrolling down
        setIsHidden(true);
      } else if (diff < -10) { // Scrolling up
        setIsHidden(false);
      }
    } else {
      setIsHidden(false);
    }
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    const handleSection = () => {
      const documentation = document.getElementById('documentation');
      const faq = document.getElementById('faq');
      const scrollPos = window.scrollY;
      
      // If we are at the very top, it's definitely home
      if (scrollPos < 50) {
        setActiveSection('home');
        return;
      }

      // Check sections from bottom up to avoid early activation
      if (faq && scrollPos >= faq.offsetTop - 300) {
        setActiveSection('faq');
      } else if (documentation && scrollPos >= documentation.offsetTop - 300) {
        setActiveSection('documentation');
      } else {
        setActiveSection('home');
      }
    };
    window.addEventListener('scroll', handleSection);
    // Call once to set initial state
    handleSection();
    return () => window.removeEventListener('scroll', handleSection);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    console.log(`Scrolling to ${id}:`, el);
    if (el) {
      console.log(`el.getBoundingClientRect().top: ${el.getBoundingClientRect().top}, window.scrollY: ${window.scrollY}`);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.log(`Could not find element with id: ${id}`);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: isHidden ? -120 : 0, 
          opacity: isHidden ? 0 : 1 
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-6 sm:top-8 left-1/2 -translate-x-1/2 z-[999] p-1 rounded-none border transition-all duration-500 flex items-center gap-1",
          isScrolled 
            ? "bg-black/40 backdrop-blur-2xl border-white/20 f1-shadow" 
            : "bg-black/10 backdrop-blur-md border-white/10"
        )}
      >
        <div className="flex items-center">
          <div className="flex items-center relative px-1 sm:px-2 gap-1 sm:gap-2">
            {['home', 'documentation', 'faq'].map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className={cn(
                  "relative px-3 sm:px-5 py-2 sm:py-2.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest sm:tracking-[0.3em] transition-all duration-500 z-10 text-center block nav-" + item,
                  activeSection === item ? "text-black" : "text-zinc-500 hover:text-white"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  if (item === 'home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    const el = document.getElementById(item);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
              >
                {translations[lang].nav[item as keyof typeof translations.id.nav]}
                {activeSection === item && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-white rounded-none -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </a>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-white/10 mx-1 sm:mx-2" />

          <div className="flex items-center gap-1 px-1 sm:px-2">
            {(['id', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-all rounded-none border",
                  lang === l 
                    ? "bg-white text-black border-white" 
                    : "text-zinc-500 border-transparent hover:text-white"
                )}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center gap-8 md:hidden p-8"
          >
            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-white p-2">
              <X size={24} />
            </button>
            {['home', 'documentation', 'faq'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  item === 'home' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : scrollTo(item);
                }}
                className={cn(
                  "text-2xl font-bold uppercase tracking-[0.2em] transition-all",
                  activeSection === item ? "text-white" : "text-zinc-500 hover:text-white"
                )}
              >
                {translations[lang].nav[item as keyof typeof translations.id.nav]}
              </button>
            ))}
            <div className="flex gap-4">
              {(['id', 'en'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "text-xl font-bold p-4 rounded-none border",
                    lang === l ? "bg-white text-black" : "text-zinc-500 border-white/20"
                  )}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const BackgroundElements = () => {
  const mouseX = useSpring(0, { stiffness: 40, damping: 25 });
  const mouseY = useSpring(0, { stiffness: 40, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#020202]">
      {/* Static Tech Grid - Reduced opacity and simplified */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: 'clamp(40px, 10vw, 80px) clamp(40px, 10vw, 80px)',
        }} 
      />

      {/* Primary Pulsing Glow */}
      <motion.div 
        animate={{ 
          opacity: [0.02, 0.05, 0.02],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-radial-gradient from-white/5 via-transparent to-transparent pointer-events-none"
      />

      {/* Optimized Floating 3D Cubes - Reduced count from 12 to 6 */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`cube-${i}`}
          style={{
            x: useTransform(mouseX, x => x * (40 + i * 15)),
            y: useTransform(mouseY, y => y * (40 + i * 15)),
            left: `${(i * 25) % 90 + 5}%`,
            top: `${(i * 35) % 80 + 10}%`,
          }}
          className="absolute"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.05, 0.1, 0.05],
              rotate: [0, 90],
            }}
            transition={{ 
              duration: 15 + i * 5, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 0.5
            }}
            style={{
              width: `${40 + (i % 2) * 20}px`,
              height: `${40 + (i % 2) * 20}px`,
            }}
            className="border border-white/20 rounded-none bg-white/[0.02] backdrop-blur-[2px]"
          />
        </motion.div>
      ))}

      {/* Simplified Scanning Bar */}
      <motion.div 
        animate={{ 
          y: ["-10%", "110%"],
          opacity: [0, 0.1, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[100px] bg-gradient-to-b from-transparent via-white/[0.05] to-transparent pointer-events-none"
      />
    </div>
  );
};

const Marquee = ({ text, reverse = false, speed = 30 }: { text: string, reverse?: boolean, speed?: number }) => {
  return (
    <div className="w-full overflow-hidden bg-white/5 border-y border-white/10 py-4 sm:py-6 flex whitespace-nowrap rotate-[-1.5deg] z-20 relative backdrop-blur-xl">
      <motion.div
        animate={{ x: reverse ? [0, -1000] : [-1000, 0] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 sm:gap-24 items-center"
      >
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 sm:gap-16">
            <span className="text-4xl sm:text-7xl font-bold uppercase tracking-tighter text-white/10 italic hover:text-white/40 transition-colors cursor-default select-none">
              {text}
            </span>
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 border-white/10" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GsapAnimatedConsole = ({ lang, onPlay }: { lang: Lang, onPlay: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !playheadRef.current || !textRef.current) return;

    let ctx = gsap.context(() => {
      // Timeline scrub animation
      gsap.to(playheadRef.current, {
        x: "0%",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1.5, // Smooth scrubbing
        }
      });

      gsap.fromTo(textRef.current,
        { y: "45%", opacity: 1 },
        {
          y: "-45%", opacity: 1,
          scrollTrigger: {
            trigger: containerRef.current.closest('section'),
            start: "top top",
            end: "+=700%",
            scrub: 1.2,
          }
        }
      );

      // Unified animation for the entire console container
      gsap.fromTo(containerRef.current,
        { y: 100, rotateX: 15, opacity: 0, scale: 0.9 },
        {
          y: 0, rotateX: 0, opacity: 1, scale: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "center center",
            scrub: 1.5,
          }
        }
      );
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex-1 w-full max-w-2xl min-h-[300px] sm:min-h-[500px] relative perspective-[1500px] flex items-center justify-center -mt-[50px] md:-mt-[160px] lg:mt-0 lg:-translate-y-8">
       <div className="relative w-full h-full transform-style-3d flex items-center justify-center">
         
         {/* Preview Screen Mock */}
         <div className="relative w-full aspect-video bg-zinc-950 border border-white/20 shadow-[4px_4px_0px_rgba(255,255,255,0.02)] flex flex-col z-10 overflow-hidden transform-origin-bottom max-w-[100vw] lg:max-w-none scale-[0.85] md:scale-[0.8] lg:scale-100">
            <div className="h-6 sm:h-8 border-b border-white/10 flex items-center px-4 gap-2 bg-black/80 backdrop-blur-sm z-20">
               <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/40" />
               <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/20" />
               <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-black border border-white/20" />
               <div className="text-[5px] sm:text-[8px] font-mono text-zinc-500 tracking-widest ml-4 hidden xs:block uppercase">PREVIEW_RENDER_HQ</div>
            </div>
            
            <div className="flex-1 relative flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] overflow-hidden">
               {/* Animated scrolling text */}
               <div ref={textRef} className="text-center space-y-2 sm:space-y-4 absolute w-full px-4">
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">DIRECTED BY</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">THE CREATOR</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">PRODUCED BY</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">DAFTARKRU ENGINE</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">WRITTEN BY</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">THE ARCHITECT</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">EXECUTIVE PRODUCER</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">DAFTARKRU STUDIO</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">DIRECTOR OF PHOTOGRAPHY</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">OPTICAL FLOW</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">VISUAL EFFECTS</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">PARTICLE LABS</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">EDITOR</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">CHRONOS ENGINE</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">SOUND DESIGN</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">ACOUSTIC CORE</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">MUSIC BY</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">SONIC WAVE</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">CASTING BY</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">PEOPLE ENGINE</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">COSTUME DESIGN</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">STYLE MATRIX</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">ART DIRECTION</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">GRID SYSTEM</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">COLORIST</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">CHROMA CORE</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">PRODUCTION DESIGN</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase pb-4 sm:pb-12">CREATIVE SPACE</p>
                 <h4 className="text-[6px] sm:text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">STUNT COORDINATOR</h4>
                 <p className="text-xs sm:text-2xl font-black text-white tracking-widest uppercase">KINETIC FLOW</p>
               </div>
               
               {/* Film grain / noise overlay */}
               <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]" />
               
               {/* Scanlines element */}
               <div className="absolute inset-0 pointer-events-none opacity-[0.15] bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
               
               <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex gap-1 sm:gap-2 z-20 items-center">
                 <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-zinc-500 animate-pulse" />
                 <div className="text-[5px] sm:text-[8px] font-mono text-zinc-500 tracking-tighter uppercase">REC</div>
               </div>
            </div>
         </div>

         {/* Control Panel Mock */}
         <div className="absolute bottom-[50px] md:bottom-[50px] lg:-bottom-12 left-1/2 -translate-x-1/2 w-[95%] lg:w-[110%] h-24 md:h-40 lg:h-48 bg-zinc-900/90 backdrop-blur-md border border-white/10 shadow-[4px_4px_0px_rgba(255,255,255,0.02)] z-20 flex flex-col rounded sm:rounded-none">
            <div className="h-5 sm:h-8 border-b border-white/5 flex items-center px-3 sm:px-4 justify-between bg-black/40">
               <div className="text-[5px] sm:text-[8px] font-bold tracking-[0.3em] text-white/40 truncate pr-2">VERSION 1.0 DAFTARKRU</div>
               <Settings2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/40" />
            </div>
            <div className="flex-1 p-3 sm:p-6 flex flex-col justify-center gap-2 sm:gap-6">
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-[6px] sm:text-[8px] text-zinc-500 tracking-widest font-mono">
                    <span>00:00:00:00</span>
                    <span className="text-white/60 text-[8px] sm:text-[10px]">SCROLL_VELOCITY</span>
                    <span>00:05:00:00</span>
                 </div>
                 <div className="h-1.5 sm:h-2 w-full bg-black rounded-full overflow-hidden relative shadow-inner">
                   <div ref={playheadRef} className="absolute top-0 left-0 h-full w-full bg-white origin-left -translate-x-full" />
                 </div>
               </div>
               <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1">
                 <div className="bg-black/40 rounded flex flex-col items-center justify-center gap-1 border border-white/5">
                    <span className="text-[6px] sm:text-[8px] text-white/30 uppercase tracking-widest">Developed by</span>
                    <span className="text-[8px] sm:text-[10px] text-white/80 font-bold font-mono">AFGAN AL-FANANY</span>
                 </div>
                 <div className="bg-black/40 rounded flex flex-col items-center justify-center gap-1 border border-white/5 relative overflow-hidden group">
                    <span className="text-[6px] sm:text-[8px] text-white/30 uppercase tracking-widest">FPS</span>
                    <span className="text-[8px] sm:text-[10px] text-white/50 font-bold font-mono group-hover:text-white transition-colors">60.0</span>
                 </div>
                 <div 
                   onClick={onPlay}
                   className="bg-white/5 rounded flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                 >
                    <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white group-hover:scale-110 transition-transform" />
                 </div>
               </div>
            </div>
         </div>

       </div>
    </div>
  )
}

const AboutSection = ({ lang, onStart }: { lang: Lang, onStart: () => void }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [titleVisible, setTitleVisible] = useState(false);
  const titleText = "DAFTARKRU ENGINE";
  const [displayedTitle, setDisplayedTitle] = useState("");

  useEffect(() => {
    if (!sectionRef.current) return;
    
    let ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=700%",
        pin: true,
        scrub: 1.2,
        pinSpacing: true,
      });
    });

    return () => ctx.revert();
  }, []);

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
    <section ref={sectionRef} id="documentation" className="min-h-screen w-full bg-[#050505] flex flex-col lg:flex-row items-center justify-start lg:justify-center p-4 sm:p-12 lg:p-24 gap-0 sm:gap-8 lg:gap-24 relative overflow-hidden border-t border-white/5 pt-12 lg:pt-24">
      <BackgroundElements />

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
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false }}
            className="h-[1px] w-24 bg-white/40 origin-left"
          />
          <h2 className="text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.85] break-words">
            {displayedTitle}
            <span className="inline-block w-1.5 h-8 sm:h-12 lg:h-20 bg-white ml-2 animate-pulse align-middle" />
          </h2>
        </div>
        
        <div className="space-y-4 lg:space-y-6 max-w-xl">
          <p className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-[0.3em] leading-relaxed">
            {translations[lang].about.description}
          </p>
          <div className="grid grid-cols-2 gap-3 lg:gap-8 pt-4 lg:pt-8 mb-[50px] lg:mb-0">
            <div className="space-y-3 lg:space-y-4 p-4 lg:p-8 border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[4px_4px_0px_rgba(255,255,255,0.02)] relative overflow-hidden group hover:bg-white/[0.05] hover:border-white/20 hover:shadow-[8px_8px_0px_rgba(255,255,255,0.05)] transition-all duration-500">
               <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 -rotate-45 translate-x-10 -translate-y-10" />
               <div className="text-xl sm:text-4xl lg:text-5xl font-bold italic tracking-tighter text-white break-words">{translations[lang].about.card1Title}</div>
               <div className="text-[8px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-[0.4em]">{translations[lang].about.card1Desc}</div>
            </div>
            <div className="space-y-3 lg:space-y-4 p-4 lg:p-8 border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[4px_4px_0px_rgba(255,255,255,0.02)] relative overflow-hidden group hover:bg-white/[0.05] hover:border-white/20 hover:shadow-[8px_8px_0px_rgba(255,255,255,0.05)] transition-all duration-500">
               <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 -rotate-45 translate-x-10 -translate-y-10" />
               <div className="text-xl sm:text-4xl lg:text-5xl font-bold italic tracking-tighter text-white break-words">{translations[lang].about.card2Title}</div>
               <div className="text-[8px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-[0.4em]">{translations[lang].about.card2Desc}</div>
            </div>
          </div>
        </div>
      </motion.div>

      <GsapAnimatedConsole lang={lang} onPlay={onStart} />
    </section>
  );
};

interface FAQProps {
  faq: { q: string, a: string };
  index: number;
}

const FAQItem: React.FC<FAQProps & { lang: Lang }> = ({ faq, index, lang }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      className="relative"
    >
      <div className={cn(
        "bg-white/[0.02] border border-white/5 overflow-hidden transition-all duration-500 shadow-[4px_4px_0px_rgba(255,255,255,0.01)]",
        isOpen ? "bg-white/[0.05] border-white/20 shadow-[8px_8px_0px_rgba(255,255,255,0.03)]" : "hover:border-white/10 hover:bg-white/[0.03] hover:shadow-[6px_6px_0px_rgba(255,255,255,0.02)]"
      )}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-6 sm:p-10 flex items-center justify-between text-left transition-all"
        >
          <div className="flex items-center gap-6 sm:gap-10">
            <span className="text-[10px] font-mono opacity-20">0{index + 1}</span>
            <span className="text-[11px] sm:text-[13px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-white transition-colors">{faq.q}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="text-zinc-700"
          >
            <Plus className={cn("w-5 h-5 transition-all", isOpen && "rotate-45")} />
          </motion.div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 sm:px-10 pb-10 pt-4">
                <div className="h-[1px] w-full bg-white/10 mb-8" />
                <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-[0.2em] leading-relaxed max-w-3xl">
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
    { q: translations[lang].faq.q4, a: translations[lang].faq.a4 }
  ];

  return (
    <section id="faq" className="min-h-screen w-full bg-[#020202] flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative overflow-hidden border-t border-white/5">
       <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-white/[0.01] blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
       
       <div className="max-w-7xl w-full flex flex-col lg:grid lg:grid-cols-[1fr_1.5fr] gap-12 sm:gap-20 items-start">
          <div className="lg:sticky lg:top-32 space-y-6 sm:space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              className="text-[9px] font-black tracking-[0.8em] text-white/40 uppercase"
            >
              {translations[lang].faq.title}
            </motion.div>
            <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-none italic whitespace-pre-line">{translations[lang].faq.heading}</h2>
            <p className="text-[10px] sm:text-xs text-zinc-600 uppercase tracking-[0.4em] max-w-sm leading-relaxed">
              {translations[lang].faq.subheading}
            </p>
          </div>

          <div className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} lang={lang} />
            ))}
          </div>
       </div>
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
  precision = 0 
}: { 
  label: string, 
  value: number, 
  onChange: (val: number) => void, 
  min: number, 
  max: number, 
  step?: number, 
  unit?: string,
  precision?: number
}) => {
  const handleDecrement = () => {
    onChange(Math.max(min, Number((value - step).toFixed(precision))));
  };

  const handleIncrement = () => {
    onChange(Math.min(max, Number((value + step).toFixed(precision))));
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase">
        <span className="text-zinc-500 tracking-widest">{label}</span>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDecrement}
            className="w-5 h-5 flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="min-w-[40px] text-center font-mono">{value.toFixed(precision)}{unit}</span>
          <button 
            onClick={handleIncrement}
            className="w-5 h-5 flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-[1px] bg-white accent-white appearance-none cursor-pointer"
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

const TuningControls = React.memo(({ settings, setSettings, lang }: any) => {
  const pxToPercent = (px: number) => ((px / 1920) * 100).toFixed(1);
  const percentToPx = (pct: number) => Number(((pct / 100) * 1920).toFixed(1));

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4 border-b border-white/5 pb-2">
        <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] text-white whitespace-nowrap">{translations[lang].editor.fineTuning}</h3>
         <div className="h-[1px] w-full bg-white/5" />
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
        />
        <SliderWithControls 
          label={translations[lang].editor.letterSpacing}
          value={settings.letterSpacing}
          onChange={(val) => setSettings({...settings, letterSpacing: val})}
          min={-5}
          max={20}
          step={1}
          precision={0}
        />
      </div>
    </div>
  );
});

const CategoryPopover = ({ id, title, children, activeConsole, closeConsole }: { id: string, title: string, children: React.ReactNode, activeConsole: string, closeConsole: () => void }) => (
  <AnimatePresence>
    {activeConsole === id && (
      <div className="fixed sm:absolute inset-x-0 bottom-0 sm:bottom-full sm:left-1/2 sm:-translate-x-1/2 mb-0 sm:mb-2 w-full sm:w-[450px] lg:w-[600px] border-t sm:border border-white/20 bg-zinc-950 z-[10000] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl flex flex-col max-h-[85vh] sm:max-h-[min(600px,80vh)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-zinc-950 z-20 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{title}</span>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeConsole();
            }}
            className="group relative flex items-center justify-center w-10 h-10 rounded-none bg-zinc-900 hover:bg-white border border-white/10 hover:border-white transition-all duration-300 shadow-[2px_2px_0px_rgba(255,255,255,0.05)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <X className="w-4 h-4 text-white group-hover:text-black transition-transform duration-500 group-hover:rotate-180" />
            <div className="absolute inset-0 rounded-none bg-white/5 opacity-0 group-hover:opacity-100 blur-md transition-opacity pointer-events-none" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 space-y-8 overscroll-contain">
          {children}
        </div>
      </div>
    )}
  </AnimatePresence>
);

const ConsoleContent = React.memo(({ settings, setSettings, activeConsole, setActiveConsole, setFadeIndex, customFonts, setCustomFonts, lang, onFontUpload, onDeleteFont }: any) => {
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
          <label className="text-[8px] sm:text-[9px] uppercase font-semibold tracking-[0.2em] text-zinc-600 block">{translations[lang].editor.fontStyle}</label>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveConsole(activeConsole === 'font' ? 'none' : 'font');
              }}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[9px] sm:text-[10px] font-medium uppercase tracking-widest transition-all",
                activeConsole === 'font' ? "bg-white text-black border-white" : "border-white/10 hover:bg-white/5"
              )}
            >
              <span className="truncate">{getDisplayFontName()}</span>
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'font' && "rotate-90")} />
            </button>
            <CategoryPopover id="font" title={translations[lang].editor.fontStyle} activeConsole={activeConsole} closeConsole={closeConsole}>
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
                  <div className="text-center relative z-10">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-white transition-colors">{translations[lang].editor.uploadFont}</span>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-widest mt-2 font-medium">TTF, OTF, WOFF Supported</p>
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
          <label className="text-[8px] sm:text-[9px] uppercase font-semibold tracking-[0.2em] text-zinc-600 block">{translations[lang].editor.motionType}</label>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveConsole(activeConsole === 'anim' ? 'none' : 'anim');
              }}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[9px] sm:text-[10px] font-medium uppercase tracking-widest transition-all",
                activeConsole === 'anim' ? "bg-white text-black border-white" : "border-white/10 hover:bg-white/5"
              )}
            >
              <span className="truncate">{settings.animationType.toUpperCase()}</span>
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'anim' && "rotate-90")} />
            </button>
            <CategoryPopover id="anim" title={translations[lang].editor.motionType} activeConsole={activeConsole} closeConsole={closeConsole}>
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
                    min={1}
                    max={10}
                    step={0.5}
                    precision={1}
                  />
                  <div className="text-[8px] text-zinc-600 text-center uppercase tracking-widest italic">
                    {translations[lang].editor.scrollModes}
                  </div>
                </div>
              </div>
            </CategoryPopover>
          </div>
        </div>

        {/* Visuals */}
        <div className="space-y-2 sm:space-y-3">
          <label className="text-[8px] sm:text-[9px] uppercase font-semibold tracking-[0.2em] text-zinc-600 block">{translations[lang].editor.appearance}</label>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                setActiveConsole(activeConsole === 'color' ? 'none' : 'color');
              }}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[9px] sm:text-[10px] font-medium uppercase tracking-widest transition-all",
                activeConsole === 'color' ? "bg-white text-black border-white" : "border-white/10 hover:bg-white/5"
              )}
            >
              {translations[lang].editor.visuals}
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'color' && "rotate-90")} />
            </button>
            <CategoryPopover id="color" title={translations[lang].editor.visuals} activeConsole={activeConsole} closeConsole={closeConsole}>
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
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setSettings({...settings, showNoise: !settings.showNoise})}
                      className={cn(
                        "p-4 sm:p-6 flex flex-col gap-2 items-center transition-all border",
                        settings.showNoise ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/10 hover:border-white/30"
                      )}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-widest">Film Grain</span>
                      <span className="text-[7px] opacity-40 uppercase tracking-tighter">{settings.showNoise ? 'Active' : 'Off'}</span>
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
                    <button 
                      onClick={() => setSettings({...settings, showScanlines: !settings.showScanlines})}
                      className={cn(
                        "p-4 sm:p-6 flex flex-col gap-2 items-center transition-all border",
                        settings.showScanlines ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/10 hover:border-white/30"
                      )}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-widest">Scanlines</span>
                      <span className="text-[7px] opacity-40 uppercase tracking-tighter">{settings.showScanlines ? 'Active' : 'Off'}</span>
                    </button>
                  </div>
                </div>

                {/* Color Mood / LUT */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">{translations[lang].editor.colorLut}</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'NONE', value: 'none' },
                      { name: 'NOIR', value: 'noir' },
                      { name: 'SEPIA', value: 'sepia' },
                      { name: 'COLD', value: 'cold' },
                      { name: 'WARM', value: 'warm' },
                      { name: 'MUTE', value: 'mute' },
                    ].map((l) => (
                      <button
                        key={l.value}
                        onClick={() => setSettings({...settings, lut: l.value})}
                        className={cn(
                          "py-3 text-[8px] font-bold uppercase tracking-widest border transition-all",
                          settings.lut === l.value ? "bg-white text-black border-white" : "bg-white/5 text-zinc-500 border-white/5 hover:border-white/20"
                        )}
                      >
                        {l.name}
                      </button>
                    ))}
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
          <label className="text-[8px] sm:text-[9px] uppercase font-semibold tracking-[0.2em] text-zinc-600 block">{translations[lang].editor.backdrop}</label>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveConsole(activeConsole === 'bg' ? 'none' : 'bg');
              }}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[9px] sm:text-[10px] font-medium uppercase tracking-widest transition-all",
                activeConsole === 'bg' ? "bg-white text-black border-white" : "border-white/10 hover:bg-white/5"
              )}
            >
              {translations[lang].editor.canvas}
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'bg' && "rotate-90")} />
            </button>
            <CategoryPopover id="bg" title={translations[lang].editor.canvas} activeConsole={activeConsole} closeConsole={closeConsole}>
              <div className="space-y-8">
                <button 
                  onClick={() => setSettings({...settings, transparentBg: !settings.transparentBg})}
                  className={cn(
                    "w-full p-6 flex items-center justify-between transition-all border",
                    settings.transparentBg ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/10"
                  )}
                >
                  <div className="text-left">
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em]">{translations[lang].editor.transparent}</div>
                    <p className="text-[8px] opacity-60 uppercase mt-1">Alpha Channel Background</p>
                  </div>
                  {settings.transparentBg ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 opacity-20" />}
                </button>
                
                <div className={cn("space-y-4 transition-all duration-300", settings.transparentBg ? "opacity-30 grayscale pointer-events-none" : "opacity-100")}>
                  <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Background Color</label>
                  <div className="bg-black border border-white/10 p-4 sm:p-6 flex items-center justify-between gap-4">
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
          <label className="text-[8px] sm:text-[9px] uppercase font-semibold tracking-[0.2em] text-zinc-600 block">{translations[lang].editor.presets}</label>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveConsole(activeConsole === 'preset' ? 'none' : 'preset');
              }}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[9px] sm:text-[10px] font-medium uppercase tracking-widest transition-all",
                activeConsole === 'preset' ? "bg-white text-black border-white" : "border-white/10 hover:bg-white/5"
              )}
            >
              <span className="truncate">
                {settings.activePreset ? (translations[lang].editor[`preset${settings.activePreset.charAt(0).toUpperCase() + settings.activePreset.slice(1)}` as keyof typeof translations.id.editor] || settings.activePreset.toUpperCase()) : "PRESET"}
              </span>
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'preset' && "rotate-90")} />
            </button>
            <CategoryPopover id="preset" title={translations[lang].editor.presets} activeConsole={activeConsole} closeConsole={closeConsole}>
              <div className="grid grid-cols-1 gap-1">
                {Object.keys(PRESETS).map((presetKey) => (
                  <button 
                    key={presetKey}
                    onClick={() => {
                      setSettings({...settings, ...PRESETS[presetKey as keyof typeof PRESETS]});
                      closeConsole();
                    }}
                    className={cn(
                      "w-full text-left px-5 py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all border-b border-white/5 last:border-0",
                      settings.activePreset === presetKey ? "bg-white text-black" : "hover:bg-white hover:text-black opacity-60 hover:opacity-100"
                    )}
                  >
                    {translations[lang].editor[`preset${presetKey.charAt(0).toUpperCase() + presetKey.slice(1)}` as keyof typeof translations.id.editor] || presetKey.toUpperCase()}
                  </button>
                ))}
              </div>
            </CategoryPopover>
          </div>
        </div>
      </div>
    </div>
  );
});

const CreditItem = ({ 
  item, 
  selectedIds, 
  toggleSelect, 
  openSettingsId, 
  setOpenSettingsId, 
  startEditing, 
  removeRole,
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
          "group p-4 border transition-all rounded-none flex items-center justify-between relative overflow-visible",
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
              <div className={cn("text-[9px] font-bold tracking-widest", selectedIds.has(item.id) ? "text-black" : "text-white/40")}>{item.role}</div>
              {item.isPairs && <Columns className={cn("w-3 h-3", selectedIds.has(item.id) ? "text-black/40" : "text-white/20")} />}
            </div>
            <div className="text-[11px] font-medium truncate">{(item.names || []).join(' / ')}</div>
          </div>
        </div>

        <div className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
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
                      className="w-full text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center justify-between text-white border-b border-white/10"
                    >
                      {translations[lang].editor.editTape}
                    </button>

                    <button 
                      onClick={() => {
                        togglePairs(item.id);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest transition-colors flex items-center justify-between border-b border-white/10",
                        item.isPairs ? "bg-white text-black" : "text-white hover:bg-white hover:text-black"
                      )}
                    >
                      {translations[lang].editor.pairsMode}
                      {item.isPairs && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button 
                      onClick={() => {
                        removeRole(item.id);
                        setOpenSettingsId(null);
                      }}
                      className="w-full text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      {translations[lang].editor.deleteTape}
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
};


export default function App() {
  const [view, setView] = useState<View>('hero');

  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('daftarkru_lang');
      const langVal = (saved && saved.trim().toLowerCase() !== 'undefined' ? saved.trim() : 'id') as Lang;
      return (langVal === 'en' || langVal === 'id') ? langVal : 'id';
    } catch (e) {
      return 'id';
    }
  });

  useEffect(() => {
    if (view === 'hero') {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      lenis.on('scroll', ScrollTrigger.update);

      const tickerRaf = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerRaf);

      gsap.ticker.lagSmoothing(0);

      return () => {
        lenis.destroy();
        gsap.ticker.remove(tickerRaf);
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
    } catch (e) {
      return 'UNTITLED_PROJECT';
    }
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [credits, setCredits] = useState<CreditEntry[]>(() => {
    const defaultCredits = [
      { id: '1', role: 'DIRECTOR', names: ['Afgan Al-fanany'] },
      { id: '2', role: 'PRODUCED BY', names: ['Al-fanany', 'Afgan'] },
    ];
    try {
      const saved = localStorage.getItem('daftarkru_credits_v2');
      if (saved && typeof saved === 'string' && 
          saved.trim().toLowerCase() !== 'undefined' && 
          saved.trim().toLowerCase() !== 'null' && 
          saved.trim() !== '') {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : defaultCredits;
        } catch (e) {
          console.error("JSON parse error for credits:", e);
          return defaultCredits;
        }
      }
      return defaultCredits;
    } catch (e) {
      console.error("Failed to parse credits from localStorage:", e);
      return defaultCredits;
    }
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
      transparentBg: false,
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
      lut: 'none',
    };
    try {
      const saved = localStorage.getItem('daftarkru_settings');
      if (saved && typeof saved === 'string' && 
          saved.trim().toLowerCase() !== 'undefined' && 
          saved.trim().toLowerCase() !== 'null' && 
          saved.trim() !== '') {
        try {
          const parsed = JSON.parse(saved);
          return { ...defaultSettings, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
        } catch (e) {
          console.error("JSON parse error for settings:", e);
          return defaultSettings;
        }
      }
      return defaultSettings;
    } catch (e) {
      console.error("Failed to parse settings from localStorage:", e);
      return defaultSettings;
    }
  });

  // History for Undo
  interface HistoryFrame {
    credits: CreditEntry[];
    settings: ProjectSettings;
  }
  const [history, setHistory] = useState<HistoryFrame[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isUndoing = useRef(false);

  // Initialize history after first render to ensure we capture the initial state correctly
  useEffect(() => {
    if (history.length === 0 && credits && settings) {
      try {
        const creditsClone = JSON.parse(JSON.stringify(credits || []));
        const settingsClone = JSON.parse(JSON.stringify(settings || {}));
        setHistory([{ 
          credits: creditsClone, 
          settings: settingsClone 
        }]);
      } catch (e) {
        console.error("Failed to initialize history:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isUndoing.current) {
      isUndoing.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setHistory(prev => {
        if (!prev || prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        if (!last || !credits || !settings) return prev;
        
        try {
          if (JSON.stringify(last.credits) === JSON.stringify(credits) && 
              JSON.stringify(last.settings) === JSON.stringify(settings)) {
            return prev;
          }
          
          const creditsClone = JSON.parse(JSON.stringify(credits || []));
          const settingsClone = JSON.parse(JSON.stringify(settings || {}));
          
          const updated = [...prev, { 
            credits: creditsClone, 
            settings: settingsClone
          }];
          return updated.slice(-50);
        } catch (e) {
          console.error("Failed to update history:", e);
          return prev;
        }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [credits, settings]);

  const undo = () => {
    if (history.length <= 1) return;
    isUndoing.current = true;
    const previous = history[history.length - 2];
    setCredits(previous.credits);
    setSettings(previous.settings);
    setHistory(prev => prev.slice(0, -1));
    setSelectedIds(new Set());
  };

  const [newRole, setNewRole] = useState('');
  const [newNames, setNewNames] = useState('');

  const [activeConsole, setActiveConsole] = useState<'none' | 'color' | 'bg' | 'font' | 'anim'>('none');
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('daftarkru_credits_v2', JSON.stringify(credits));
  }, [credits]);

  useEffect(() => {
    localStorage.setItem('daftarkru_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('daftarkru_projectName', projectName);
  }, [projectName]);

  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [previewScaleValue, setPreviewScale] = useState(1);
  const [fadeIndex, setFadeIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [customFonts, setCustomFonts] = useState<{ name: string, url: string, value: string }[]>(() => {
    try {
      const saved = localStorage.getItem('daftarkru_customFonts');
      if (saved && typeof saved === 'string' &&
          saved.trim().toLowerCase() !== 'undefined' &&
          saved.trim().toLowerCase() !== 'null' &&
          saved.trim() !== '') {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("JSON parse error for custom fonts:", e);
          localStorage.removeItem('daftarkru_customFonts');
        }
      }
    } catch (e) {
      console.error("Failed to load custom fonts:", e);
      localStorage.removeItem('daftarkru_customFonts');
    }
    return [];
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
      console.log("No file selected");
      return;
    }

    console.log("Started font upload process for:", file.name, "size:", (file.size / 1024).toFixed(2), "KB");

    // Filter by type
    if (!file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
      alert("Format font tidak didukung. Gunakan .ttf, .otf, atau .woff");
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
        const progress = (data.loaded / data.total) * 100;
        console.log(`Font upload progress: ${progress.toFixed(2)}%`);
      }
    };

    reader.onload = async (event) => {
      console.log("FileReader finished reading file");
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
        console.log("Attempting to register font:", fontNameValue);
        
        // Use FontFace API for immediate browser recognition if available
        if (typeof FontFace !== 'undefined') {
          try {
            const fontFace = new FontFace(fontNameValue, `url(${result})`);
            await fontFace.load();
            document.fonts.add(fontFace);
            console.log("FontFace API: Font loaded and added successfully");
          } catch (ffErr) {
            console.warn("FontFace API failed, falling back to CSS injection:", ffErr);
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
          console.log("State setCustomFonts updated, new count:", next.length);
          return next;
        });
        
        setSettings((prev: any) => ({ ...prev, fontFamily: fontNameValue }));
        
        alert(`Berhasil! Font "${fontDisplayName}" telah ditambahkan dan diaplikasikan.`);
        console.log("Font successfully added and applied:", fontDisplayName);
      } catch (err) {
        console.error("Critical error during font processing:", err);
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

  // Timer for fade/zoom/blur/slide/glitch in preview
  useEffect(() => {
    if (settings.animationType === 'scroll' || credits.length === 0 || !isAutoPlay) return;

    const interval = setInterval(() => {
      setFadeIndex(prev => (prev + 1) % credits.length);
    }, settings.animationDuration * 1000); 

    return () => clearInterval(interval);
  }, [settings.animationType, settings.animationDuration, credits.length, isAutoPlay]);

  // Real-time slider sync for scroll animation
  useEffect(() => {
    if (settings.animationType !== 'scroll' || !isAutoPlay) return;

    const duration = Math.max(5, settings.animationDuration * 4);
    const interval = setInterval(() => {
      setFadeIndex(prev => (prev + 2) % 1000);
    }, (duration * 1000) / 500); // Approximate sync

    return () => clearInterval(interval);
  }, [settings.animationType, settings.animationDuration, isAutoPlay]);

  const isMobileDevice = typeof navigator !== 'undefined' ? /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) : false;
  
  // Base width for all design calculations - using 1920 as the target (1080p)
  const DESIGN_BASE_WIDTH = 1920;
  const DESIGN_BASE_HEIGHT = 1080;
  
  const previewScale = isExporting ? 1 : previewScaleValue;

  const previewRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addRole = () => {
    if (!newRole.trim() || !newNames.trim()) return;
    
    if (editingId) {
      const updated = credits.map(c => 
        c.id === editingId 
          ? { 
              ...c, 
              role: newRole, 
              names: newNames.split('\n').filter(n => n.trim() !== '').map(n => n.trim())
            } 
          : c
      );
      setCredits(updated);
      setEditingId(null);
    } else {
      const entry: CreditEntry = {
        id: Date.now().toString(),
        role: newRole,
        names: newNames.split('\n').filter(n => n.trim() !== '').map(n => n.trim())
      };
      const updated = [...credits, entry];
      setCredits(updated);
    }
    
    setNewRole('');
    setNewNames('');
  };

  const startEditing = (id: string) => {
    const tape = credits.find(c => c.id === id);
    if (tape) {
      setNewRole(tape.role);
      setNewNames((tape.names || []).join('\n'));
      setEditingId(id);
      setOpenSettingsId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewRole('');
    setNewNames('');
  };

  const moveCredit = (id: string, direction: 'up' | 'down') => {
    const index = credits.findIndex(c => c.id === id);
    if (index === -1) return;
    
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === credits.length - 1) return;

    const newCredits = [...credits];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newCredits[index], newCredits[targetIndex]] = [newCredits[targetIndex], newCredits[index]];
    
    setCredits(newCredits);
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


  useEffect(() => {
    if (!previewRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        if (width === 0) return;
        // Scale everything proportionally compared to our design base of 1920
        const scale = width / 1920;
        setPreviewScale(scale);
      }
    });

    observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, []);

   const recordVideo = async () => {
    if (!previewRef.current || !scrollRef.current) {
      console.error("References not found:", { preview: !!previewRef.current, scroll: !!scrollRef.current });
      return;
    }
    
    if (typeof VideoEncoder === 'undefined') {
      alert("Browser Anda tidak mendukung VideoEncoder API yang diperlukan untuk ekspor. Gunakan Chrome atau Edge versi terbaru. iOS saat ini belum mendukung penuh fitur ini di dalam AI Studio.");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    // Initial stabilization wait
    await new Promise(resolve => setTimeout(resolve, 50));

    const scroll = scrollRef.current;
    if (!scroll) return;
    
    // Check if on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const canvasWidth = 1920; 
    const canvasHeight = 1080;
    const duration = 20; 
    const fps = isMobile ? 30 : 60;
    const totalFrames = Math.floor(duration * fps);
    
    // Save original styles to restore later
    const originalStyle = scroll.style.cssText;
    const originalParentStyle = scroll.parentElement?.style.cssText || '';
    
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
    scroll.style.backgroundColor = settings.transparentBg ? 'transparent' : settings.bgColor;
    
    // Wait for fonts to be ready and specifically load the selected font
    await document.fonts.ready;
    try {
      await document.fonts.load(`1em ${settings.fontFamily}`);
    } catch (e) {
      console.warn("Failed to specifically load font:", settings.fontFamily);
    }
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth; 
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    const muxer = new Muxer({
      target: new ArrayBufferTarget(),
      video: {
        codec: 'V_VP9',
        width: canvasWidth,
        height: canvasHeight,
        frameRate: fps,
        alpha: settings.transparentBg
      }
    });

    let active = true;
    const videoEncoder = new VideoEncoder({
      output: (chunk, metadata) => muxer.addVideoChunk(chunk, metadata),
      error: (e) => {
        console.error("VideoEncoder error:", e);
        active = false;
        setIsExporting(false);
      }
    });

    videoEncoder.configure({
      codec: 'vp09.00.10.08',
      width: canvasWidth,
      height: canvasHeight,
      bitrate: isMobile ? 5_000_000 : 12_000_000, // Balanced for speed and quality
      latencyMode: 'realtime' // Optimize for speed
    });

    try {
      // Re-measure after ensuring DOM update and style application
      await new Promise(resolve => setTimeout(resolve, 100)); 
      
      let scrollHeight = scroll.scrollHeight; 
      if (scrollHeight === 0) scrollHeight = 2000;
      
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
      
      const commonOptions = {
        backgroundColor: settings.transparentBg ? null : settings.bgColor,
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
          background: settings.transparentBg ? 'transparent' : settings.bgColor,
          fontFamily: `'${settings.fontFamily}', sans-serif`,
          filter: settings.lut === 'noir' ? 'grayscale(1) contrast(1.2)' :
                  settings.lut === 'sepia' ? 'sepia(0.8) contrast(1.1)' :
                  settings.lut === 'cold' ? 'saturate(0.6) hue-rotate(20deg) brightness(0.9) sepia(0.2)' :
                  settings.lut === 'warm' ? 'saturate(1.4) hue-rotate(-10deg) brightness(1.05)' :
                  settings.lut === 'mute' ? 'saturate(0.2) contrast(0.9)' : 'none'
        },
        // Filter to avoid crashing on cross-origin stylesheets that don't have CORS headers
        filter: (node: any) => {
          if (node.tagName === 'LINK' || node.tagName === 'STYLE') {
            try {
              const sheet = (node as any).sheet as CSSStyleSheet;
              if (!sheet) return false;
              
              // If it's a link, check if it's cross-origin and if it has crossorigin attribute
              if (node.tagName === 'LINK') {
                const href = node.getAttribute('href');
                if (href && !href.startsWith(window.location.origin) && !href.startsWith('/')) {
                   // It's external. If it doesn't have crossorigin, we can't read its rules safely.
                   if (node.getAttribute('crossorigin') === null) {
                     return false;
                   }
                }
              }

              // Test if we can read the rules
              try {
                const rules = sheet.cssRules;
                return !!rules;
              } catch (e) {
                // Ignore cross-origin stylesheet errors
                return false;
              }
            } catch (e) {
              return false;
            }
          }
          return true;
        }
      };

      let bigImage;
      try {
        bigImage = await toPng(scroll, commonOptions);
      } catch (err) {
        console.warn("Capture with fonts failed, falling back to skipFonts: true", err);
        bigImage = await toPng(scroll, { ...commonOptions, skipFonts: true });
      }
      console.log("DOM capture image data:", bigImage.substring(0, 50));
      console.log("DOM capture complete");

      // Restore original state promptly
      scroll.style.cssText = originalStyle;
      if (scroll.parentElement) {
        scroll.parentElement.style.cssText = originalParentStyle;
      }

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load captured scroll image"));
        img.src = bigImage;
      });

      const imgWidth = captureWidth;
      const imgHeight = scrollHeight;

      const startPos = canvasHeight; 
      const endPos = -imgHeight;
      const travelDistance = startPos - endPos;

      const renderFrame = (frame: number) => {
        const progress = frame / (totalFrames - 1);
        
        if (settings.transparentBg) {
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

        // Overlay effects in export
        if (settings.showNoise) {
          ctx.fillStyle = `rgba(255,255,255,${settings.noiseOpacity * 0.4})`;
          for (let i = 0; i < 6000; i++) {
            ctx.fillRect(Math.random() * canvasWidth, Math.random() * canvasHeight, 1, 1);
          }
        }
        if (settings.showScanlines) {
          ctx.fillStyle = 'rgba(0,0,0,0.1)';
          for (let i = 0; i < canvasHeight; i += 4) {
             ctx.fillRect(0, i, canvasWidth, 1);
          }
        }
        if (settings.vignette > 0) {
          const gradient = ctx.createRadialGradient(
            canvasWidth / 2, canvasHeight / 2, 0,
            canvasWidth / 2, canvasHeight / 2, Math.max(canvasWidth, canvasHeight) / 1.1
          );
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(1, `rgba(0,0,0,${settings.vignette * 0.95})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        if (frame % 30 === 0) {
          setExportProgress(Math.min(99, Math.round((frame / totalFrames) * 100)));
        }

        const videoFrame = new VideoFrame(canvas, { timestamp: (frame * 1000000) / fps });
        videoEncoder.encode(videoFrame, { keyFrame: frame % 60 === 0 });
        videoFrame.close();
      };

      for (let frame = 0; frame < totalFrames && active; frame++) {
        renderFrame(frame);
        
        // Safety: don't overwhelm the encoder queue
        if (videoEncoder.encodeQueueSize > 30) {
          await new Promise(resolve => {
            const check = () => {
              if (videoEncoder.encodeQueueSize < 10 || !active) resolve(null);
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
      }

      setIsExporting(false);
      setExportProgress(0);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Ekspor gagal karena memori tidak cukup atau browser tidak mendukung. Coba perpendek durasi atau gunakan desktop.");
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
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
        recordVideo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, isAutoPlay, credits.length, recordVideo]);

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
      {view !== 'editor' && <Navbar lang={lang} setLang={setLang} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />}
      
      <AnimatePresence mode="wait">
        {view === 'hero' ? (
          <div key="landing-wrapper" className="flex flex-col w-full">
            <motion.section 
              key="hero"
              id="home"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8 text-center relative overflow-hidden bg-black"
            >
              <BackgroundElements />
              
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
                  
                  <motion.h1 
                    initial={{ y: 30, opacity: 0, skewX: -5 }}
                    whileInView={{ y: 0, opacity: 1, skewX: -5 }}
                    viewport={{ once: false }}
                    animate={{ x: [0, 2, -2, 0], y: [0, -4, 0], skewX: -5 }}
                    transition={{ 
                      y: { duration: 1, ease: [0.16, 1, 0.3, 1] },
                      x: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                    }}
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
                  </motion.h1>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.5 }}
                    className="text-[11px] sm:text-[13px] md:text-[15px] uppercase tracking-[0.4em] font-medium text-white/40 max-w-2xl mx-auto h-6 flex items-center justify-center py-12"
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setView('editor');
                      window.scrollTo({ top: 0 });
                    }}
                    className="group relative px-6 sm:px-10 py-3 sm:py-4 text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.5em] transition-all overflow-hidden border border-white/40 rounded-none bg-black/50 backdrop-blur-xl shadow-[4px_4px_0px_rgba(255,255,255,0.05)] hover:shadow-[8px_8px_0px_rgba(255,255,255,0.1)] active:scale-[0.98] hero-button"
                  >
                    {/* Pulsing Core */}
                    <motion.div 
                      animate={{ 
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-white/5 z-0"
                    />

                    {/* Advanced Shimmer Animation */}
                    <motion.div 
                      animate={{ 
                        left: ['-100%', '200%'],
                        opacity: [0, 0.4, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        repeatDelay: 0.5
                      }}
                      className="absolute top-0 bottom-0 w-[50%] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-30deg] z-10"
                    />

                    <div className="absolute inset-0 bg-white translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1] z-0" />
                    <span className="relative z-20 text-white group-hover:text-black transition-colors duration-500 flex items-center gap-10">
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
                    <div className="text-[9px] text-zinc-700 uppercase tracking-[0.8em] font-black">{translations[lang].hero.scroll}</div>
                    <motion.div 
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ChevronDown className="w-4 h-4 text-zinc-800" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.section>

            
            <AboutSection lang={lang} onStart={() => setView('editor')} />
            <Marquee text={translations[lang].editor.rendering + " CREDITS ENGINE"} />
            <FAQSection lang={lang} />

            <footer className="py-20 border-t border-white/5 bg-black flex flex-col items-center justify-center space-y-8">
               <div className="text-xl sm:text-2xl font-bold uppercase tracking-tighter">DaftarKru Engine</div>
               <div className="flex gap-8 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                  <a href="#" className="hover:text-white">Twitter</a>
                  <a href="#" className="hover:text-white">Instagram</a>
                  <a href="#" className="hover:text-white">GitHub</a>
               </div>
               <div className="text-[8px] sm:text-[10px] font-semibold text-zinc-700 uppercase tracking-[0.5em]">
                  COPYRIGHT DAFTARKRU 2026
               </div>
            </footer>
          </div>
        ) : (
          <motion.div 
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col lg:h-screen lg:overflow-hidden"
          >
            {/* Header */}
            <header className="h-16 md:h-20 border-b border-white flex items-center justify-between px-4 md:px-8 bg-black flex-shrink-0 z-[100] relative">
              <div 
                className="flex flex-col cursor-pointer group"
                onClick={() => setView('hero')}
              >
                <h1 className="text-xl md:text-2xl font-bold tracking-tighter uppercase leading-none group-hover:text-zinc-500 transition-colors">
                  DaftarKru
                </h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 hidden sm:block">
                  Engine
                </p>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={undo}
                  disabled={history.length <= 1}
                  className="p-2 md:p-3 border border-white hover:bg-white hover:text-black transition-all disabled:opacity-20 rounded-none group flex items-center gap-2"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Undo</span>
                </button>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={cn(
                    "p-2 md:p-3 border border-white transition-all rounded-none",
                    isMenuOpen ? "bg-white text-black" : "hover:bg-white hover:text-black"
                  )}
                >
                  <Menu className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </header>

            {/* Sidebar Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300]"
                  />
                  <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    className="fixed top-0 right-0 h-full w-full sm:w-80 bg-black border-l border-white z-[310] p-6 md:p-8 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-12">
                      <h2 className="text-sm font-bold uppercase tracking-widest">{translations[lang].editor.projectOptions}</h2>
                      <button 
                        onClick={() => setIsMenuOpen(false)} 
                        className="group relative flex items-center justify-center w-10 h-10 rounded-none border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
                      >
                        <X className="w-5 h-5 text-white transition-transform duration-500 group-hover:rotate-180" />
                        <div className="absolute inset-0 rounded-none bg-white/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col flex-1 h-full">
                      <div className="space-y-8">
                        <div className="space-y-1">
                          {['home', 'documentation', 'faq'].map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  setView('hero');
                                  setTimeout(() => {
                                    if (item === 'home') {
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    } else {
                                      const el = document.getElementById(item);
                                      if (el) {
                                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                      }
                                    }
                                  }, 500);
                                  setIsMenuOpen(false);
                                }}
                                className="block w-full text-left py-4 text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors border-b border-white/5"
                              >
                                {translations[lang].nav[item as keyof typeof translations.id.nav]}
                              </button>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] uppercase font-semibold tracking-widest text-zinc-500">{translations[lang].editor.projectName}</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={projectName}
                              onChange={(e) => setProjectName(e.target.value)}
                              className="flex-1 bg-black border border-white p-4 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-white transition-all rounded-none"
                              placeholder="PROJECT_MASTER"
                            />
                            <button 
                              onClick={() => setIsMenuOpen(false)}
                              className="bg-white text-black px-4 flex items-center justify-center hover:bg-zinc-200 transition-colors"
                              title="Confirm Name"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed font-medium">
                            Developed by Afgan Al-fanany.
                          </p>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                          <label className="text-[10px] uppercase font-semibold tracking-widest text-zinc-500 mb-2 block">{translations[lang].langToggles.switch}</label>
                          <div className="flex items-center gap-1 border border-white/10 p-1 rounded-none bg-white/[0.03]">
                            {(['id', 'en'] as Lang[]).map((l) => (
                              <button
                                key={l}
                                onClick={() => setLang(l)}
                                className={cn(
                                  "flex-1 px-3 py-1.5 text-[9px] font-bold transition-all rounded-none",
                                  lang === l 
                                    ? "bg-white text-black" 
                                    : "text-zinc-500 hover:text-white"
                                )}
                              >
                                {l.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <button 
                          onClick={() => { setView('hero'); setIsMenuOpen(false); }}
                          className="w-full bg-white text-black p-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all rounded-none"
                        >
                          <Home className="w-4 h-4" />
                          {translations[lang].editor.backHome}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden relative">
              {/* Export Overlay for Desktop Layout */}
              <AnimatePresence>
                {isExporting && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-8 text-center overflow-hidden"
                  >
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="max-w-xl w-full space-y-12 relative z-10"
                    >
                      <div className="space-y-4">
                        <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-[0.4em] text-white">
                          {translations[lang].editor.rendering}
                        </h2>
                        <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
                          {translations[lang].editor.generatingFrames} <span className="text-white">{projectName}</span>
                        </p>
                      </div>

                      <div className="relative py-16 flex flex-col items-center">
                        <div className="text-[8rem] sm:text-[10rem] font-bold tabular-nums tracking-tighter text-white opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
                          {exportProgress}%
                        </div>
                        
                        <div className="w-full space-y-6 relative z-10">
                          <div className="flex justify-between items-end">
                             <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                               <div className="w-2 h-2 bg-white animate-pulse" />
                               <span>{translations[lang].editor.processing}</span>
                             </div>
                             <div className="text-2xl font-mono font-bold text-white">{exportProgress}%</div>
                          </div>
                          <div className="h-[2px] w-full bg-white/5 relative overflow-hidden">
                             <motion.div 
                               className="absolute inset-y-0 left-0 bg-white" 
                               animate={{ width: `${exportProgress}%` }}
                               transition={{ type: "spring", stiffness: 100, damping: 30 }}
                             />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-8 pt-12 border-t border-white/5">
                        <div className="space-y-2">
                          <div className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold">Resolution</div>
                          <div className="text-[10px] font-mono font-medium">1920 X 1080</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold">Framerate</div>
                          <div className="text-[10px] font-mono font-medium">60 FPS</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold">Format</div>
                          <div className="text-[10px] font-mono font-medium">WEBM / VP9</div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls Column (Left) */}
              <aside className="w-full lg:w-[380px] border-b lg:border-b-0 lg:border-r border-white lg:overflow-y-auto lg:scrollbar-hide bg-black p-4 md:p-6 space-y-12 order-2 lg:order-1 flex-shrink-0">
                {/* Management Section */}
                <div className="space-y-6 credit-input">
                  <div className="flex items-center justify-between border-b border-white pb-3">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">{translations[lang].editor.creditInput}</h2>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder={translations[lang].editor.rolePlaceholder}
                      className="w-full bg-black border border-white p-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-white rounded-none placeholder:text-zinc-700 font-mono"
                    />
                    <textarea 
                      value={newNames}
                      onChange={(e) => setNewNames(e.target.value)}
                      placeholder={translations[lang].editor.namesPlaceholder}
                      className="w-full h-32 bg-black border border-white p-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-white rounded-none resize-none placeholder:text-zinc-700 font-mono"
                    />
                    <button 
                      onClick={addRole}
                      disabled={!newRole.trim() || !newNames.trim()}
                      className="w-full h-16 border border-white flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-20 rounded-none group bg-zinc-950"
                    >
                      {editingId ? <Check className="w-8 h-8" /> : <Plus className="w-8 h-8 transition-transform group-hover:rotate-90" />}
                    </button>
                    {editingId && (
                      <button 
                        onClick={cancelEdit}
                        className="w-full border border-white/20 text-white p-4 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all font-mono"
                      >
                        {translations[lang].editor.cancelEditing}
                      </button>
                    )}
                  </div>
                </div>


                {/* Tape List Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white pb-3">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">{translations[lang].editor.tapeList}</h2>
                    <div className="flex gap-4">
                      {selectedIds.size > 0 && (
                        <button 
                          onClick={bulkDelete}
                          className="text-[10px] font-bold text-red-500 hover:scale-105 transition-transform uppercase tracking-widest"
                        >
                          {translations[lang].editor.delete} ({selectedIds.size})
                        </button>
                      )}
                      <button 
                        onClick={toggleSelectAll}
                        className="text-[10px] font-black hover:text-zinc-400 transition-colors uppercase tracking-[0.15em]"
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
                        togglePairs={togglePairs}
                        lang={lang}
                      />
                    ))}
                    {credits.length === 0 && (
                      <p className="text-[10px] text-zinc-600 uppercase tracking-widest text-center py-8 italic font-light">{translations[lang].editor.emptyList}</p>
                    )}
                  </Reorder.Group>
                </div>

                {/* Console Section (Mobile only) */}
                <div className="space-y-12 lg:hidden">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white pb-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">{translations[lang].editor.visualConsole}</h2>
                    </div>
                    <ConsoleContent 
                      settings={settings} 
                      setSettings={setSettings} 
                      activeConsole={activeConsole} 
                      setActiveConsole={setActiveConsole}
                      setFadeIndex={setFadeIndex}
                      customFonts={customFonts}
                      setCustomFonts={setCustomFonts}
                      lang={lang}
                      onFontUpload={handleFontUpload}
                      onDeleteFont={handleDeleteFont}
                    />
                  </div>

                  <div className="space-y-6">
                    <TuningControls settings={settings} setSettings={setSettings} lang={lang} />
                  </div>

                  {/* Move Export here for Mobile */}
                  <div className="pt-6 border-t border-white/20">
                    <button 
                      onClick={recordVideo}
                      disabled={isExporting}
                      className="w-full bg-white text-black border border-white py-4 text-[12px] font-bold uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-20 rounded-none shadow-[8px_8px_0px_rgba(255,255,255,0.05)] active:scale-[0.98]"
                    >
                      {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />}
                      {isExporting ? `${translations[lang].editor.rendering} ${exportProgress}%` : translations[lang].editor.renderExport}
                    </button>
                    <div className="mt-2 text-[8px] text-zinc-600 uppercase tracking-widest text-center hidden sm:block">Shortcut: Space (Play/Pause) • Arrows (Skip) • Ctrl+S (Export)</div>
                  </div>
                </div>
              </aside>

              {/* Preview & Desktop Console Container */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#050505] order-1 lg:order-2 sticky top-0 lg:static z-[150] shadow-[0_10px_30px_rgba(0,0,0,0.5)] lg:shadow-none border-b border-white/20 lg:border-b-0 backdrop-blur-md">
                <main className="flex-1 p-2 sm:p-6 lg:p-12 flex flex-col items-center justify-center overflow-hidden min-h-[250px] sm:min-h-[300px] lg:min-h-0 relative">
                  <div className="w-full max-w-[1400px] max-h-[75vh] aspect-video relative border border-white/10 group shadow-[0_0_100px_rgba(255,255,255,0.05)] overflow-hidden bg-black ring-1 ring-white/5 preview-viewport">

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
                        className="p-2 bg-black/60 backdrop-blur-md border border-white/20 hover:bg-white hover:text-black transition-all flex items-center justify-center"
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
                        className="absolute flex-shrink-0"
                        style={{ 
                          width: DESIGN_BASE_WIDTH,
                          height: DESIGN_BASE_HEIGHT,
                          transform: `scale(${previewScale})`,
                          transformOrigin: 'center center',
                          backgroundColor: settings.transparentBg ? 'transparent' : settings.bgColor,
                        }}
                      >
                        {settings.transparentBg && (
                          <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                        )}
                      
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
                            animationDuration: `${Math.max(5, settings.animationDuration * 4)}s`,
                            animationTimingFunction: 'linear',
                            animationIterationCount: 'infinite',
                            animationPlayState: isAutoPlay ? 'running' : 'paused',
                            animationDelay: settings.animationType === 'scroll' && !isAutoPlay ? `-${(fadeIndex / 1000) * Math.max(5, settings.animationDuration * 4)}s` : '0s',
                            width: `100%`,
                            maxWidth: `${DESIGN_BASE_WIDTH}px`,
                            transform: `translate(-50%, 1080px)`,
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
                            <div className="absolute inset-0 overflow-hidden mix-blend-screen">
                               <div 
                                 className="absolute inset-[-100%] animate-grain"
                                 style={{ 
                                   opacity: settings.noiseOpacity,
                                   backgroundImage: `url("https://www.transparenttextures.com/patterns/p6.png")` 
                                 }} 
                               />
                            </div>
                          )}
                          {settings.showScanlines && (
                             <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
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
                </main>

                    {/* Visual Console for Desktop */}
                    <div className="hidden lg:block border-t border-white bg-black flex-shrink-0 relative z-[200] visual-console">
                      <div className="px-8 py-3 border-b border-white/10 flex items-center justify-between">
                         <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">{translations[lang].editor.visualConsole}</h2>
                      </div>
                      <div className="px-8 py-6">
                        <ConsoleContent 
                          settings={settings} 
                          setSettings={setSettings} 
                          activeConsole={activeConsole} 
                          setActiveConsole={setActiveConsole}
                          setFadeIndex={setFadeIndex}
                          customFonts={customFonts}
                          setCustomFonts={setCustomFonts}
                          lang={lang}
                          onFontUpload={handleFontUpload}
                          onDeleteFont={handleDeleteFont}
                        />

                        {/* Export Button for Desktop */}
                        <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
                          <button 
                            onClick={recordVideo}
                            title={translations[lang].editor.renderExport}
                            className="min-w-[200px] bg-white text-black py-4 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all rounded-none shadow-[8px_8px_0px_rgba(255,255,255,0.05)] render-button"
                          >
                            {translations[lang].editor.renderExport}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fine Tuning Panel (Right) */}
                  <aside className="hidden lg:block w-[380px] border-l border-white bg-black p-8 overflow-y-auto scrollbar-hide order-3 flex-shrink-0">
                    <TuningControls settings={settings} setSettings={setSettings} lang={lang} />
                  </aside>
                </div>

            {/* Micro Footer */}
            <footer className="h-10 border-t border-white px-4 md:px-8 flex items-center justify-between text-[7px] md:text-[8px] font-semibold uppercase tracking-[0.3em] md:tracking-[0.5em] text-zinc-600 flex-shrink-0">
              <div className="flex gap-4 md:gap-8">
                <span className="flex items-center gap-2">{translations[lang].editor.version}</span>
              </div>
              <div className="flex gap-4 md:gap-8">
                <span className="text-zinc-600">copyright DaftarKru 2026</span>
              </div>
            </footer>
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
            <div className="h-16 flex items-center justify-between px-8 border-b border-white/10 z-[1010]">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-zinc-500">{translations[lang].editor.previewMode}</span>
              </div>
              <button 
                onClick={() => setIsFullscreen(false)}
                className="group relative flex items-center gap-3 px-6 py-3 rounded-none bg-black border border-white/20 hover:border-white transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <X className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-white transition-colors">
                  {translations[lang].editor.exitFullscreen}
                </span>
              </button>
            </div>
            
            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 sm:p-12">
               <div 
                className="w-full h-full relative border border-white/5 bg-black overflow-hidden flex items-center justify-center"
                style={{ 
                   aspectRatio: '16/9',
                   maxWidth: '100%',
                   maxHeight: '100%'
                }}
               >
                  <div 
                    className="absolute flex-shrink-0"
                    style={{ 
                      width: DESIGN_BASE_WIDTH,
                      height: DESIGN_BASE_HEIGHT,
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'center center',
                      backgroundColor: settings.transparentBg ? 'transparent' : settings.bgColor,
                    }}
                  >
                    {/* Reuse inner preview content */}
                    {settings.transparentBg && (
                      <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    )}

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
                        animationDuration: `${Math.max(5, settings.animationDuration * 4)}s`,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        animationPlayState: isAutoPlay ? 'running' : 'paused',
                        animationDelay: settings.animationType === 'scroll' && !isAutoPlay ? `-${(fadeIndex / 1000) * Math.max(5, settings.animationDuration * 4)}s` : '0s',
                        width: `100%`,
                        maxWidth: `${DESIGN_BASE_WIDTH}px`,
                        transform: `translate(-50%, 1080px)`,
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
                        <div className="absolute inset-0 overflow-hidden mix-blend-screen">
                           <div 
                             className="absolute inset-[-100%] animate-grain"
                             style={{ 
                               opacity: settings.noiseOpacity,
                               backgroundImage: `url("https://www.transparenttextures.com/patterns/p6.png")` 
                             }} 
                           />
                        </div>
                      )}
                      {settings.showScanlines && (
                         <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
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
          0% { transform: translate(-50%, 1080px); }
          100% { transform: translate(-50%, -100%); }
        }

        @keyframes scroll-topToBottom {
          0% { transform: translate(-50%, -100%); }
          100% { transform: translate(-50%, 1080px); }
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
