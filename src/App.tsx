import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Minus,
  Settings2,
  Film, 
  Trash2,
  Loader2,
  Undo2,
  CheckSquare,
  Square,
  Rocket,
  Menu,
  X,
  ChevronRight,
  Home,
  ChevronUp,
  ChevronDown,
  GripVertical,
  MoreVertical,
  Check,
  Maximize,
  Minimize
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls, useSpring, useTransform } from 'motion/react';
import { cn } from './lib/utils';
// @ts-ignore - webm-muxer types might be missing in some environments
import { Muxer, ArrayBufferTarget } from 'webm-muxer';

interface CreditEntry {
  id: string;
  role: string;
  names: string[];
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
  showScanlines: boolean;
  vignette: number;
}

type Direction = 'bottomToTop' | 'topToBottom' | 'leftToRight' | 'rightToLeft';
type AnimationType = 'scroll' | 'fade' | 'zoom' | 'blur' | 'slide' | 'glitch';
type View = 'hero' | 'editor';

const TypingDescription = () => {
  const text = "Alat Profesional untuk membuat kredit film secara otomatis";
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (!isDeleting && displayedText.length < text.length) {
      // Typing
      timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, 100);
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
  }, [displayedText, isDeleting]);

  return <span className="inline-block">{displayedText}<span className="inline-block w-1 h-4 bg-white ml-1 animate-pulse" /></span>;
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const home = document.getElementById('home');
      const about = document.getElementById('about');
      const faq = document.getElementById('faq');
      
      const scrollPos = window.scrollY + 100;
      
      if (faq && scrollPos >= faq.offsetTop) setActiveSection('faq');
      else if (about && scrollPos >= about.offsetTop) setActiveSection('about');
      else setActiveSection('home');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-[500] p-1.5 rounded-full border transition-all duration-500 flex items-center justify-center",
        isScrolled 
          ? "bg-black/40 backdrop-blur-2xl border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)]" 
          : "bg-black/10 backdrop-blur-md border-white/10"
      )}
    >
      <div className="flex items-center relative">
        {['home', 'about', 'faq'].map((item) => (
          <button
            key={item}
            onClick={() => item === 'home' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : scrollTo(item)}
            className={cn(
              "relative px-6 py-2 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-500 z-10",
              activeSection === item ? "text-black" : "text-zinc-500 hover:text-white"
            )}
          >
            {item}
            {activeSection === item && (
              <motion.div 
                layoutId="active-pill"
                className="absolute inset-0 bg-white rounded-full -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    </motion.nav>
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
      {/* Dynamic Glows */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.03, 0.05, 0.03]
          }}
          style={{
            x: useTransform(mouseX, x => x * (50 + i * 20)),
            y: useTransform(mouseY, y => y * (50 + i * 20)),
            top: `${(i % 2) * 60 + 10}%`,
            left: `${Math.floor(i / 2) * 60 + 10}%`,
          }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-[800px] h-[800px] rounded-full blur-[180px] bg-white translate-x-[-15%] translate-y-[-15%]"
        />
      ))}
      
      {/* Tech Grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{ 
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }} 
      />

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: 0
          }}
          animate={{ 
            y: ["-10%", "110%"],
            opacity: [0, 0.2, 0]
          }}
          transition={{ 
            duration: 12 + Math.random() * 18, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
          className="absolute w-[1px] h-[50px] bg-gradient-to-b from-white/10 to-transparent"
        />
      ))}
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
            <span className="text-4xl sm:text-7xl font-black uppercase tracking-tighter text-white/10 italic hover:text-white/40 transition-colors cursor-default select-none">
              {text}
            </span>
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 border-white/10" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const AboutSection = () => {
  const [titleVisible, setTitleVisible] = useState(false);
  const titleText = "DAFTAR KRU ENGINE";
  const [displayedTitle, setDisplayedTitle] = useState("");

  useEffect(() => {
    if (titleVisible && displayedTitle.length < titleText.length) {
      const timeout = setTimeout(() => {
        setDisplayedTitle(titleText.slice(0, displayedTitle.length + 1));
      }, 70);
      return () => clearTimeout(timeout);
    } else if (!titleVisible) {
      setDisplayedTitle("");
    }
  }, [titleVisible, displayedTitle]);

  return (
    <section id="about" className="min-h-screen w-full bg-[#050505] flex flex-col lg:flex-row items-center justify-center p-6 sm:p-12 lg:p-24 gap-12 sm:gap-24 relative overflow-hidden border-t border-white/5">
      <BackgroundElements />

      <motion.div 
        onViewportEnter={() => setTitleVisible(true)}
        onViewportLeave={() => setTitleVisible(false)}
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="flex-1 space-y-8 sm:space-y-12 z-10"
      >
        <div className="space-y-4">
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false }}
            className="h-[1px] w-24 bg-white/40 origin-left"
          />
          <h2 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85] break-words">
            {displayedTitle}
            <span className="inline-block w-1.5 h-8 sm:h-12 lg:h-20 bg-white ml-2 animate-pulse align-middle" />
          </h2>
        </div>
        
        <div className="space-y-6 max-w-xl">
          <p className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-[0.3em] leading-relaxed">
            Platform revolusioner untuk para filmmaker menghemat waktu dalam pembuatan closing credits. Dengan sistem otomatisasi engine kami, anda cukup memasukkan data dan biarkan kami yang bekerja menciptakan visual sinematik yang memukau.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="space-y-2">
               <div className="text-2xl font-black italic tracking-tighter text-white">01_AUTO</div>
               <div className="text-[8px] sm:text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Automated Workflow</div>
            </div>
            <div className="space-y-2">
               <div className="text-2xl font-black italic tracking-tighter text-white">02_PRO</div>
               <div className="text-[8px] sm:text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Cine-Grade Visuals</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex-1 w-full max-w-2xl perspective-1000"
      >
        <div className="aspect-video bg-zinc-950 border border-white/20 relative group overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.5em] text-white/20"
            >
              RECORDING_IN_PROGRESS
            </motion.div>
          </div>
          
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <div className="text-[8px] font-mono text-white/40">4K_RAW_60FPS</div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 sm:p-12 flex flex-col justify-end lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-700">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md">
                   <Film className="w-5 h-5" />
                </div>
                <div className="h-[1px] w-12 bg-white/20" />
                <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-widest">Tutorial Engine</span>
             </div>
            <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed max-w-sm">Pelajari teknik dasar pembuatan kredit engine dalam hitungan detik. Semua fitur didesain untuk kemudahan workflow anda.</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

interface FAQProps {
  faq: { q: string, a: string };
  index: number;
}

const FAQItem: React.FC<FAQProps> = ({ faq, index }) => {
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
        "bg-white/[0.02] border border-white/5 overflow-hidden transition-all duration-500",
        isOpen ? "bg-white/[0.05] border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" : "hover:border-white/10"
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

const FAQSection = () => {
  const faqs = [
    { q: "Apa itu DaftarKru Engine?", a: "DaftarKru Engine adalah toolkit berbasis web untuk membuat credit film secara otomatis dengan berbagai pilihan desain dan animasi profesional yang siap pakai." },
    { q: "Apakah hasil ekspor bisa transparan?", a: "Ya, kami mendukung ekspor format WEBM dengan channel Alpha (transparan). Anda bisa mengaktifkan mode 'Transparent' pada menu Backdrop sebelum melakukan render." },
    { q: "Berapa resolusi maksimal ekspor?", a: "Standar ekspor kami adalah Full HD (1920x1080) dengan framerate hingga 60 FPS untuk kualitas video yang sangat halus dan tajam." },
    { q: "Bagaimana cara memasukkan banyak nama sekaligus?", a: "Sangat mudah. Anda cukup menyalin (copy) daftar nama dari file dokumen anda, lalu tempel (paste) ke kolom 'Names'. Engine kami akan otomatis memproses setiap baris sebagai satu nama." }
  ];

  return (
    <section id="faq" className="min-h-screen w-full bg-[#020202] flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative overflow-hidden border-t border-white/5">
       <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-white/[0.01] blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
       
       <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-20 items-start">
          <div className="sticky top-32 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              className="text-[9px] font-black tracking-[0.8em] text-white/40 uppercase"
            >
              Support Center
            </motion.div>
            <h2 className="text-6xl sm:text-8xl font-black tracking-tighter uppercase leading-none italic">Pertanyaan<br/>Populer</h2>
            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] max-w-sm leading-relaxed">
              Semua jawaban yang anda butuhkan untuk memulai produksi kredit film anda hari ini.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
       </div>
    </section>
  );
};


const THEMES = [
  { 
    id: 'minimal', 
    name: 'Minimal', 
    settings: { 
      fontFamily: 'Inter', 
      roleOpacity: 0.2, 
      namesOpacity: 1, 
      marginBlock: 120, 
      roleFontSize: 12, 
      fontSize: 32,
      letterSpacing: '0.2em'
    } 
  },
  { 
    id: 'cinematic', 
    name: 'Cinematic', 
    settings: { 
      fontFamily: 'Cinzel', 
      roleOpacity: 0.5, 
      namesOpacity: 1, 
      marginBlock: 160, 
      roleFontSize: 16, 
      fontSize: 48,
      letterSpacing: '0.1em'
    } 
  },
  { 
    id: 'compact', 
    name: 'Compact', 
    settings: { 
      fontFamily: 'Space Grotesk', 
      roleOpacity: 1, 
      namesOpacity: 0.6, 
      marginBlock: 60, 
      roleFontSize: 14, 
      fontSize: 28,
      letterSpacing: '0.05em'
    } 
  },
  { 
    id: 'classic', 
    name: 'Classic Hollywood', 
    settings: { 
      fontFamily: 'Crimson Text', 
      roleOpacity: 0.4, 
      namesOpacity: 1, 
      marginBlock: 200, 
      roleFontSize: 18, 
      fontSize: 56,
      letterSpacing: '0.3em'
    } 
  },
];

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
  { name: 'ARCHIVE BLACK', value: 'Archivo Black' },
  { name: 'MONTSERRAT', value: 'Montserrat' },
  { name: 'SYNE BOLD', value: 'Syne' },
  { name: 'UNBOUNDED', value: 'Unbounded' },
  { name: 'PLAYFAIR SERIF', value: 'Playfair Display' },
  { name: 'OSWALD CONDENSED', value: 'Oswald' },
  { name: 'KANIT BLACK', value: 'Kanit' },
  { name: 'SYSTEM MONO', value: 'JetBrains Mono' },
];

const TuningControls = ({ settings, setSettings }: any) => {
  const pxToPercent = (px: number) => ((px / 1920) * 100).toFixed(1);
  const percentToPx = (pct: number) => Number(((pct / 100) * 1920).toFixed(1));

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4 border-b border-white/5 pb-2">
         <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 whitespace-nowrap">Fine-Tuning Controls</h3>
         <div className="h-[1px] w-full bg-white/5" />
      </div>
      <div className="grid grid-cols-1 gap-y-10">
        <SliderWithControls 
          label="Name Size"
          value={Number(pxToPercent(settings.fontSize))}
          onChange={(val) => setSettings({...settings, fontSize: percentToPx(val)})}
          min={0.2}
          max={10}
          step={0.1}
          unit="%"
          precision={1}
        />
        <SliderWithControls 
          label="Role Size"
          value={Number(pxToPercent(settings.roleFontSize))}
          onChange={(val) => setSettings({...settings, roleFontSize: percentToPx(val)})}
          min={0.2}
          max={8}
          step={0.1}
          unit="%"
          precision={1}
        />
        <SliderWithControls 
          label="Block Space"
          value={Number(pxToPercent(settings.marginBlock))}
          onChange={(val) => setSettings({...settings, marginBlock: percentToPx(val)})}
          min={0}
          max={20}
          step={0.1}
          unit="%"
          precision={1}
        />
        <SliderWithControls 
          label="Role Gap"
          value={Number(pxToPercent(settings.roleNameGap))}
          onChange={(val) => setSettings({...settings, roleNameGap: percentToPx(val)})}
          min={0}
          max={10}
          step={0.1}
          unit="%"
          precision={1}
        />
        <SliderWithControls 
          label="Name Gap"
          value={Number(pxToPercent(settings.namesGap))}
          onChange={(val) => setSettings({...settings, namesGap: percentToPx(val)})}
          min={0}
          max={10}
          step={0.1}
          unit="%"
          precision={1}
        />
        <SliderWithControls 
          label="Line Height"
          value={settings.lineHeight}
          onChange={(val) => setSettings({...settings, lineHeight: val})}
          min={0.5}
          max={4}
          step={0.1}
          unit=""
          precision={1}
        />
      </div>
    </div>
  );
};

const ConsoleContent = ({ settings, setSettings, activeConsole, setActiveConsole }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Specifically allow clicks on these elements to NOT close the console
      const isInteractionElement = 
        target.closest('.chrome-picker') || 
        target.closest('.color-picker-popover') ||
        target.tagName === 'INPUT' || 
        target.tagName === 'SELECT' || 
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.closest('input');
      
      if (activeConsole !== 'none' && containerRef.current && !containerRef.current.contains(target) && !isInteractionElement) {
        setActiveConsole('none');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeConsole, setActiveConsole]);

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* Categories Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Typography Category */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2 sm:space-y-3"
        >
          <label className="text-[8px] sm:text-[9px] uppercase font-bold tracking-[0.2em] text-zinc-600 block">1. Font Style</label>
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveConsole(activeConsole === 'font' ? 'none' : 'font')}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all",
                activeConsole === 'font' ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "border-white/10 hover:bg-white/5"
              )}
            >
              <span className="truncate">{settings.fontFamily.toUpperCase()}</span>
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'font' && "rotate-90")} />
            </motion.button>
            <AnimatePresence>
              {activeConsole === 'font' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-[calc(100vw-48px)] sm:w-[350px] lg:w-[450px] border border-white/20 bg-zinc-950 z-[250] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
                >
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {FONT_OPTIONS.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => {
                          setSettings({...settings, fontFamily: font.value});
                          setActiveConsole('none');
                        }}
                        className={cn(
                          "w-full text-left px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all border-b border-white/5 last:border-0",
                          settings.fontFamily === font.value ? "bg-white/10 text-white" : "text-zinc-500"
                        )}
                        style={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Behavior Category */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 sm:space-y-3"
        >
          <label className="text-[8px] sm:text-[9px] uppercase font-bold tracking-[0.2em] text-zinc-600 block">2. Motion Type</label>
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveConsole(activeConsole === 'anim' ? 'none' : 'anim')}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all",
                activeConsole === 'anim' ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "border-white/10 hover:bg-white/5"
              )}
            >
              {settings.animationType.toUpperCase()}
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'anim' && "rotate-90")} />
            </motion.button>
            <AnimatePresence>
              {activeConsole === 'anim' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-[calc(100vw-48px)] sm:w-[350px] lg:w-[450px] border border-white/20 bg-zinc-950 z-[250] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
                >
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
                        setActiveConsole('none');
                      }}
                      className={cn(
                        "w-full text-left px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all border-b border-white/5 last:border-0",
                        settings.animationType === anim.value ? "bg-white/10 text-white" : "text-zinc-500"
                      )}
                    >
                      {anim.name}
                    </button>
                  ))}
                  <div className="p-4 border-t border-white/5">
                    <SliderWithControls 
                      label="SCENE SPEED"
                      value={settings.animationDuration}
                      onChange={(val) => setSettings({...settings, animationDuration: val})}
                      min={1}
                      max={10}
                      step={0.5}
                      precision={1}
                    />
                    <div className="text-[8px] text-zinc-600 mt-2 text-center uppercase tracking-widest italic">
                      Only affects non-scroll modes
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Style Category */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2 sm:space-y-3"
        >
          <label className="text-[8px] sm:text-[9px] uppercase font-bold tracking-[0.2em] text-zinc-600 block">3. Appearance</label>
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveConsole(activeConsole === 'color' ? 'none' : 'color')}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all",
                activeConsole === 'color' ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "border-white/10 hover:bg-white/5"
              )}
            >
              VISUALS
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'color' && "rotate-90")} />
            </motion.button>
            <AnimatePresence>
              {activeConsole === 'color' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-[calc(100vw-48px)] sm:w-[380px] lg:w-[480px] border border-white/20 bg-zinc-950 z-[250] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-6 sm:p-8 space-y-8"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-zinc-500">
                      <span>Identity Label</span>
                      <div className="flex gap-1 items-center">
                        <button 
                          onClick={() => setSettings({...settings, roleBold: !settings.roleBold})}
                          className={cn("w-6 h-6 border flex items-center justify-center transition-all", settings.roleBold ? "bg-white text-black border-white" : "border-white/10 text-zinc-500")}
                        >
                          B
                        </button>
                        <button 
                          onClick={() => setSettings({...settings, roleItalic: !settings.roleItalic})}
                          className={cn("w-6 h-6 border flex items-center justify-center transition-all", settings.roleItalic ? "bg-white text-black border-white" : "border-white/10 text-zinc-500")}
                        >
                          I
                        </button>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 space-y-4">
                       <SliderWithControls 
                        label="Opacity"
                        value={settings.roleOpacity}
                        onChange={(val) => setSettings({...settings, roleOpacity: val})}
                        min={0}
                        max={1}
                        step={0.1}
                        precision={1}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-zinc-500">
                      <span>Professional Names</span>
                      <div className="flex gap-1 items-center">
                        <button 
                          onClick={() => setSettings({...settings, namesBold: !settings.namesBold})}
                          className={cn("w-6 h-6 border flex items-center justify-center transition-all", settings.namesBold ? "bg-white text-black border-white" : "border-white/10 text-zinc-500")}
                        >
                          B
                        </button>
                        <button 
                          onClick={() => setSettings({...settings, namesItalic: !settings.namesItalic})}
                          className={cn("w-6 h-6 border flex items-center justify-center transition-all", settings.namesItalic ? "bg-white text-black border-white" : "border-white/10 text-zinc-500")}
                        >
                          I
                        </button>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 space-y-4">
                       <SliderWithControls 
                        label="Opacity"
                        value={settings.namesOpacity}
                        onChange={(val) => setSettings({...settings, namesOpacity: val})}
                        min={0}
                        max={1}
                        step={0.1}
                        precision={1}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-2 block">Overlay Effects</label>
                    <div className="grid grid-cols-2 gap-2">
                       <button 
                         onClick={() => setSettings({...settings, showNoise: !settings.showNoise})}
                         className={cn(
                           "h-10 border text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                           settings.showNoise ? "bg-white text-black border-white" : "border-white/10 text-zinc-500 hover:bg-white/5"
                         )}
                       >
                         {settings.showNoise ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                         FILM GRAIN
                       </button>
                       <button 
                         onClick={() => setSettings({...settings, showScanlines: !settings.showScanlines})}
                         className={cn(
                           "h-10 border text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                           settings.showScanlines ? "bg-white text-black border-white" : "border-white/10 text-zinc-500 hover:bg-white/5"
                         )}
                       >
                         {settings.showScanlines ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                         SCANLINES
                       </button>
                    </div>
                    <div className="mt-4">
                      <SliderWithControls 
                        label="Vignette"
                        value={settings.vignette}
                        onChange={(val) => setSettings({...settings, vignette: val})}
                        min={0}
                        max={1}
                        step={0.1}
                        precision={1}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Canvas Category */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2 sm:space-y-3"
        >
          <label className="text-[8px] sm:text-[9px] uppercase font-bold tracking-[0.2em] text-zinc-600 block">4. Backdrop</label>
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveConsole(activeConsole === 'bg' ? 'none' : 'bg')}
              className={cn(
                "w-full border p-2 sm:p-2.5 flex items-center justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all",
                activeConsole === 'bg' ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "border-white/10 hover:bg-white/5"
              )}
            >
              CANVAS
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeConsole === 'bg' && "rotate-90")} />
            </motion.button>
            <AnimatePresence>
              {activeConsole === 'bg' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-[calc(100vw-48px)] sm:w-[350px] lg:w-[450px] border border-white/20 bg-zinc-950 z-[250] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-6 sm:p-8 space-y-6"
                >
                  <button 
                    onClick={() => setSettings({...settings, transparentBg: !settings.transparentBg})}
                    className="w-full h-10 px-3 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] group border border-white/10 hover:border-white/30 transition-all"
                  >
                    <span className={settings.transparentBg ? "text-white" : "text-zinc-600"}>Transparent</span>
                    {settings.transparentBg ? <CheckSquare className="w-4 h-4 text-white" /> : <Square className="w-4 h-4 text-zinc-700" />}
                  </button>
                  
                  <div className={cn("space-y-4 transition-all duration-300", settings.transparentBg ? "opacity-20 pointer-events-none grayscale" : "opacity-100")}>
                    <div className="flex items-center gap-3 bg-black border border-white/10 p-2.5">
                      <div className="w-6 h-6 rounded-none relative overflow-hidden flex-shrink-0" style={{ backgroundColor: settings.bgColor }}>
                        <input 
                          type="color" 
                          value={settings.bgColor}
                          onChange={(e) => setSettings({...settings, bgColor: e.target.value})}
                          className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                          disabled={settings.transparentBg}
                        />
                      </div>
                      <span className="text-[10px] font-mono opacity-40 select-none">{settings.bgColor.toUpperCase()}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const CreditItem = ({ 
  item, 
  selectedIds, 
  toggleSelect, 
  openSettingsId, 
  setOpenSettingsId, 
  startEditing, 
  removeRole 
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
          selectedIds.has(item.id) ? "bg-white text-black border-white" : "border-white/20 hover:border-white"
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
            <div className={cn("text-[9px] font-black uppercase tracking-widest mb-1", selectedIds.has(item.id) ? "text-black" : "text-white/40")}>{item.role}</div>
            <div className="text-[11px] font-bold uppercase truncate">{item.names.join(' / ')}</div>
          </div>
        </div>

        <div className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
          <div className="relative">
            <button 
              onClick={() => setOpenSettingsId(openSettingsId === item.id ? null : item.id)}
              className={cn(
                "p-2 border transition-all relative z-[110]",
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
                      className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center justify-between text-white border-b border-white/10"
                    >
                      Edit Tape
                    </button>
                    <button 
                      onClick={() => {
                        removeRole(item.id);
                        setOpenSettingsId(null);
                      }}
                      className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Delete Tape
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
  const [projectName, setProjectName] = useState(() => {
    const saved = localStorage.getItem('daftarkru_projectName');
    return saved || 'UNTITLED_PROJECT';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [credits, setCredits] = useState<CreditEntry[]>(() => {
    const saved = localStorage.getItem('daftarkru_credits');
    return saved ? JSON.parse(saved) : [
      { id: '1', role: 'DIRECTOR', names: ['AFGAN AL-FANANY'] },
      { id: '2', role: 'PRODUCED BY', names: ['AFGAN', 'AL-FANANY'] },
    ];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('daftarkru_settings');
    const defaultSettings = {
      fontFamily: 'Inter',
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
      showScanlines: false,
      vignette: 0,
    };
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
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
    if (history.length === 0) {
      setHistory([{ 
        credits: JSON.parse(JSON.stringify(credits)), 
        settings: JSON.parse(JSON.stringify(settings)) 
      }]);
    }
  }, []);

  useEffect(() => {
    if (isUndoing.current) {
      isUndoing.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setHistory(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        if (JSON.stringify(last.credits) === JSON.stringify(credits) && 
            JSON.stringify(last.settings) === JSON.stringify(settings)) {
          return prev;
        }
        const updated = [...prev, { 
          credits: JSON.parse(JSON.stringify(credits)), 
          settings: JSON.parse(JSON.stringify(settings)) 
        }];
        return updated.slice(-50);
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
    localStorage.setItem('daftarkru_credits', JSON.stringify(credits));
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

  // Timer for fade/zoom/blur/slide/glitch in preview
  useEffect(() => {
    if (settings.animationType === 'scroll' || credits.length === 0) return;

    const interval = setInterval(() => {
      setFadeIndex(prev => (prev + 1) % credits.length);
    }, settings.animationDuration * 1000); 

    return () => clearInterval(interval);
  }, [settings.animationType, settings.animationDuration, credits.length]);

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
          ? { ...c, role: newRole.toUpperCase(), names: newNames.split('\n').filter(n => n.trim() !== '').map(n => n.trim().toUpperCase()) } 
          : c
      );
      setCredits(updated);
      setEditingId(null);
    } else {
      const entry: CreditEntry = {
        id: Date.now().toString(),
        role: newRole.toUpperCase(),
        names: newNames.split('\n').filter(n => n.trim() !== '').map(n => n.trim().toUpperCase())
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
      setNewNames(tape.names.join('\n'));
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


  useEffect(() => {
    if ((settings.animationType === 'fade' || settings.animationType === 'zoom') && credits.length > 0) {
      const interval = setInterval(() => {
        setFadeIndex(prev => (prev + 1) % credits.length);
      }, (20 / (1 * credits.length)) * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.animationType, credits.length]);


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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history]);

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
        backgroundColor: settings.transparentBg ? 'transparent' : settings.bgColor,
        pixelRatio: 1,
        width: canvasWidth,
        height: scrollHeight,
        cacheBust: true, // Try setting to true to force reload
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
          fontFamily: settings.fontFamily // Force target font
        },
        // Filter to avoid crashing on cross-origin stylesheets that don't have CORS headers
        filter: (node: any) => {
          if (node.tagName === 'LINK' || node.tagName === 'STYLE') {
            try {
              // Test if we can read the rules
              if (node.sheet && node.sheet.cssRules) return true;
              return false;
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
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          for (let i = 0; i < 1000; i++) {
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
            canvasWidth / 2, canvasHeight / 2, Math.max(canvasWidth, canvasHeight) / 1.2
          );
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(1, `rgba(0,0,0,${settings.vignette * 0.8})`);
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

  return (
    <div className={cn(
      "min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black",
      view === 'editor' ? "lg:h-screen lg:overflow-hidden flex flex-col" : "overflow-x-hidden"
    )}>
      <AnimatePresence mode="wait">
        {view === 'hero' ? (
          <div key="landing-wrapper" className="flex flex-col w-full">
            <Navbar />
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
              
              <div className="max-w-7xl space-y-12 md:space-y-16 z-10 w-full px-4 pt-32 pb-20">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="inline-flex items-center gap-4 px-4 py-2 border border-white/10 rounded-none bg-white/5 backdrop-blur-md mb-8"
                  >
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400">Next Generation Credits Engine</span>
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: false }}
                    whileHover={{ 
                      skewX: -5,
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black tracking-tighter uppercase leading-[0.75] whitespace-normal cursor-default select-none"
                  >
                    Daftar<span 
                      className="inline-block" 
                      style={{ 
                        WebkitTextStroke: '1px rgba(255,255,255,1)', 
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
                    className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.4em] font-light text-zinc-500 max-w-2xl mx-auto h-6 flex items-center justify-center py-8"
                  >
                    <TypingDescription />
                  </motion.div>
                </div>

                <div className="flex flex-col items-center gap-10">
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.8 }}
                    onClick={() => {
                      setView('editor');
                      window.scrollTo({ top: 0 });
                    }}
                    className="group relative px-12 sm:px-20 py-6 sm:py-8 text-[11px] sm:text-[13px] font-black uppercase tracking-[0.5em] transition-all overflow-hidden border border-white rounded-none"
                  >
                    <div className="absolute inset-0 bg-white translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1] z-0" />
                    <span className="relative z-10 text-white group-hover:text-black transition-colors duration-500 flex items-center gap-6">
                      Mulai Produksi
                      <Rocket className="w-5 h-5" />
                    </span>
                  </motion.button>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-[9px] text-zinc-700 uppercase tracking-[0.8em] font-black">Scroll_To_Explore</div>
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

            
            <AboutSection />
            <Marquee text="AUTOMATED CREDITS ENGINE" />
            <FAQSection />

            <footer className="py-20 border-t border-white/5 bg-black flex flex-col items-center justify-center space-y-8">
               <div className="text-xl sm:text-2xl font-black uppercase tracking-tighter">DaftarKru Engine</div>
               <div className="flex gap-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <a href="#" className="hover:text-white">Twitter</a>
                  <a href="#" className="hover:text-white">Instagram</a>
                  <a href="#" className="hover:text-white">GitHub</a>
               </div>
               <div className="text-[8px] sm:text-[10px] font-bold text-zinc-700 uppercase tracking-[0.5em]">
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
            <header className="h-16 md:h-20 border-b border-white flex items-center justify-between px-4 md:px-8 bg-black flex-shrink-0">
              <div 
                className="flex flex-col cursor-pointer group"
                onClick={() => setView('hero')}
              >
                <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none group-hover:text-zinc-500 transition-colors">
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
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Undo</span>
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
                      <h2 className="text-sm font-black uppercase tracking-widest">Project Options</h2>
                      <button onClick={() => setIsMenuOpen(false)} className="hover:rotate-10 transition-transform">
                        <X className="w-6 h-6 border border-white p-1" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col flex-1 h-full">
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Project Name</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={projectName}
                              onChange={(e) => setProjectName(e.target.value.toUpperCase())}
                              className="flex-1 bg-black border border-white p-4 text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-white transition-all rounded-none"
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
                      </div>
                      
                      <div className="mt-auto">
                        <button 
                          onClick={() => { setView('hero'); setIsMenuOpen(false); }}
                          className="w-full bg-white text-black p-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all rounded-none"
                        >
                          <Home className="w-4 h-4" />
                          Kembali ke Home
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
                        <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-[0.4em] text-white">
                          RENDERING
                        </h2>
                        <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 font-bold max-w-sm mx-auto leading-relaxed">
                          Generating frames for <span className="text-white">{projectName}</span>
                        </p>
                      </div>

                      <div className="relative py-16 flex flex-col items-center">
                        <div className="text-[8rem] sm:text-[10rem] font-black tabular-nums tracking-tighter text-white opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
                          {exportProgress}%
                        </div>
                        
                        <div className="w-full space-y-6 relative z-10">
                          <div className="flex justify-between items-end">
                             <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                               <div className="w-2 h-2 bg-white animate-pulse" />
                               <span>Processing Studio Stream</span>
                             </div>
                             <div className="text-2xl font-mono font-black text-white">{exportProgress}%</div>
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
                          <div className="text-[8px] uppercase tracking-widest text-zinc-600 font-black">Resolution</div>
                          <div className="text-[10px] font-mono font-bold">1920 X 1080</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-[8px] uppercase tracking-widest text-zinc-600 font-black">Framerate</div>
                          <div className="text-[10px] font-mono font-bold">60 FPS</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-[8px] uppercase tracking-widest text-zinc-600 font-black">Format</div>
                          <div className="text-[10px] font-mono font-bold">WEBM / VP9</div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls Column (Left) */}
              <aside className="w-full lg:w-[380px] border-b lg:border-b-0 lg:border-r border-white lg:overflow-y-auto lg:scrollbar-hide bg-black p-4 md:p-6 space-y-12 order-2 lg:order-1 flex-shrink-0">
                {/* Management Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white pb-3">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.4em]">Credit Input</h2>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="ROLE NAME (e.g. DIRECTOR)"
                      className="w-full bg-black border border-white p-4 text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-white rounded-none placeholder:text-zinc-700 font-mono"
                    />
                    <textarea 
                      value={newNames}
                      onChange={(e) => setNewNames(e.target.value)}
                      placeholder="PERSON NAMES (ENTER PER LINE)"
                      className="w-full h-32 bg-black border border-white p-4 text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-white rounded-none resize-none placeholder:text-zinc-700 font-mono"
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
                        className="w-full border border-white/20 text-white p-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all font-mono"
                      >
                        Cancel Editing
                      </button>
                    )}
                  </div>
                </div>

                {/* Tape List Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white pb-3">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.4em]">Tape List</h2>
                    <div className="flex gap-4">
                      {selectedIds.size > 0 && (
                        <button 
                          onClick={bulkDelete}
                          className="text-[10px] font-bold text-red-500 hover:scale-105 transition-transform uppercase tracking-widest"
                        >
                          Delete ({selectedIds.size})
                        </button>
                      )}
                      <button 
                        onClick={toggleSelectAll}
                        className="text-[10px] font-black hover:text-zinc-400 transition-colors uppercase tracking-[0.15em]"
                      >
                        {selectedIds.size === credits.length ? 'Unselect' : 'Select All'}
                      </button>
                    </div>
                  </div>
                  
                  <Reorder.Group 
                    axis="y" 
                    values={credits} 
                    onReorder={(newOrder) => {
                      setCredits(newOrder);
                    }}
                    className={cn("space-y-2", isExporting && "hidden")}
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
                      />
                    ))}
                    {credits.length === 0 && (
                      <p className="text-[10px] text-zinc-600 uppercase tracking-widest text-center py-8 italic font-light">List is empty</p>
                    )}
                  </Reorder.Group>
                </div>

                {/* Console Section (Mobile only) */}
                <div className="space-y-12 lg:hidden">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white pb-2">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Visual Console</h2>
                    </div>
                    <ConsoleContent 
                      settings={settings} 
                      setSettings={setSettings} 
                      activeConsole={activeConsole} 
                      setActiveConsole={setActiveConsole}
                    />
                  </div>

                  <div className="space-y-6">
                    <TuningControls settings={settings} setSettings={setSettings} />
                  </div>

                  {/* Move Export here for Mobile */}
                  <div className="pt-6 border-t border-white/20">
                    <button 
                      onClick={recordVideo}
                      disabled={isExporting}
                      className="w-full bg-white text-black border border-white py-4 text-[12px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-20 rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                    >
                      {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />}
                      {isExporting ? `Exporting ${exportProgress}%` : 'RENDER & EXPORT'}
                    </button>
                  </div>
                </div>
              </aside>

              {/* Preview & Desktop Console Container */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#050505] order-1 lg:order-2 sticky top-0 lg:static z-[150] shadow-[0_10px_30px_rgba(0,0,0,0.5)] lg:shadow-none border-b border-white/20 lg:border-b-0 backdrop-blur-md">
                <main className="flex-1 p-4 sm:p-12 md:p-20 lg:p-12 flex flex-col items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[450px] md:min-h-0 relative">
                  <div className="w-full max-w-[1400px] max-h-[75vh] aspect-video relative border border-white/10 group shadow-[0_0_100px_rgba(255,255,255,0.05)] overflow-hidden bg-black ring-1 ring-white/5">
                    {/* Viewport Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-6 grid-rows-6 opacity-0 lg:group-hover:opacity-10 transition-opacity z-20">
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
                        <div 
                          ref={scrollRef}
                          className={cn(
                            "absolute transition-all ease-linear will-change-transform z-10",
                            settings.animationType !== 'scroll' ? "opacity-0 pointer-events-none" : "",
                            settings.direction
                          )}
                          style={{
                            fontFamily: settings.fontFamily,
                            textAlign: 'center',
                            left: `50%`,
                            top: 0,
                            animationName: settings.animationType === 'scroll' ? `scroll-${settings.direction}` : 'none',
                            animationDuration: `30s`,
                            animationTimingFunction: 'linear',
                            animationIterationCount: 'infinite',
                            width: `100%`,
                            maxWidth: `${DESIGN_BASE_WIDTH}px`,
                            transform: `translate(-50%, 1080px)`,
                            fontSize: `${settings.fontSize}px`,
                          }}
                        >
                            <div className="flex flex-col pt-0 pb-0" style={{ gap: `${settings.marginBlock}px` }}>
                              {credits.length === 0 ? (
                                <div className="text-center text-white/5 uppercase tracking-[1em] text-[20px] py-40 font-black">NO_DATA_SOURCE</div>
                              ) : (
                                credits.map((item) => (
                                  <div 
                                    key={item.id} 
                                    className="credit-block w-full flex flex-col items-center"
                                  >
                                    <div 
                                      className="w-full flex flex-col items-center"
                                      style={{ 
                                        textAlign: 'center',
                                        maxWidth: `80%`,
                                      }}
                                    >
                                      <div 
                                        className="role-text uppercase tracking-[0.8em] w-full break-words"
                                        style={{ 
                                          fontSize: `${settings.roleFontSize}px`,
                                          marginBottom: `${settings.roleNameGap}px`,
                                          color: settings.roleColor,
                                          opacity: settings.roleOpacity,
                                          fontWeight: settings.roleBold ? 900 : 500,
                                          fontStyle: settings.roleItalic ? 'italic' : 'normal',
                                          textAlign: 'center',
                                        }}
                                      >
                                        {item.role}
                                      </div>
                                      <div 
                                        className="names-text leading-tight tracking-[0.5em] uppercase w-full flex flex-col items-center"
                                        style={{ 
                                          fontSize: `${settings.fontSize}px`,
                                          lineHeight: settings.lineHeight,
                                          gap: `${settings.namesGap}px`,
                                          color: settings.namesColor,
                                          opacity: settings.namesOpacity,
                                          fontWeight: settings.namesBold ? 700 : 500,
                                          fontStyle: settings.namesItalic ? 'italic' : 'normal',
                                          textAlign: 'center',
                                        }}
                                      >
                                        {item.names.map((name, i) => (
                                          <div key={i} className="break-words w-full" style={{ textAlign: 'center' }}>{name}</div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))
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
                                    fontFamily: settings.fontFamily,
                                    textAlign: 'center',
                                    width: `100%`,
                                  }}
                                >
                                  <div 
                                    className="flex flex-col items-center"
                                    style={{
                                      width: `100%`,
                                      maxWidth: `80%`,
                                    }}
                                  >
                                    <div 
                                      className="uppercase tracking-[0.8em] w-full break-words"
                                      style={{ 
                                        fontSize: `${settings.roleFontSize}px`,
                                        marginBottom: `${settings.roleNameGap}px`,
                                        color: settings.roleColor,
                                        opacity: settings.roleOpacity,
                                        fontWeight: settings.roleBold ? 900 : 500,
                                        fontStyle: settings.roleItalic ? 'italic' : 'normal',
                                        textAlign: 'center',
                                      }}
                                    >
                                      {credits[fadeIndex % credits.length].role}
                                    </div>
                                    <div 
                                      className="leading-tight tracking-[0.5em] uppercase w-full flex flex-col items-center"
                                      style={{ 
                                        fontSize: `${settings.fontSize}px`,
                                        lineHeight: settings.lineHeight,
                                        gap: `${settings.namesGap}px`,
                                        color: settings.namesColor,
                                        opacity: settings.namesOpacity,
                                        fontWeight: settings.namesBold ? 700 : 500,
                                        fontStyle: settings.namesItalic ? 'italic' : 'normal',
                                        textAlign: 'center',
                                      }}
                                    >
                                      {credits[fadeIndex % credits.length].names.map((name, i) => (
                                        <div key={i} className="break-words w-full" style={{ textAlign: 'center' }}>{name}</div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Effects Layer - ensuring they are over everything */}
                        <div className="absolute inset-0 z-[100] pointer-events-none">
                          {settings.showNoise && (
                            <div className="absolute inset-0 opacity-20 noise-overlay" />
                          )}
                          {settings.showScanlines && (
                            <div className="absolute inset-0 opacity-30 scanline-effect z-50 pointer-events-none" />
                          )}
                          {settings.vignette > 0 && (
                            <div 
                              className="absolute inset-0" 
                              style={{ 
                                background: `radial-gradient(circle, transparent ${100 - settings.vignette * 100}%, rgba(0,0,0,${settings.vignette * 0.8}) 100%)` 
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
                    <div className="hidden lg:block border-t border-white bg-black flex-shrink-0 relative z-[200]">
                      <div className="px-8 py-3 border-b border-white/10">
                         <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Visual Designer</h2>
                      </div>
                      <div className="px-8 py-6">
                        <ConsoleContent 
                          settings={settings} 
                          setSettings={setSettings} 
                          activeConsole={activeConsole} 
                          setActiveConsole={setActiveConsole}
                        />

                        {/* Export Button for Desktop */}
                        <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
                          <button 
                            onClick={recordVideo}
                            className="min-w-[200px] bg-white text-black py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all rounded-none"
                          >
                            RENDER & EXPORT
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fine Tuning Panel (Right) */}
                  <aside className="hidden lg:block w-[380px] border-l border-white bg-black p-8 overflow-y-auto scrollbar-hide order-3 flex-shrink-0">
                    <TuningControls settings={settings} setSettings={setSettings} />
                  </aside>
                </div>

            {/* Micro Footer */}
            <footer className="h-10 border-t border-white px-4 md:px-8 flex items-center justify-between text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-zinc-600 flex-shrink-0">
              <div className="flex gap-4 md:gap-8">
                <span className="flex items-center gap-2">Version 1</span>
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
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Preview Mode: High Fidelity</span>
              </div>
              <button 
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:bg-white hover:text-black transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <Minimize className="w-4 h-4" />
                Exit Fullscreen
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
                    
                    <div 
                      className={cn(
                        "absolute transition-all ease-linear will-change-transform z-10",
                        settings.animationType !== 'scroll' ? "opacity-0 pointer-events-none" : "",
                        settings.direction
                      )}
                      style={{
                        fontFamily: settings.fontFamily,
                        textAlign: 'center',
                        left: `50%`,
                        top: 0,
                        animationName: settings.animationType === 'scroll' ? `scroll-${settings.direction}` : 'none',
                        animationDuration: `30s`,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        width: `100%`,
                        maxWidth: `${DESIGN_BASE_WIDTH}px`,
                        transform: `translate(-50%, 1080px)`,
                        fontSize: `${settings.fontSize}px`,
                      }}
                    >
                      <div className="flex flex-col pt-0 pb-0" style={{ gap: `${settings.marginBlock}px` }}>
                        {credits.map((item) => (
                           <div key={item.id} className="credit-block w-full flex flex-col items-center">
                             <div className="w-full flex flex-col items-center" style={{ textAlign: 'center', maxWidth: `80%` }}>
                               <div className="role-text uppercase tracking-[0.8em] w-full" style={{ fontSize: `${settings.roleFontSize}px`, marginBottom: `${settings.roleNameGap}px`, color: settings.roleColor, opacity: settings.roleOpacity, fontWeight: settings.roleBold ? 900 : 500, fontStyle: settings.roleItalic ? 'italic' : 'normal', textAlign: 'center' }}>{item.role}</div>
                               <div className="names-text leading-tight tracking-[0.5em] uppercase w-full flex flex-col items-center" style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight, gap: `${settings.namesGap}px`, color: settings.namesColor, opacity: settings.namesOpacity, fontWeight: settings.namesBold ? 700 : 500, fontStyle: settings.namesItalic ? 'italic' : 'normal', textAlign: 'center' }}>
                                 {item.names.map((name, i) => (<div key={i} className="break-words w-full" style={{ textAlign: 'center' }}>{name}</div>))}
                               </div>
                             </div>
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
                              style={{ fontFamily: settings.fontFamily, textAlign: 'center', width: `100%` }}
                            >
                              <div className="flex flex-col items-center" style={{ width: `100%`, maxWidth: `80%` }}>
                                <div className="uppercase tracking-[0.8em] w-full" style={{ fontSize: `${settings.roleFontSize}px`, marginBottom: `${settings.roleNameGap}px`, color: settings.roleColor, opacity: settings.roleOpacity, fontWeight: settings.roleBold ? 900 : 500, fontStyle: settings.roleItalic ? 'italic' : 'normal', textAlign: 'center' }}>{credits[fadeIndex % credits.length].role}</div>
                                <div className="leading-tight tracking-[0.5em] uppercase w-full flex flex-col items-center" style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight, gap: `${settings.namesGap}px`, color: settings.namesColor, opacity: settings.namesOpacity, fontWeight: settings.namesBold ? 700 : 500, fontStyle: settings.namesItalic ? 'italic' : 'normal', textAlign: 'center' }}>
                                  {credits[fadeIndex % credits.length].names.map((name, i) => (<div key={i} className="break-words w-full" style={{ textAlign: 'center' }}>{name}</div>))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Effects Layer */}
                    <div className="absolute inset-0 z-[100] pointer-events-none">
                      {settings.showNoise && (
                        <div className="absolute inset-0 opacity-20 noise-overlay" />
                      )}
                      {settings.showScanlines && (
                        <div className="absolute inset-0 opacity-30 scanline-effect z-50 pointer-events-none" />
                      )}
                      {settings.vignette > 0 && (
                        <div 
                          className="absolute inset-0" 
                          style={{ 
                            background: `radial-gradient(circle, transparent ${100 - settings.vignette * 100}%, rgba(0,0,0,${settings.vignette * 0.8}) 100%)` 
                          }} 
                        />
                      )}
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Bebas+Neue&family=Bungee&family=Cormorant+Garamond:wght@300;400;700&family=Fraunces:opsz,wght@9..144,300;400;700;900&family=Inter:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@400;700&family=Kanit:wght@300;400;700;900&family=Manrope:wght@400;700;800&family=Montserrat:wght@400;700;900&family=Oswald:wght@300;400;700&family=Playfair+Display:wght@400;700;900&family=Plus+Jakarta+Sans:wght@400;700;800&family=Poppins:wght@300;400;500;700&family=Roboto+Mono:wght@400;700&family=Sora:wght@400;700;800&family=Space+Grotesk:wght@300;400;700&family=Syne:wght@400;700;800&family=Teko:wght@300;400;700&family=Unbounded:wght@300;400;700;900&display=swap');

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
        }
      `}</style>
    </div>
  );
}
