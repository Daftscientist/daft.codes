"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

const MapSection = dynamic(() => import("./MapSection"), {
  ssr: false,
  loading: () => (
    <div className="map-wrap r rd1 v" style={{ background: "var(--onyx)" }} />
  ),
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.daftscientist.dev";

interface SpotifyTrack {
  is_playing: boolean;
  track: string;
  artist: string;
  album: string;
  album_art: string;
  url: string;
}

export default function HomePage() {
  const curRef = useRef<HTMLDivElement>(null);
  const dotFillRef = useRef<HTMLSpanElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const suggestInputRef = useRef<HTMLInputElement>(null);
  const [suggestStatus, setSuggestStatus] = useState("");
  const [suggestClass, setSuggestClass] = useState("suggest-status");
  const [suggestDisabled, setSuggestDisabled] = useState(false);
  const [spotify, setSpotify] = useState<SpotifyTrack | null>(null);

  // Cursor
  useEffect(() => {
    const cur = curRef.current;
    if (!cur) return;
    const move = (e: MouseEvent) => {
      cur.style.left = e.clientX + "px";
      cur.style.top = e.clientY + "px";
    };
    document.addEventListener("mousemove", move);

    const hoverables = document.querySelectorAll("a,button,.b,.proj,.map-pin");
    const enter = () => document.body.classList.add("ch");
    const leave = () => document.body.classList.remove("ch");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });

    return () => {
      document.removeEventListener("mousemove", move);
      hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  // Scroll progress
  useEffect(() => {
    const dotFill = dotFillRef.current;
    if (!dotFill) return;
    const onScroll = () => {
      const p = Math.min(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100,
        100
      );
      dotFill.style.height = p + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Clock
  useEffect(() => {
    const cl = clockRef.current;
    if (!cl) return;
    const tick = () => {
      cl.textContent = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Europe/London",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("v");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    document.querySelectorAll(".r").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Logo easter egg
  useEffect(() => {
    let lc = 0;
    let lt: ReturnType<typeof setTimeout>;
    const logo = logoRef.current;
    if (!logo) return;
    const handleClick = (e: Event) => {
      e.preventDefault();
      lc++;
      clearTimeout(lt);
      lt = setTimeout(() => (lc = 0), 1500);
      if (lc >= 7) {
        lc = 0;
        document.body.style.transition = "transform .6s cubic-bezier(.2,.8,.2,1)";
        document.body.style.transform = "rotate(360deg)";
        setTimeout(() => {
          document.body.style.transform = "";
          setTimeout(() => (document.body.style.transition = ""), 600);
        }, 700);
      }
    };
    logo.addEventListener("click", handleClick);
    return () => logo.removeEventListener("click", handleClick);
  }, []);

  // Console message
  useEffect(() => {
    console.log(
      "%cdaft.%c Try /terminal",
      "background:#484849;color:#fefefe;padding:4px 8px;border-radius:4px;font-weight:800;font-family:Gilroy,sans-serif;",
      "color:#4c4c4b;font-size:12px;"
    );
  }, []);

  // Spotify polling
  useEffect(() => {
    let cancelled = false;
    const fetchSpotify = async () => {
      try {
        const res = await fetch(`${API_BASE}/spotify/now-playing`);
        if (res.ok && !cancelled) {
          const data: SpotifyTrack = await res.json();
          setSpotify(data);
        }
      } catch {
        // Silently fail — we'll just show the fallback
      }
    };
    fetchSpotify();
    const id = setInterval(fetchSpotify, 30_000); // poll every 30s
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Project toggle
  const toggleProj = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const proj = e.currentTarget;
    proj.classList.toggle("open");
  }, []);

  // Song suggest
  const submitSuggestion = useCallback(async () => {
    const val = suggestInputRef.current?.value.trim();
    if (!val) return;
    setSuggestDisabled(true);

    try {
      const res = await fetch(`${API_BASE}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song: val }),
      });

      if (res.ok) {
        if (suggestInputRef.current) suggestInputRef.current.value = "";
        setSuggestStatus("Thanks, I'll check it out.");
        setSuggestClass("suggest-status ok");
      } else if (res.status === 429) {
        setSuggestStatus("Too many suggestions. Chill for a sec.");
        setSuggestClass("suggest-status err");
      } else {
        setSuggestStatus("Something broke. Try again?");
        setSuggestClass("suggest-status err");
      }
    } catch {
      setSuggestStatus("Couldn't reach the server. Try again?");
      setSuggestClass("suggest-status err");
    }

    setSuggestDisabled(false);
    setTimeout(() => {
      setSuggestStatus("");
      setSuggestClass("suggest-status");
    }, 4000);
  }, []);

  return (
    <>
      <div id="cur" ref={curRef} />

      {/* Nav */}
      <nav className="nav">
        <div className="col">
          <a href="#" className="logo" ref={logoRef}>
            daft
            <span className="logo-dot">
              <span className="logo-dot-fill" ref={dotFillRef} />
            </span>
          </a>
          <div className="nav-r">
            <a href="#about">about</a>
            <a href="#work">work</a>
            <a href="#places">places</a>
            <a href="#contact">contact</a>
          </div>
        </div>
      </nav>

      <div className="col">
        {/* Hero */}
        <section className="hero">
          <div className="hero-figure">
            <Image src="/assets/figure.svg" alt="" width={180} height={174} draggable={false} />
          </div>

          <h1 className="hero-name r">Leo Johnston Mesia</h1>
          <p className="hero-bio r rd1">
            <strong>Software engineer</strong>{" "}from England. I build full-stack systems,
            break things on purpose, and write too much documentation. Half Peruvian,
            bilingual in English and Spanish. Currently finishing A-Levels and building
            things that probably shouldn&apos;t work but do.
          </p>
          <div className="hero-status r rd2">
            <span className="dot-green" />
            Building something new
          </div>
          <div className="hero-links r rd3">
            <a href="https://github.com/daftscientist" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              GitHub
            </a>
            <a href="https://linkedin.com/in/leo-johnston" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              LinkedIn
            </a>
            <a href="mailto:leo@daftscientist.dev">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Email
            </a>
          </div>
        </section>

        <hr className="hr" />

        {/* Decorative background figures */}
        <div className="bg-figures" aria-hidden="true">
          <div className="bg-fig" style={{ top: '30px', left: '-80px', transform: 'rotate(-10deg)' }}>
            <Image src="/assets/figure.svg" alt="" width={110} height={106} draggable={false} />
          </div>
          <div className="bg-fig" style={{ top: '180px', right: '-50px', transform: 'rotate(18deg) scaleX(-1)' }}>
            <Image src="/assets/figure.svg" alt="" width={80} height={77} draggable={false} />
          </div>
          <div className="bg-fig" style={{ top: '420px', left: '10px', transform: 'rotate(-22deg)' }}>
            <Image src="/assets/figure.svg" alt="" width={55} height={53} draggable={false} />
          </div>
          <div className="bg-fig" style={{ top: '620px', right: '-30px', transform: 'rotate(8deg)' }}>
            <Image src="/assets/figure.svg" alt="" width={90} height={87} draggable={false} />
          </div>
          <div className="bg-fig" style={{ top: '900px', left: '-50px', transform: 'rotate(28deg) scaleX(-1)' }}>
            <Image src="/assets/figure.svg" alt="" width={65} height={63} draggable={false} />
          </div>
          <div className="bg-fig" style={{ top: '1150px', right: '0px', transform: 'rotate(-15deg)' }}>
            <Image src="/assets/figure.svg" alt="" width={50} height={48} draggable={false} />
          </div>
          <div className="bg-fig" style={{ top: '1400px', left: '-20px', transform: 'rotate(12deg) scaleX(-1)' }}>
            <Image src="/assets/figure.svg" alt="" width={70} height={68} draggable={false} />
          </div>
        </div>

        {/* About bento */}
        <section className="sec" id="about">
          <div className="sec-head r">
            <span className="figure-tiny">
              <Image src="/assets/figure.svg" alt="" width={28} height={27} />
            </span>
            About
          </div>
          <div className="bento">
            <div className="b bw r rd1">
              <div className="b-label">What I do</div>
              <div className="b-val">
                End-to-end systems — database schemas, REST APIs, React frontends, deployment pipelines. I think in architectures, not just features.
              </div>
              <div className="b-tags">
                <span className="b-tag">Python</span>
                <span className="b-tag">TypeScript</span>
                <span className="b-tag">React</span>
                <span className="b-tag">FastAPI</span>
                <span className="b-tag">Rust</span>
                <span className="b-tag">Docker</span>
              </div>
            </div>
            <div className="b r rd2">
              <div className="b-label" style={{ marginBottom: "2px" }}>Bilingual</div>
              <div className="b-val">Native English &amp; Spanish</div>
            </div>
            <div className="b r rd2">
              <div className="b-clock" ref={clockRef}>--:--:--</div>
              <div className="b-val" style={{ color: "var(--charcoal)", fontSize: "12px" }}>Essex, England</div>
            </div>
            <div className="b r rd3 b-spotify">
              {spotify?.url ? (
                <a href={spotify.url} target="_blank" rel="noopener noreferrer" className="b-spot-link">
                  <div className="b-spot-row">
                    {spotify.album_art && (
                      <img src={spotify.album_art} alt="" className="b-album-art" />
                    )}
                    <div>
                      <div className="b-track">{spotify.track || "Nothing right now"}</div>
                      <div className="b-artist">{spotify.artist || (spotify.is_playing ? "Playing" : "Last Played")}</div>
                    </div>
                  </div>
                </a>
              ) : (
                <>
                  <div className="b-track">{spotify?.track || "Nothing right now"}</div>
                  <div className="b-artist">{spotify?.artist || ""}</div>
                </>
              )}
            </div>
            <div className="b r rd3">
              <div className="b-stat">1,391</div>
              <div className="b-label">GitHub contributions</div>
              <div className="b-val" style={{ color: "var(--charcoal)" }}>this year</div>
            </div>
            <div className="b bw r rd4">
              <div className="b-label">Suggest me a song</div>
              <div className="b-val">Think I&apos;d vibe to something? Drop a recommendation and I&apos;ll check it out.</div>
              <div className="suggest-form">
                <div className="suggest-input-row">
                  <input
                    type="text"
                    className="suggest-input"
                    ref={suggestInputRef}
                    placeholder="Song name or Spotify link..."
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitSuggestion();
                    }}
                  />
                  <button className="suggest-send" disabled={suggestDisabled} onClick={submitSuggestion}>
                    Send
                  </button>
                </div>
                <div className={suggestClass}>{suggestStatus}</div>
              </div>
            </div>
          </div>
        </section>

        <hr className="hr" />

        {/* Projects */}
        <section className="sec" id="work">
          <div className="sec-head r">Work</div>

          <div className="proj r rd1" onClick={toggleProj}>
            <div>
              <div className="proj-name">Workforce Management &amp; Pay Tracking</div>
              <div className="proj-desc">
                A-Level CS NEA. Full HR &amp; scheduling system for SMBs — employee scheduling, attendance, role-based access, payroll. 100k+ word write-up.
              </div>
              <div className="b-tags">
                <span className="b-tag">React</span>
                <span className="b-tag">Python</span>
                <span className="b-tag">FastAPI</span>
                <span className="b-tag">SQLAlchemy</span>
                <span className="b-tag">JWT</span>
              </div>
            </div>
            <div className="proj-links">
              <a href="https://github.com/daftscientist" className="proj-link" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                GitHub ↗
              </a>
            </div>
            <div className="proj-code">
              <div className="proj-code-bar">
                <span className="cd cd-r" />
                <span className="cd cd-y" />
                <span className="cd cd-g" />
                <span className="proj-code-file">api/routes/schedules.py</span>
              </div>
              <div className="proj-code-body">
                <span className="cc"># Schedule creation with conflict detection</span>
                {"\n"}
                <span className="ck">@router</span>.post(<span className="cs">&quot;/shifts&quot;</span>)
                {"\n"}
                <span className="ck">async def</span> <span className="cf">create_shift</span>(
                {"\n"}
                {"    "}shift: ShiftCreate,
                {"\n"}
                {"    "}db: AsyncSession = <span className="cf">Depends</span>(get_db)
                {"\n"}
                ):
                {"\n"}
                {"    "}<span className="ck">await</span> <span className="cf">validate_no_overlap</span>(db, shift)
                {"\n"}
                {"    "}result = <span className="ck">await</span> shift_service.<span className="cf">create</span>(db, shift)
                {"\n"}
                {"    "}<span className="ck">return</span> {"{"}<span className="cs">&quot;id&quot;</span>: result.id, <span className="cs">&quot;status&quot;</span>: <span className="cs">&quot;confirmed&quot;</span>{"}"}
              </div>
            </div>
          </div>

          <div className="proj r rd2" onClick={toggleProj}>
            <div>
              <div className="proj-name">WebScene</div>
              <div className="proj-desc">
                TypeScript Canvas video composition engine. After Effects-style timeline with layers, tracks, keyframes. Deterministic rendering and frame export.
              </div>
              <div className="b-tags">
                <span className="b-tag">TypeScript</span>
                <span className="b-tag">Canvas</span>
                <span className="b-tag">WebCodecs</span>
              </div>
            </div>
            <div className="proj-links">
              <a href="https://github.com/daftscientist" className="proj-link" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                GitHub ↗
              </a>
            </div>
            <div className="proj-code">
              <div className="proj-code-bar">
                <span className="cd cd-r" />
                <span className="cd cd-y" />
                <span className="cd cd-g" />
                <span className="proj-code-file">engine/Scene.ts</span>
              </div>
              <div className="proj-code-body">
                <span className="ck">const</span> scene = <span className="ck">new</span> <span className="cf">Scene</span>({"{"} width: <span className="cn">1920</span>, height: <span className="cn">1080</span> {"}"});
                {"\n"}
                <span className="ck">const</span> layer = scene.<span className="cf">addLayer</span>(<span className="cs">&quot;main&quot;</span>);
                {"\n\n"}
                layer.<span className="cf">addKeyframe</span>({"{"}
                {"\n"}
                {"  "}time: <span className="cn">0</span>,
                {"\n"}
                {"  "}opacity: <span className="cn">0</span>,
                {"\n"}
                {"  "}transform: {"{"} scale: <span className="cn">0.8</span> {"}"}
                {"\n"}
                {"}"});
                {"\n\n"}
                <span className="ck">await</span> scene.<span className="cf">render</span>();
              </div>
            </div>
          </div>

          <div className="proj r rd3">
            <div>
              <div className="proj-name">JRNI Demo</div>
              <div className="proj-desc">
                Booking system API integration built during work experience at bookinglab. React frontend consuming the JRNI scheduling API.
              </div>
              <div className="b-tags">
                <span className="b-tag">TypeScript</span>
                <span className="b-tag">React</span>
                <span className="b-tag">JRNI API</span>
              </div>
            </div>
            <div className="proj-links">
              <a href="https://github.com/daftscientist" className="proj-link" target="_blank" rel="noopener noreferrer">
                GitHub ↗
              </a>
            </div>
          </div>

          <div className="proj r rd4">
            <div>
              <div className="proj-name">Cascade</div>
              <div className="proj-desc">
                SaaS hosting platform replacing the WHMCS/Pterodactyl/cPanel stack. Zero-trust architecture with mTLS, signed actions, and data sovereignty. Native LXC, KVM, and Docker workloads.
              </div>
              <div className="b-tags">
                <span className="b-tag">TypeScript</span>
                <span className="b-tag">Rust</span>
                <span className="b-tag">LXC/KVM</span>
                <span className="b-tag">OVN</span>
                <span className="b-tag">Zero-Trust</span>
              </div>
            </div>
            <div className="proj-links">
              <a href="https://usecascade.io" className="proj-link" target="_blank" rel="noopener noreferrer">
                Website ↗
              </a>
            </div>
          </div>
        </section>

        <hr className="hr" />

        {/* Experience */}
        <section className="sec" id="exp">
          <div className="sec-head r">Experience</div>
          <div className="exp r rd1">
            <span className="exp-year">2025 —</span>
            <span className="exp-role"><strong>Founder</strong> of Aftora.io</span>
            <span className="exp-place">Remote</span>
          </div>
          <div className="exp r rd2">
            <span className="exp-year">2025</span>
            <span className="exp-role"><strong>CTO &amp; Shop Assistant</strong> at PicaNut</span>
            <span className="exp-place">Hybrid</span>
          </div>
          <div className="exp r rd2">
            <span className="exp-year">2024</span>
            <span className="exp-role"><strong>Work Experience</strong> at bookinglab</span>
            <span className="exp-place">Remote</span>
          </div>
          <div className="exp r rd3">
            <span className="exp-year">2024</span>
            <span className="exp-role"><strong>Work Experience</strong> at Microsoft</span>
            <span className="exp-place">Reading &amp; London</span>
          </div>
        </section>

        <hr className="hr" />

        {/* Places / Map */}
        <section className="sec" id="places">
          <div className="sec-head r">
            <span className="figure-tiny">
              <Image src="/assets/figure.svg" alt="" width={28} height={27} />
            </span>
            Places
          </div>
          <MapSection />
        </section>

        <hr className="hr" />

        {/* Contact */}
        <section className="sec" id="contact">
          <div className="sec-head r">Contact</div>
          <p className="r rd1" style={{ color: "var(--charcoal)", marginBottom: "16px", fontSize: "14px" }}>
            Got a project, an idea, or just want to say hello.
          </p>
          <div className="contact-row r rd2">
            <a href="mailto:leo@daftscientist.dev">Email</a>
            <a href="https://github.com/daftscientist" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://linkedin.com/in/leo-johnston" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </section>

        <hr className="hr" />

        {/* Footer */}
        <footer className="foot r">
          <span>
            <span className="figure-foot">
              <Image src="/assets/figure.svg" alt="" width={22} height={21} />
            </span>
            Built by Leo when his ADHD meds ran out.
          </span>
          <Link href="/terminal">/terminal</Link>
        </footer>
      </div>
    </>
  );
}
