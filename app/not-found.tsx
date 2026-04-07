"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--onyx)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Thought bubble + figure grouped together */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Thought bubble */}
        <div
          style={{
            border: "1px solid rgba(189,188,189,0.15)",
            borderRadius: "16px",
            padding: "14px 18px",
            maxWidth: "240px",
            fontSize: "12px",
            color: "var(--silver)",
            lineHeight: 1.7,
            background: "rgba(76,76,75,0.06)",
            textAlign: "center",
            alignSelf: "flex-end",
            marginRight: "8px",
          }}
        >
          {pathname && pathname !== "/" ? (
            <>
              I&apos;m trapped at{" "}
              <span style={{ color: "var(--white)" }}>{pathname}</span>
              <br />
              <span style={{ color: "var(--charcoal)" }}>send help.</span>
            </>
          ) : (
            <>
              where did you take me?
              <br />
              <span style={{ color: "var(--charcoal)" }}>I don&apos;t recognise this place.</span>
            </>
          )}
        </div>

        {/* Thought dots — trail from bubble down toward the figure's head */}
        <div
          style={{
            alignSelf: "flex-end",
            marginRight: "44px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "5px",
            marginTop: "6px",
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(189,188,189,0.25)" }} />
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(189,188,189,0.18)", marginRight: "8px" }} />
          <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(189,188,189,0.12)", marginRight: "14px" }} />
        </div>

        {/* Figure */}
        <Image
          src="/assets/figure-sad.svg"
          alt=""
          width={160}
          height={155}
          style={{ filter: "brightness(0) invert(1)", opacity: 0.55 }}
        />
      </div>

      {/* Back link */}
      <Link
        href="/"
        style={{
          marginTop: "40px",
          fontSize: "12px",
          color: "var(--charcoal)",
          textDecoration: "none",
          transition: "color .2s",
          letterSpacing: "0.3px",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--white)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--charcoal)")}
      >
        ← back
      </Link>
    </main>
  );
}
