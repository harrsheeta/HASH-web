import Reveal from "@/components/Reveal";
import { contact } from "@/lib/data";

const services = [
  {
    title: "AI Visuals",
    description: "From a rough idea to a world worth watching. Cinematic AI visuals shaped around your brand, your story, and the feeling you want to leave behind.",
    video: "ai-visuals-web.mp4",
    poster: "ai-visuals-poster.jpg",
  },
  {
    title: "Brand Intros",
    description: "Give your brand a memorable entrance. Logo animation, motion design, and sound come together in an intro made to feel unmistakably yours.",
    video: "seedance-25s.mp4",
    poster: "seedance-25s-poster.jpg",
  },
  {
    title: "SaaS Videos",
    description: "Make your product easy to understand. Clear walkthroughs and expressive motion graphics show what your software does and why it matters.",
    video: "saas-video.mp4",
    poster: "saas-video-poster.jpg",
  },
  {
    title: "AI UGC Ads",
    description: "Creator-style content for your next campaign. AI characters, conversational scripts, and sharp edits turn your product story into social-ready ads.",
    video: "ugc-web.mp4",
    poster: "ugc-web-poster.jpg",
  },
];

export default function Services() {
  return (
    <section className="section services" id="services" aria-labelledby="services-heading">
      <Reveal>
        <div className="section-head">
          <div>
            <span className="timecode">From idea to screen · Services</span>
            <h2 className="section-title" id="services-heading">
              One stop. <span className="accent">Every frame.</span>
            </h2>
          </div>
          <p className="section-sub">AI visuals, brand stories, product explainers and ads — made to move people.</p>
        </div>
      </Reveal>
      <div className="service-list">
        {services.map((service, index) => (
          <Reveal key={service.title}>
            <article className="service-card" aria-labelledby={`service-${index}`}>
              <header className="service-card-header">
                <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
                <span>{service.title}</span>
                <span className="service-header-arrow" aria-hidden="true">↗</span>
              </header>
              <div className="service-card-body">
                <div className="service-media">
                  <video controls playsInline preload="none" poster={`/services/${service.poster}`} aria-label={`${service.title} example`}>
                    <source src={`/services/${service.video}`} type="video/mp4" />
                    <a href={`/services/${service.video}`}>Watch the {service.title} example</a>
                  </video>
                </div>
                <div className="service-copy">
                  <h3 id={`service-${index}`}>{service.title}</h3>
                  <p>{service.description}</p>
                  <a className="service-cta" href={`mailto:${contact.email}?subject=${encodeURIComponent(`${service.title} enquiry`)}`}>
                    Let&rsquo;s create <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
