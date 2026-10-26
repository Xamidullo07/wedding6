import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Heart,
  MapPin,
  Clock,
  CalendarDays,
  ChevronDown,
  LockKeyhole,
  ArrowRight,
  Music2,
  Pause,
  Play,
} from 'lucide-react';

/* =========================================================
   MA'LUMOTLAR: taklifnomadagi hamma narsa shu yerdan olinadi
   ========================================================= */

const GROOM = 'Bexruzbek';
const BRIDE = 'Nodiraxon';

// Toshkent vaqti (+05:00) bilan, mehmonning telefon vaqtidan qat'i nazar
const WEDDING_DATE = new Date('2026-11-01T17:00:00+05:00');
const DATE_SHORT = '01 · 11 · 2026';
const DATE_LONG = '1 Noyabr 2026';
const DATE_FOOTER = '01.11.2026';
const WEEKDAY = 'Yakshanba';
const TIME_TEXT = '17:00';

const VENUE_NAME = 'Zarkent qishlogʻi';
const HOST_FAMILY = 'Ganiyevlar oilasi';

// Zarkent qishlogʻining Google Maps havolasini shu yerga qoʻying.
// Boʻsh qolsa, "Lokatsiyani ochish" tugmasi koʻrinmaydi.
const MAP_URL = '';

// public/musiqa.mp3 faylidan foydalanadi
const MUSIC_SRC = '/musiqa.mp3';

/* =========================
   YORDAMCHI HOOK'LAR
   ========================= */

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const rawDiff = target.getTime() - now.getTime();
  const diff = Math.max(0, rawDiff);

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    isOver: rawDiff <= 0,
  };
}

function useWeddingMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audioRef.current = null;
    };
  }, []);

  const start = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Musiqa ishga tushmadi:', error);
    }
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const toggle = async () => {
    if (isPlaying) pause();
    else await start();
  };

  return { isPlaying, start, pause, toggle };
}

/* =========================
   KICHIK KOMPONENTLAR
   ========================= */

