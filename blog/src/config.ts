import type {
  NavBarLink,
  SocialLink,
  Identity,
  AboutPageContent,
  ProjectPageContent,
  BlogPageContent,
  HomePageContent,
} from "./types/config";

export const identity: Identity = {
  name: "Nick Palenchar",
  logo: "/logo_light.png",
  altLogo: "/rose-logo.png",
  email: "nickpal@nickpalenchar.com",
};

export const navBarLinks: NavBarLink[] = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Blog",
    url: "/blog",
  },
  {
    title: "Projects",
    url: "/projects",
  },
];

export const socialLinks: SocialLink[] = [
  {
    title: "GitHub",
    url: "https://github.com/nickpalenchar",
    icon: "mdi:github",
    external: true,
  },
  {
    title: "LinkedIn",
    url: "https://linkedin.com/in/nickpalenchar",
    icon: "mdi:linkedin",
    external: true,
  },
  {
    title: "Mail",
    url: "mailto:nickpal@nickpalenchar.com",
    icon: "mdi:email",
  },
];

// Home (/)
export const homePageContent: HomePageContent = {
  seo: {
    title: "Nick Palenchar",
    description: "Software developer and aerialist based in NYC.",
    image: identity.logo,
  },
  role: "Software Engineer",
  description:
    "I'm Nick Palenchar, a software developer and aerialist based in NYC.",
  socialLinks: socialLinks,
  links: [
    {
      title: "My Projects",
      url: "/projects",
    },
  ],
};

// About (/about)
export const aboutPageContent: AboutPageContent = {
  seo: {
    title: "About | Nick Palenchar",
    description: "Software developer and writer based in NYC.",
    image: identity.logo,
  },
  subtitle: "Some information about myself",
  about: {
    description: `
I'm Nick Palenchar, a software developer and aerialist based in NYC.
<br/><br/>
I love building things with code and sharing what I learn along the way.`,
    image_l: {
      url: "/me.jpg",
      alt: "Left Picture",
    },
    image_r: {
      url: "/aerial.png",
      alt: "Right Picture",
    },
  },
  work: {
    description: `I've worked with a variety of technologies and tools to build cool things. Here are some of the projects I've worked on.`, // Markdown is supported
    items: [
      {
        title: "Senior Backend Developer",
        company: {
          name: "Atlassian",
          image: "/atlassian_logo.jpeg",
          url: "https://www.atlassian.com/",
        },
        date: "2020 - Present",
        description: "",
      },
      {
        title: "Software Developer – Infrastructure Platform",
        company: {
          name: "GQR",
          image: "/gqrgm_logo.jpeg",
          url: "",
        },
        date: "2019 - 2020",
      },
      {
        title: "Backend/Infrastructure Developer",
        company: {
          name: "Untapt",
          image: "/untapt_logo.jpeg",
          url: "",
        },
        date: "2018 - 2019",
      },
      {
        title: "Lead Engineer – Tech Enablement and DevOps",
        company: {
          name: "New York Life",
          image: "/newyorklife_logo.jpeg",
          url: "",
        },
        date: "2016 - 2018",
      },
    ],
  },
  connect: {
    description: `I'm always interested in meeting new people and learning new things. Feel free to connect with me on any of the following platforms.`, // Markdown is supported
    links: socialLinks,
  },
};

// Projects (/projects)
export const projectsPageContent: ProjectPageContent = {
  seo: {
    title: "Projects | Nick Palenchar",
    description: "Check out what I've been working on.",
    image: identity.logo,
  },
  subtitle: "Check out what I've been working on.",
  projects: [
    {
      title: "Project 1",
      description: "Project 1 Description",
      image: "/demo-2.jpg",
      year: "2024",
      url: "https://github.com/nickpalenchar",
    },
    {
      title: "Project 1",
      description: "Project 1 Description",
      image: "/demo-2.jpg",
      year: "2024",
      url: "https://github.com/nickpalenchar",
    },
    {
      title: "Project 1",
      description: "Project 1 Description",
      image: "/demo-2.jpg",
      year: "2024",
      url: "https://github.com/nickpalenchar",
    },
  ],
};

// Blog (/blog)
export const blogPageContent: BlogPageContent = {
  seo: {
    title: "Blog | Nick Palenchar",
    description: "Thoughts, stories and ideas.",
    image: identity.logo,
  },
  subtitle: "Thoughts, stories and ideas.",
};
