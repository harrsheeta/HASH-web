import Reveal from "@/components/Reveal";
import { clients } from "@/lib/data";

export default function Clients() {
  return (
    <section className="section" id="clients">
      <Reveal>
        <div className="section-head">
          <div>
            <span className="timecode">00:04 · Roster</span>
            <h2 className="section-title">
              Client <span className="accent">History</span>
            </h2>
          </div>
          <p className="section-sub">Brands and creators I&rsquo;ve partnered with on edits, campaigns, and content series.</p>
        </div>
      </Reveal>

      <div className="client-row">
        {clients.map((c, i) => {
          const inner = (
            <>
              <div className="client-mark">{c.img ? <img src={c.img} alt="" /> : c.name.charAt(0)}</div>
              <h5>{c.name}</h5>
              <p>{c.role}</p>
              {c.link && <span className="yt-link">▶ YouTube ↗</span>}
            </>
          );
          return (
            <Reveal key={c.name} delay={i * 0.06}>
              {c.link ? (
                <a className="client-chip" href={c.link} target="_blank" rel="noopener noreferrer">
                  {inner}
                </a>
              ) : (
                <div className="client-chip">{inner}</div>
              )}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
