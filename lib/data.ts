export type Video = {
  id?: string; // YouTube id
  url: string;
  title: string;
  meta: string;
  tag: string;
  platform: "YouTube" | "Instagram";
  orientation: "landscape" | "portrait";
};

export type BoardSection = {
  key: string;
  timecode: string;
  label: string;
  sub: string;
  videos: Video[];
};

const yt = (id: string): string => `https://youtu.be/${id}`;

export const boardSections: BoardSection[] = [
  {
    key: "long",
    timecode: "00:01",
    label: "Long Form",
    sub: "Podcasts, talking heads, vlogs & game shows",
    videos: [
      { id: "bVti-ykKf8o", url: yt("bVti-ykKf8o"), title: "Week in Life | Running a Multi-Million Dollar Company", meta: "Ayush Wadhwa", tag: "Vlog", platform: "YouTube", orientation: "landscape" },
      { id: "p3BFKSicnCo", url: yt("p3BFKSicnCo"), title: "Third Wave Coffee's ₹1300 Crore Gamble", meta: "Anurag Bansal", tag: "Talking Head", platform: "YouTube", orientation: "landscape" },
      { id: "WyebWTr93kA", url: yt("WyebWTr93kA"), title: "How Dhurandhar Exposed PVR's Biggest Problem", meta: "Anurag Bansal", tag: "Case Study", platform: "YouTube", orientation: "landscape" },
      { id: "2g0caV093qk", url: yt("2g0caV093qk"), title: "Samay Raina & Balraj Test Their Knowledge | What The Buck Ep. 1", meta: "Anshuman Sharma", tag: "Game Show", platform: "YouTube", orientation: "landscape" },
      { id: "TXEVUiclcMI", url: yt("TXEVUiclcMI"), title: "How He Built a ₹7Cr+ Corpus At The Age Of 35?", meta: "PowerUp Money", tag: "Podcast", platform: "YouTube", orientation: "landscape" },
      { id: "YMH4C5pkgeE", url: yt("YMH4C5pkgeE"), title: "AIR 1 in IISER Aptitude Test | My Strategy & Success Story", meta: "SciAstra", tag: "Podcast", platform: "YouTube", orientation: "landscape" },
      { id: "xD8Sk0YMRAY", url: yt("xD8Sk0YMRAY"), title: "Story", meta: "Hashawps", tag: "Story", platform: "YouTube", orientation: "landscape" },
    ],
  },
  {
    key: "short",
    timecode: "00:02",
    label: "Short Form Reels",
    sub: "High-retention vertical videos",
    videos: [
      { url: "https://www.instagram.com/reel/DLpRL5FxgHe/", title: "Talking Head — Instagram Reel", meta: "Instagram Reel", tag: "Talking Head", platform: "Instagram", orientation: "portrait" },
      { id: "0QedWHb3ZEI", url: yt("0QedWHb3ZEI"), title: "Govt Internships — Short", meta: "HashGonWeed", tag: "Talking Head", platform: "YouTube", orientation: "portrait" },
      { id: "HdvBYK65nTg", url: yt("HdvBYK65nTg"), title: "BigLeap Project", meta: "HeyGen AI", tag: "HeyGen", platform: "YouTube", orientation: "portrait" },
      { url: "https://www.instagram.com/reel/Dbsxmi0x4cL/", title: "Talking Head — Instagram Reel", meta: "Instagram Reel", tag: "Talking Head", platform: "Instagram", orientation: "portrait" },
    ],
  },
  {
    key: "3d",
    timecode: "00:03",
    label: "3D & Brand Ads",
    sub: "Ads created in Blender",
    videos: [
      { id: "eb8OX-fFtI8", url: yt("eb8OX-fFtI8"), title: "Lone Wolf", meta: "Hashawps · 3D Animation", tag: "3D", platform: "YouTube", orientation: "portrait" },
      { id: "_o4E9eVV3JU", url: yt("_o4E9eVV3JU"), title: "Blender Shoe 3D", meta: "Hashawps · 3D Render", tag: "3D", platform: "YouTube", orientation: "portrait" },
      { id: "CJPTkrzcNbs", url: yt("CJPTkrzcNbs"), title: "Blacabia T-Shirt Drop", meta: "Hashawps · Brand Ad", tag: "Brand Ad", platform: "YouTube", orientation: "portrait" },
    ],
  },
];

export const roles = ["Video Editor", "Cinematographer", "Creative Head", "Storyteller"];

export const brands = ["OWLED MEDIA", "BEANLY", "ANSHUMAN SHARMA", "BUSINESS WITH BANSAL", "SCIASTRA"];

export type Client = {
  name: string;
  role: string;
  img: string | null;
  link: string | null;
};

export const clients: Client[] = [
  { name: "Anurag Bansal", role: "YouTube Partner", img: "/clients/anurag_bansal.jpg", link: "https://www.youtube.com/@ByAnuragBansal" },
  { name: "Anshuman Sharma", role: "YouTube Partner", img: "/clients/anshuman_sharma.jpg", link: "https://www.youtube.com/@anshumanfinance" },
  { name: "Sciastra", role: "YouTube Partner", img: "/clients/sciastra.jpg", link: "https://www.youtube.com/@SciAstra" },
  { name: "PowerUp Money", role: "YouTube Partner", img: "/clients/powerup_money.jpg", link: "https://www.youtube.com/@PowerUpMoney" },
  { name: "Owled Media", role: "YouTube Partner", img: "/clients/owled_media.jpg", link: "https://www.youtube.com/@owledmedia9296" },
  { name: "Media House.Co", role: "Video Partner", img: null, link: null },
];

export const contact = {
  email: "harrsheeta@gmail.com",
  phone: "+919958710599",
  phonePretty: "+91 99587 10599",
  instagram: "https://www.instagram.com/harrshheta/",
};
