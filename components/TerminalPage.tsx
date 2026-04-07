"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

interface Line {
  type: "cmd" | "out" | "err" | "heading" | "muted" | "link";
  text: string;
  url?: string;
}

const filesystem: Record<string, string[] | Record<string, string[]>> = {
  "about.txt": [
    "Leo Johnston Mesia",
    "==================",
    "",
    "Software engineer from England. Half Peruvian, bilingual in",
    "English and Spanish. Currently finishing A-Levels in Computer",
    "Science, Modern History, Spanish, and Core Maths.",
    "",
    "I build full-stack systems, break things on purpose, and write",
    "too much documentation. I think in architectures, not features.",
    "",
    "Strong: Python, TypeScript, React, FastAPI, Docker",
    "Learning: Rust, C++",
    "Also used: Go, PHP, Ruby, Bash",
  ],
  "projects/": {
    "nea.txt": [
      "Workforce Management & Pay Tracking",
      "====================================",
      "A-Level CS NEA. Full HR & scheduling system for SMBs.",
      "Employee scheduling, attendance, role-based access, payroll.",
      "100k+ word write-up. My proudest piece of work.",
      "",
      "Stack: React, Python, FastAPI, SQLAlchemy, JWT",
    ],
    "webscene.txt": [
      "WebScene",
      "========",
      "TypeScript Canvas video composition engine.",
      "After Effects-style timeline with layers, tracks, keyframes.",
      "Deterministic rendering and frame export.",
      "",
      "Stack: TypeScript, Canvas API, WebCodecs",
    ],
    "jrni.txt": [
      "JRNI Demo",
      "=========",
      "Booking system API integration built during work experience",
      "at bookinglab. React frontend consuming the JRNI scheduling API.",
      "",
      "Stack: TypeScript, React, JRNI API",
    ],
    "cascade.txt": [
      "Cascade",
      "=======",
      "SaaS hosting platform replacing the WHMCS/Pterodactyl/cPanel stack.",
      "Zero-trust architecture with mTLS, signed actions, data sovereignty.",
      "Built on native LXC containers, KVM/QEMU VMs, and Docker with OVN networking.",
      "",
      "Website: usecascade.io",
      "Stack: TypeScript, Rust, Go, OVN",
    ],
  },
  "contact/": {
    "links.txt": [
      "Contact & Links",
      "===============",
      "",
      "Email    leo@daftscientist.dev",
      "GitHub   github.com/daftscientist",
      "LinkedIn linkedin.com/in/leo-johnston",
      "Website  daftscientist.dev",
    ],
  },
};