/** Ikki oltin uzuk */
function Rings({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <circle cx="46" cy="44" r="26" />
      <circle cx="74" cy="44" r="26" />
      <path d="M60 8 66 14 60 20 54 14Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Divider() {
  return (
    <div className="my-10 flex items-center justify-center gap-4 text-gold-500">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold-400/70 sm:w-28" />
      <Rings className="h-6 w-9" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold-400/70 sm:w-28" />
    </div>
  );
}

/** Ekranga kirganda yumshoq paydo bo'ladi */
function Reveal({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out motion-reduce:transition-none ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const padded = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div className="glass-panel flex h-20 w-[4.4rem] items-center justify-center rounded-sm sm:h-28 sm:w-28">
        <span className="font-display text-3xl font-semibold tabular-nums text-deep-900 sm:text-5xl">
          {padded}
        </span>
      </div>
      <span className="mt-3 font-sans text-[10px] uppercase tracking-[0.2em] text-muted sm:text-xs">
        {label}
      </span>
    </div>
  );
}

function FallingPetals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${(i * 7.3 + 5) % 100}%`,
        delay: `${-((i * 1.7) % 14)}s`,
        duration: `${12 + (i % 5) * 2}s`,
        size: 8 + (i % 4) * 4,
        opacity: 0.3 + (i % 3) * 0.12,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-petal-fall"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: p.opacity,
          }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C14 8 20 10 18 16C16 22 12 20 12 20C12 20 8 22 6 16C4 10 10 8 12 2Z"
              fill="#cfa557"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* =========================
   MUQOVA
   ========================= */

function InvitationCover({
  leaving,
  onOpen,
}: {
  leaving: boolean;
  onOpen: () => void;
}) {
  return (
    <section
      aria-label="Taklifnoma muqovasi"
      className={`invitation-cover bg-night pattern-overlay fixed inset-0 z-50 isolate overflow-y-auto text-deep-800 transition-opacity duration-700 ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative z-10 flex min-h-full items-center justify-center px-5 py-10">
        <div className="frame-double relative w-full max-w-[400px] bg-gradient-to-b from-paper-50 to-paper-100 px-9 py-14 text-center">
          <span className="corner corner-tl" />
          <span className="corner corner-tr" />
          <span className="corner corner-bl" />
          <span className="corner corner-br" />

          <Rings className="mx-auto mb-5 h-14 w-20 text-gold-500" />

          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-gold-700">
            Fotiha oshiga taklifnoma
          </p>

          <h1 className="mt-6 font-display text-5xl font-semibold italic leading-[1] text-deep-900 sm:text-6xl">
            {GROOM}
            <span className="my-1 block text-3xl font-medium text-gold-600">
              va
            </span>
            {BRIDE}
          </h1>

          <div className="my-7 flex items-center justify-center gap-4 text-gold-600">
            <span className="h-px w-10 bg-gold-400/60" />
            <span className="font-sans text-xs tracking-[0.3em] text-deep-800">
              {DATE_SHORT}
            </span>
            <span className="h-px w-10 bg-gold-400/60" />
          </div>

          <p className="mx-auto max-w-[28ch] font-display text-lg italic leading-snug text-muted">
            «Baʼzi uchrashuvlar tasodif emas, ular butun bir umrga yozilgan
            goʻzal hikoyaning boshlanishidir.»
          </p>

          <button
            type="button"
            onClick={onOpen}
            className="open-invitation-button mx-auto mt-9 flex items-center gap-3 rounded-full border border-gold-500/70 bg-white/70 py-1 pl-1 pr-5 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-deep-900 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 sm:text-xs"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-gold-200 to-gold-400 text-deep-900 shadow-lg">
              <LockKeyhole className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span>Ochish uchun bosing</span>
            <ArrowRight className="h-4 w-4 text-gold-600" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================
   ASOSIY SAHIFA
   ========================= */

type Phase = 'closed' | 'leaving' | 'open';

function App() {
  const [phase, setPhase] = useState<Phase>('closed');

  const { days, hours, minutes, seconds, isOver } =
    useCountdown(WEDDING_DATE);
  const { isPlaying, start, toggle } = useWeddingMusic();

  // Muqova ochiq turganida sahifa aylanmasin
  useEffect(() => {
    document.body.style.overflow = phase === 'open' ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  const handleOpen = () => {
    // Taklifnoma ochilganda musiqa boshlanadi
    start();
    setPhase('leaving');
    window.setTimeout(() => setPhase('open'), 700);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-paper-100 font-sans text-deep-800">
      {phase !== 'open' && (
        <InvitationCover leaving={phase === 'leaving'} onOpen={handleOpen} />
      )}

      {/* Musiqa tugmasi */}
      {phase === 'open' && (
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? 'Musiqani toʻxtatish' : 'Musiqani yoqish'}
          className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-40 flex h-12 w-12 items-center justify-center rounded-full border border-gold-400/70 bg-white/90 text-gold-700 shadow-lg backdrop-blur-md transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" strokeWidth={1.6} />
          ) : (
            <Play className="ml-0.5 h-5 w-5" strokeWidth={1.6} />
          )}
          <Music2
            className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gold-400 p-0.5 text-deep-900"
            strokeWidth={2}
          />
        </button>
      )}

      <FallingPetals />

      {/* Hero */}
      <section className="bg-soft pattern-overlay pattern-overlay-soft relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 py-20 text-center">
        <div className="frame-inner" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(214,236,228,0.8),transparent_62%)]" />

        <div className="animate-fade-in relative z-10 mx-auto max-w-2xl">
          <p className="font-sans text-xs uppercase tracking-[0.4em] text-gold-700">
            Fotiha oshi taklifnomasi
          </p>

          <Rings className="mx-auto my-8 h-20 w-28 animate-float text-gold-500" />

          <h1 className="font-display text-6xl font-semibold italic leading-[0.95] sm:text-8xl">
            <span className="text-gold-gradient">{GROOM}</span>
            <span className="my-2 block text-4xl font-medium text-gold-600 sm:text-5xl">
              va
            </span>
            <span className="text-gold-gradient">{BRIDE}</span>
          </h1>

          <p className="mt-9 font-sans text-sm tracking-[0.35em] text-deep-800">
            {DATE_SHORT}
          </p>

          <p className="mx-auto mt-6 max-w-md font-display text-xl italic leading-relaxed text-muted sm:text-2xl">
            «Ikki yurak bir boʻlib birlashganda, muhabbat hikoyasi boshlanadi»
          </p>

          <div className="mt-12 animate-bounce">
            <ChevronDown
              className="mx-auto h-6 w-6 text-gold-500"
              strokeWidth={1.2}
            />
          </div>
        </div>
      </section>

      {/* Taklif */}
      <section className="relative mx-auto max-w-3xl px-6 py-24 text-center">
        <Reveal>
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold-700">
            Hurmatli mehmonlar
          </p>

          <h2 className="mt-5 text-balance font-display text-4xl font-semibold leading-tight text-deep-900 sm:text-5xl">
            Sizni farzandlarimizning fotiha oshiga taklif etamiz
          </h2>

          <Divider />

          <p className="mx-auto max-w-xl font-display text-xl leading-relaxed text-muted sm:text-2xl">
            Hayotimizdagi eng quvonchli kunda aziz doʻst va yaqinlarimiz bilan
            birga boʻlishni istaymiz.
          </p>
        </Reveal>
      </section>

      {/* Sana va vaqt */}
      <section className="relative px-5 pb-8">
        <Reveal className="glass-panel mx-auto grid max-w-2xl grid-cols-1 divide-y divide-gold-400/25 rounded-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="p-8 text-center">
            <CalendarDays
              className="mx-auto mb-4 h-8 w-8 text-gold-500"
              strokeWidth={1.2}
            />
            <p className="font-sans text-xs uppercase tracking-[0.25em] text-muted">
              Sana
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-deep-900">
              {DATE_LONG}
            </p>
            <p className="mt-1 font-display text-lg italic text-gold-700">
              {WEEKDAY}
            </p>
          </div>

          <div className="p-8 text-center">
            <Clock
              className="mx-auto mb-4 h-8 w-8 text-gold-500"
              strokeWidth={1.2}
            />
            <p className="font-sans text-xs uppercase tracking-[0.25em] text-muted">
              Boshlanishi
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-deep-900">
              {TIME_TEXT}
            </p>
            <p className="mt-1 font-display text-lg italic text-gold-700">
              Toshkent vaqti bilan
            </p>
          </div>
        </Reveal>
      </section>

      {/* Manzil */}
      <section className="relative mx-auto max-w-3xl px-6 py-20 text-center">
        <Reveal>
          <MapPin
            className="mx-auto mb-6 h-10 w-10 text-gold-500"
            strokeWidth={1.1}
          />

          <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold-700">
            Manzil
          </p>

          <h3 className="mt-4 text-balance font-display text-4xl font-semibold text-deep-900 sm:text-5xl">
            {VENUE_NAME}
          </h3>

          {/* <p className="mx-auto mb-8 mt-3 max-w-md font-display text-xl italic text-muted">
            {HOST_FAMILY} mehmonlarni shu yerda kutadi
          </p> */}

          {MAP_URL && (
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-gold-200 via-gold-300 to-gold-400 px-8 py-3.5 font-sans text-xs font-medium uppercase tracking-[0.18em] text-deep-900 shadow-lg transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <MapPin className="h-5 w-5" strokeWidth={1.6} />
              <span>Lokatsiyani ochish</span>
            </a>
          )}
        </Reveal>
      </section>

      {/* Sanoq */}
      <section className="relative mx-auto max-w-3xl px-6 py-20 text-center">
        <Reveal>
          <Divider />

          <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold-700">
            Fotiha oshigacha qolgan vaqt
          </p>

          {isOver ? (
            <p className="mt-8 font-display text-4xl italic text-gold-600">
              Fotiha oshi boshlandi. Tabriklaymiz!
            </p>
          ) : (
            <div className="mt-10 flex justify-center gap-3 sm:gap-8">
              <CountdownUnit value={days} label="Kun" />
              <CountdownUnit value={hours} label="Soat" />
              <CountdownUnit value={minutes} label="Daqiqa" />
              <CountdownUnit value={seconds} label="Soniya" />
            </div>
          )}
        </Reveal>
      </section>

      {/* Iqtibos */}
      <section className="relative mx-auto max-w-2xl px-6 py-24 text-center">
        <Reveal>
          <Heart
            className="mx-auto mb-8 h-12 w-12 animate-float text-gold-500"
            strokeWidth={1}
            fill="currentColor"
          />

          <p className="text-gold-gradient font-display text-3xl font-semibold italic leading-relaxed sm:text-4xl">
            «Sevgi — bu ikki kishining bir-biriga bergan vaʼdasi»
          </p>

          <p className="mt-8 font-sans text-xs uppercase tracking-[0.25em] text-muted">
            {GROOM} &amp; {BRIDE}
          </p>
        </Reveal>
      </section>

      {/* Yakuniy qism */}
      <section className="bg-night pattern-overlay relative isolate overflow-hidden px-6 py-28 text-center sm:py-36">
        <Reveal>
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-[#e6c987]">
            Hurmat bilan
          </p>

          {/* <p className="text-gold-light-gradient mt-4 font-display text-5xl font-semibold italic leading-tight sm:text-6xl">
            {HOST_FAMILY}
          </p> */}

          <div className="mx-auto mt-12 flex max-w-sm justify-center gap-6">
            {[GROOM, BRIDE].map((name) => (
              <div
                key={name}
                className="glass-panel-dark flex h-36 w-32 flex-col items-center justify-center rounded-sm transition-transform hover:-translate-y-1 sm:h-40 sm:w-36"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-100 via-gold-300 to-gold-400 font-display text-3xl font-semibold text-deep-900 shadow-inner">
                  {name.charAt(0)}
                </span>
                <span className="mt-4 font-display text-xl italic text-[#f6efdc]">
                  {name}
                </span>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-12 max-w-md font-display text-xl leading-relaxed text-[#f6efdc]/80 sm:text-2xl">
            Sizni {GROOM} va {BRIDE}ning fotiha oshining aziz mehmoni boʻlishga
            taklif qilamiz. Qalblar ezgulikka toʻla boʻlgan ushbu qutlugʻ kunda
            yaqinlarimiz yonida boʻling!
          </p>

          <div className="mx-auto mt-20 h-14 w-px bg-gradient-to-b from-[#e6c987]/80 to-transparent" />
        </Reveal>
      </section>

      {/* Pastki qism */}
      <footer className="relative border-t border-gold-400/30 bg-[#082322] px-6 py-16 text-center">
        <Rings className="mx-auto mb-5 h-10 w-14 text-[#cfa557]" />

        <p className="font-display text-3xl italic text-[#f6efdc]">
          {GROOM} &amp; {BRIDE}
        </p>

        <p className="mt-3 font-sans text-xs uppercase tracking-[0.25em] text-[#e6c987]/80">
          {DATE_FOOTER}
        </p>
      </footer>
    </div>
  );
}

export default App;