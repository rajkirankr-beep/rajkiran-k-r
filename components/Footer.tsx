import { Github, Linkedin } from "lucide-react";
import { profile, socials } from "@/lib/data";
import CopyEmail from "./CopyEmail";

const iconFor: Record<string, typeof Github> = {
  GitHub: Github,
  LinkedIn: Linkedin,
};

export default function Footer() {
  return (
    <footer className="px-6 py-20 md:px-12 md:py-28 lg:px-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
            Contact
          </span>
          <h2 className="mt-4 text-balance font-display text-4xl font-black leading-[0.95] text-ink sm:text-5xl md:text-6xl">
            Let&rsquo;s build
            <br />
            something real.
          </h2>

          <div className="mt-8">
            <CopyEmail email={profile.email} />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-8 lg:col-span-5 lg:items-end">
          <nav className="flex gap-3">
            {socials.map((s) => {
              const Icon = iconFor[s.label];
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-ink/80 transition-colors duration-300 hover:border-accent hover:text-accent"
                >
                  {Icon && <Icon size={14} strokeWidth={2.25} />}
                  {s.label}
                </a>
              );
            })}
          </nav>

          <p className="font-mono text-[11px] text-muted lg:text-right">
            © {new Date().getFullYear()} {profile.name}. Built with Next.js &amp; Framer Motion.
          </p>
        </div>
      </div>
    </footer>
  );
}