function getCommandResult(cmd: string, args: string[], history: string[]): Line[] {
  switch (cmd) {
    case "help":
      return [
        { type: "heading", text: "Available commands" },
        { type: "out", text: "" },
        { type: "out", text: "  help             show this message" },
        { type: "out", text: "  whoami           who am i" },
        { type: "out", text: "  pwd              print working directory" },
        { type: "out", text: "  ls [dir]         list files" },
        { type: "out", text: "  cat <file>       read a file" },
        { type: "out", text: "  clear            clear the terminal" },
        { type: "out", text: "  history          command history" },
        { type: "out", text: "  neofetch         system info" },
        { type: "out", text: "  date             current date/time" },
        { type: "out", text: "  exit             back to portfolio" },
        { type: "out", text: "" },
        { type: "muted", text: "  ...try other things too. some might surprise you." },
      ];

    case "whoami":
      return [{ type: "out", text: "leo" }];

    case "pwd":
      return [{ type: "out", text: "~/daftscientist.dev" }];

    case "ls": {
      const target = args[0];
      if (!target) {
        return Object.keys(filesystem).map((k) => ({ type: "out" as const, text: "  " + k }));
      }
      const dirKey = target.replace(/\/$/, "") + "/";
      const dir = filesystem[dirKey];
      if (dir && typeof dir === "object" && !Array.isArray(dir)) {
        return Object.keys(dir).map((k) => ({ type: "out" as const, text: "  " + k }));
      }
      return [{ type: "err", text: `ls: cannot access '${target}': No such file or directory` }];
    }

    case "cat": {
      if (!args.length) return [{ type: "err", text: "cat: missing file operand" }];
      const path = args[0].replace(/^\.\//, "");

      const direct = filesystem[path];
      if (direct && Array.isArray(direct)) {
        return direct.map((l) => ({ type: "out" as const, text: l }));
      }

      const parts = path.split("/");
      if (parts.length === 2) {
        const dirKey = parts[0] + "/";
        const dir = filesystem[dirKey];
        if (dir && typeof dir === "object" && !Array.isArray(dir)) {
          const file = dir[parts[1]];
          if (file) return file.map((l) => ({ type: "out" as const, text: l }));
        }
      }

      const testDir = path.replace(/\/$/, "") + "/";
      if (filesystem[testDir]) {
        return [{ type: "err", text: `cat: ${path}: Is a directory` }];
      }
      return [{ type: "err", text: `cat: ${path}: No such file or directory` }];
    }

    case "clear":
      return []; // handled specially

    case "history":
      return history.map((c, i) => ({
        type: "out" as const,
        text: `  ${String(i + 1).padStart(4)}  ${c}`,
      }));

    case "exit":
      return [{ type: "muted", text: "Redirecting..." }];

    case "sudo": {
      const full = args.join(" ");
      if (full.startsWith("rm -rf /")) {
        return [
          { type: "out", text: "" },
          { type: "err", text: "  Deleting the entire filesystem..." },
          { type: "err", text: "  Just kidding. Nice try though." },
          { type: "out", text: "" },
        ];
      }
      return [{ type: "err", text: "sudo: operation not permitted (you're not root here)" }];
    }

    case "hola":
      return [
        { type: "out", text: "Hola! Hablas espanol?" },
        { type: "muted", text: "Leo is bilingual in English and Spanish." },
      ];

    case "cascade":
      return [
        { type: "heading", text: "Cascade" },
        { type: "out", text: "" },
        { type: "out", text: "SaaS hosting platform. Currently building." },
        { type: "out", text: "Zero-trust, mTLS, signed actions, data sovereignty." },
        { type: "out", text: "" },
        { type: "link", text: "usecascade.io", url: "https://usecascade.io" },
      ];

    case "neofetch":
      return [
        { type: "out", text: "" },
        { type: "heading", text: "  daft." },
        { type: "out", text: "  -----" },
        { type: "out", text: `  OS: daftOS v${new Date().getFullYear()}` },
        { type: "out", text: "  Host: daftscientist.dev" },
        { type: "out", text: "  Shell: zsh (fake)" },
        { type: "out", text: "  Languages: English, Spanish" },
        { type: "out", text: "  Stack: Python, TypeScript, React, Rust" },
        { type: "out", text: "  Uptime: since 2006" },
        { type: "out", text: "  Theme: dark (always)" },
        { type: "out", text: "" },
      ];

    case "date":
      return [{ type: "out", text: new Date().toString() }];

    case "echo":
      return [{ type: "out", text: args.join(" ") }];

    case "ping":
      if (!args.length) return [{ type: "err", text: "ping: missing host operand" }];
      return [
        { type: "out", text: `PING ${args[0]}: 64 bytes, time=0.42ms` },
        { type: "out", text: `PING ${args[0]}: 64 bytes, time=0.38ms` },
        { type: "out", text: `PING ${args[0]}: 64 bytes, time=0.41ms` },
        { type: "muted", text: "--- (it's a fake terminal, what did you expect)" },
      ];

    case "cd":
      if (!args.length || args[0] === "~" || args[0] === "/") {
        return [{ type: "muted", text: "You're already home." }];
      }
      return [{ type: "muted", text: "Nice try, but this filesystem is read-only." }];

    case "rm":
      return [{ type: "err", text: "rm: permission denied (this is a portfolio, not a playground)" }];
    case "mkdir":
      return [{ type: "err", text: "mkdir: read-only filesystem" }];
    case "touch":
      return [{ type: "err", text: "touch: read-only filesystem" }];
    case "vim":
      return [{ type: "muted", text: "Good luck exiting." }];
    case "nano":
      return [{ type: "muted", text: "The filesystem is read-only. Use cat instead." }];
    case "npm":
      return [{ type: "muted", text: "node_modules would weigh more than this entire site." }];

    case "coffee":
      return [
        { type: "out", text: "" },
        { type: "out", text: "  ( (  " },
        { type: "out", text: "   ) )" },
        { type: "out", text: " ._____.  " },
        { type: "out", text: " |     |]" },
        { type: "out", text: " \\     / " },
        { type: "out", text: "  `---' " },
        { type: "out", text: "" },
        { type: "muted", text: "Leo runs on coffee. This is documented." },
      ];

    case "matrix":
      return [{ type: "muted", text: "Entering the matrix... (click anywhere to stop)" }];

    default:
      return [{ type: "err", text: `zsh: command not found: ${cmd}` }];
  }
}

export default function TerminalPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [matrixActive, setMatrixActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matrixAnimRef = useRef<number>(0);

  // Boot message
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines([
      {
        type: "muted",
        text:
          "Last login: " +
          new Date().toLocaleString("en-GB", { timeZone: "Europe/London" }) +
          " on ttys000",
      },
      { type: "out", text: "" },
      { type: "heading", text: "Welcome to daftscientist.dev/terminal" },
      { type: "out", text: "" },
      { type: "out", text: "This is a fake terminal. Explore my portfolio from the command line." },
      { type: "out", text: "Type `help` to see available commands." },
      { type: "out", text: "" },
    ]);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "A" && !target.classList.contains("line-link")) {
        inputRef.current?.focus();
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Matrix rain
  const startMatrix = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setMatrixActive(true);

    const cols = Math.floor(canvas.width / 16);
    const drops: number[] = Array(cols).fill(1);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");

    const draw = () => {
      ctx.fillStyle = "rgba(21, 21, 21, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#6aaa7a";
      ctx.font = "14px JetBrains Mono";

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 16, drops[i] * 16);
        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      matrixAnimRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  const stopMatrix = useCallback(() => {
    if (matrixActive) {
      cancelAnimationFrame(matrixAnimRef.current);
      setMatrixActive(false);
      inputRef.current?.focus();
    }
  }, [matrixActive]);

  useEffect(() => {
    if (matrixActive) {
      const handler = () => stopMatrix();
      const timer = setTimeout(() => document.addEventListener("click", handler), 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handler);
      };
    }
  }, [matrixActive, stopMatrix]);

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const newHistory = [...cmdHistory, trimmed];
      setCmdHistory(newHistory);
      setHistIdx(newHistory.length);

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      if (cmd === "clear") {
        setLines([]);
        return;
      }

      if (cmd === "exit") {
        setLines((prev) => [
          ...prev,
          { type: "cmd", text: trimmed },
          { type: "muted", text: "Redirecting..." },
        ]);
        setTimeout(() => {
          window.location.href = "/";
        }, 300);
        return;
      }

      if (cmd === "matrix") {
        setLines((prev) => [
          ...prev,
          { type: "cmd", text: trimmed },
          { type: "muted", text: "Entering the matrix... (click anywhere to stop)" },
        ]);
        startMatrix();
        return;
      }

      const result = getCommandResult(cmd, args, newHistory);
      setLines((prev) => [...prev, { type: "cmd", text: trimmed }, ...result]);
    },
    [cmdHistory, startMatrix]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        runCommand(inputRef.current?.value || "");
        if (inputRef.current) inputRef.current.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (histIdx > 0) {
          const newIdx = histIdx - 1;
          setHistIdx(newIdx);
          if (inputRef.current) inputRef.current.value = cmdHistory[newIdx];
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIdx < cmdHistory.length - 1) {
          const newIdx = histIdx + 1;
          setHistIdx(newIdx);
          if (inputRef.current) inputRef.current.value = cmdHistory[newIdx];
        } else {
          setHistIdx(cmdHistory.length);
          if (inputRef.current) inputRef.current.value = "";
        }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setLines([]);
      }
    },
    [runCommand, histIdx, cmdHistory]
  );

  return (
    <>
      <style jsx global>{`
        body {
          font-family: "JetBrains Mono", monospace;
          font-size: 14px;
          line-height: 1.7;
          background: var(--onyx);
          color: var(--silver);
          overflow: hidden;
          cursor: auto;
        }
        @media (max-width: 600px) {
          body {
            font-size: 12px;
            line-height: 1.5;
            overflow: hidden;
          }
          .terminal-wrap {
            width: 100vw;
            max-width: 100vw;
            overflow-x: hidden;
          }
          .terminal-chrome {
            padding: 10px 12px !important;
          }
          .terminal-output {
            padding: 12px !important;
            overflow-x: hidden;
            word-break: break-all;
          }
          .terminal-input {
            padding: 10px 12px !important;
          }
          .terminal-input input {
            font-size: 12px !important;
          }
          .terminal-prompt-path {
            display: none;
          }
        }
      `}</style>

      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          pointerEvents: "none",
          opacity: matrixActive ? 1 : 0,
          transition: "opacity 0.5s",
        }}
      />

      <div
        className="terminal-wrap"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          maxWidth: "860px",
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* Chrome */}
        <div
          className="terminal-chrome"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 20px",
            borderBottom: "1px solid rgba(76,76,75,0.15)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: "12px",
              color: "var(--charcoal)",
              letterSpacing: "0.5px",
            }}
          >
            leo@daftscientist.dev — zsh
          </span>
          <Link
            href="/"
            style={{
              fontSize: "12px",
              color: "var(--charcoal)",
              textDecoration: "none",
              transition: "color .2s",
            }}
          >
            exit
          </Link>
        </div>

        {/* Output */}
        <div
          className="terminal-output"
          ref={outputRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            scrollBehavior: "smooth",
          }}
        >
          {lines.map((line, i) => {
            if (line.type === "cmd") {
              return (
                <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", color: "var(--white)" }}>
                  <span style={{ color: "var(--green)" }}>leo</span>
                  <span className="terminal-prompt-path" style={{ color: "var(--charcoal)" }}>:</span>
                  <span className="terminal-prompt-path" style={{ color: "var(--blue)" }}>~/daftscientist.dev</span>
                  <span style={{ color: "var(--charcoal)" }}> $ </span>
                  {line.text}
                </div>
              );
            }
            if (line.type === "link") {
              return (
                <div
                  key={i}
                  style={{
                    whiteSpace: "pre-wrap",
                    color: "var(--blue)",
                    cursor: "pointer",
                  }}
                  onClick={() => window.open(line.url, "_blank")}
                >
                  {line.text}
                </div>
              );
            }
            const colorMap: Record<string, string> = {
              out: "var(--silver)",
              err: "var(--red)",
              heading: "var(--white)",
              muted: "var(--charcoal)",
            };
            return (
              <div
                key={i}
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: colorMap[line.type] || "var(--silver)",
                  fontWeight: line.type === "heading" ? 700 : 400,
                }}
              >
                {line.text}
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div
          className="terminal-input"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 20px",
            borderTop: "1px solid rgba(76,76,75,0.15)",
            flexShrink: 0,
          }}
        >
          <span style={{ color: "var(--green)", whiteSpace: "nowrap", userSelect: "none" }}>leo</span>
          <span className="terminal-prompt-path" style={{ color: "var(--charcoal)", margin: "0 6px 0 4px", userSelect: "none" }}>:</span>
          <span className="terminal-prompt-path" style={{ color: "var(--blue)", whiteSpace: "nowrap", userSelect: "none" }}>~/daftscientist.dev</span>
          <span style={{ color: "var(--charcoal)", margin: "0 6px 0 4px", userSelect: "none" }}>$</span>
          <input
            ref={inputRef}
            type="text"
            autoFocus
            spellCheck={false}
            placeholder="type help to get started"
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "14px",
              color: "var(--white)",
              caretColor: "var(--white)",
            }}
          />
        </div>
      </div>
    </>
  );
}
