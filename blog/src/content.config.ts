// Import utilities from `astro:content`
import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

// Define a `type` and `schema` for each collection
const postsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    external: z.boolean().optional(),
    draft: z.boolean().optional(),
    aliases: z.array(z.string()).optional(),
    readingTime: z.number().optional(),
  }),
});

const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    url: z.string(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

const favsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./content/favs" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    external: z.boolean().optional(),
    hide: z.array(z.string()).optional(),
  }),
});

// Export a single `collections` object to register your collection(s)
export const collections = {
  posts: postsCollection,
  projects: projectsCollection,
  favs: favsCollection,
};
