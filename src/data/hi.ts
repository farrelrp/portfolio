// Content for rrreksa.com/hi, the personal page. Images live in public/hi.

export const hi = {
  intro: "hi!",
  location: "south jakarta",
  links: [
    { label: "instagram", href: "https://www.instagram.com/reksafarrel/" },
    { label: "spotify", href: "https://open.spotify.com/user/21ts4zqdje7ca36nmbq6377fy" },
    { label: "linkedin", href: "https://www.linkedin.com/in/farrel-reksa/" },
    { label: "github", href: "https://github.com/farrelrp" },
    { label: "email", href: "mailto:farrelreksa@gmail.com" },
  ],
};

/** One thing I'm pushing on people right now. Can be anything: a song, a show, a place. */
export const recommend = {
  kind: "song",
  title: "One Car Hits Another",
  by: "Panchiko, Mei Semones",
  from: "Chimera",
  cover: "/hi/one-car-hits-another.jpg",
  // TODO: swap for the direct track link (Spotify → Share → Copy song link).
  href: "https://open.spotify.com/search/One%20Car%20Hits%20Another%20Panchiko",
  cta: "listen on spotify",
};

export type Shelf = {
  title: string;
  by: string;
  cover: string;
  href?: string;
};

export const albums: Shelf[] = [
  { title: "In Rainbows", by: "Radiohead", cover: "/hi/in-rainbows.jpg" },
  { title: "Grace", by: "Jeff Buckley", cover: "/hi/grace.jpg" },
  { title: "Blonde", by: "Frank Ocean", cover: "/hi/blond.jpg" },
  { title: "IGOR", by: "Tyler, The Creator", cover: "/hi/igor.jpg" },
  // Unconfirmed: identified from the cover art only.
  { title: "INSANO", by: "Kid Cudi", cover: "/hi/insano.jpg" },
  { title: "Passion, Pain & Demon Slayin'", by: "Kid Cudi", cover: "/hi/ppds.jpg" },
  { title: "Nurture", by: "Porter Robinson", cover: "/hi/nurture.jpg" },
  { title: "Chainsaw Man The Movie: Reze Arc", by: "Kensuke Ushio", cover: "/hi/reze-arc.jpg" },
  { title: "Continuum", by: "John Mayer", cover: "/hi/continuum.jpg" },
];

export const manga: Shelf[] = [
  { title: "Oyasumi Punpun", by: "Inio Asano", cover: "/hi/punpun.jpg", href: "https://anilist.co/manga/34632" },
  { title: "The Climber", by: "Shinichi Sakamoto", cover: "/hi/the-climber.jpg", href: "https://anilist.co/manga/37375" },
  { title: "Goodbye, Eri", by: "Tatsuki Fujimoto", cover: "/hi/goodbye-eri.jpg", href: "https://anilist.co/manga/146983" },
  { title: "Blood on the Tracks", by: "Shuzo Oshimi", cover: "/hi/blood-on-the-tracks.jpg", href: "https://anilist.co/manga/98397" },
];
