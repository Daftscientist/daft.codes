"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.daftscientist.dev";

interface Suggestion {
  track: string;
  artist: string;
  spotify_url: string;
  album_art: string;
  created_at: string;
}

export default function PlaylistPage() {
  const curRef = useRef<HTMLDivElement>(null);
  const dotFillRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  // Cursor
  useEffect(() => {
    const cur = curRef.current;
    if (!cur) return;
    const move = (e: MouseEvent) => {
      cur.style.left = e.clientX + "px";
      cur.style.top = e.clientY + "px";
      cur.classList.add("visible");
    };
    const hide = () => cur.classList.remove("visible");
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", hide);
    const hoverables = document.querySelectorAll("a,button,.pl-track");
    const enter = () => document.body.classList.add("ch");
    const leave = () => document.body.classList.remove("ch");
    hoverables.forEach(el => { el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); });
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", hide);
      hoverables.forEach(el => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); });
    };
  }, []);

  // Scroll progress
  useEffect(() => {
    const dotFill = dotFillRef.current;
    if (!dotFill) return;
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const p = scrollable > 0 ? Math.min((window.scrollY / scrollable) * 100, 100) : 100;
      dotFill.style.height = p + "%";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
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

  // Reveal on scroll
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("v"); });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    document.querySelectorAll(".r").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Fetch suggestions
  useEffect(() => {
    fetch(`${API_BASE}/suggestions`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setSuggestions(d.suggestions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <div id="cur" ref={curRef} />

      {/* Nav */}
      <nav className="nav">
        <div className="col">
          <Link href="/" className="logo" ref={logoRef}>
            daft
            <span className="logo-dot">
              <span className="logo-dot-fill" ref={dotFillRef} />
            </span>
          </Link>
          <div className="nav-r">
            <Link href="/#about">about</Link>
            <Link href="/#work">work</Link>
            <Link href="/#places">places</Link>
            <Link href="/#contact">contact</Link>
          </div>
        </div>
      </nav>

      <div className="col">
        {/* Hero */}
        <section className="hero">
          <h1 className="hero-name r">Playlist.</h1>
          <p className="hero-bio r rd1">
            Songs people think I&apos;d vibe to. Submit one from the{" "}
            <Link href="/" style={{ color: "var(--silver)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
              home page
            </Link>
            .
          </p>
        </section>

        <hr className="hr" />

        {/* Suggestions */}
        <section className="sec">
          <div className="sec-head r">Suggestions</div>
          {!loading && suggestions.length > 0 && (
            <input
              className="pl-filter r rd1"
              placeholder="filter by track or artist..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              spellCheck={false}
            />
          )}
          <div className="pl-list r rd1">
            {loading && (
              <div className="pl-empty">Loading...</div>
            )}
            {!loading && suggestions.length === 0 && (
              <div className="pl-empty">No suggestions yet. Be the first.</div>
            )}
            {!loading && (() => {
              const q = filter.trim().toLowerCase();
              const filtered = q
                ? suggestions.filter(s =>
                    s.track.toLowerCase().includes(q) ||
                    (s.artist || "").toLowerCase().includes(q)
                  )
                : suggestions;
              if (filtered.length === 0) return (
                <div className="pl-empty">No matches.</div>
              );
              return filtered.map((s, i) => (
                <div key={i} className="pl-track">
                  <span className="pl-num">{i + 1}.</span>
                  {s.album_art ? (
                    <img src={s.album_art} className="pl-art" alt="" />
                  ) : (
                    <div className="pl-art" />
                  )}
                  <div className="pl-info">
                    <div className="pl-track-name">{s.track}</div>
                    <div className="pl-artist">{s.artist || "Unknown artist"}</div>
                  </div>
                  {s.spotify_url && (
                    <a
                      href={s.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pl-link"
                    >
                      Open ↗
                    </a>
                  )}
                </div>
              ));
            })()}
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
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href="/playlist">/playlist</Link>
            <Link href="/terminal">/terminal</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
