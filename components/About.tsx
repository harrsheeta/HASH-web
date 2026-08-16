import Reveal from "@/components/Reveal";
import { contact } from "@/lib/data";

export default function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-heading">
      <Reveal>
        <div className="section-head" style={{ borderBottom: "none", paddingBottom: 0 }}>
          <div>
            <span className="timecode">00:05 · About</span>
            <h2 id="about-heading" className="section-title">
              What do I bring <span className="accent">to the table?</span>
            </h2>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="about-copy">
          Hi, I&rsquo;m Harshita — a Delhi-based video editor, cinematographer and creative head with a background in
          narrative pacing, color grading, and motion design. I work with YouTubers, founders, and brands across Delhi
          NCR and beyond, delivering long-form YouTube edits, high-retention Instagram Reels and YouTube Shorts,
          podcasts, talking-head videos, game shows, and 3D animated brand ads built in Blender. If you&rsquo;re
          looking to bring a vibe to your videos, I am based off Delhi and up for freelance / full-time work. Reach out
          at <a href={`mailto:${contact.email}`}>{contact.email}</a> or{" "}
          <a href={`tel:${contact.phone}`}>{contact.phonePretty}</a>.
        </p>
      </Reveal>
    </section>
  );
}
