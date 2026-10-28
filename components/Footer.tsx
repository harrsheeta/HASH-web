import Reveal from "@/components/Reveal";
import { contact } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="footer">
      <Reveal>
        <div className="big">
          Let&rsquo;s create something
          <br />
          <span className="accent">unforgettable.</span>
        </div>
      </Reveal>
      <Reveal delay={0.12}>
        <div className="meta">
          Video Editor · Delhi & Bangalore, India
          <br />
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <br />
          <a href={`tel:${contact.phone}`}>{contact.phonePretty}</a>
          <br />
          <a href={contact.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <br />
          <a href="https://www.instagram.com/hobie.labs/" target="_blank" rel="noopener noreferrer">
            Hobie Labs ↗
          </a>
        </div>
      </Reveal>
    </footer>
  );
}
