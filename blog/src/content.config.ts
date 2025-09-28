// Import utilities from `astro:content`
import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

// Define a `type` and `schema` for each collection
const postsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string().describe("The title of your blog post"),
    date: z.date().describe("Publication date"),
    description: z.string().optional().describe("SEO description for the post"),
    tags: z.array(z.string()).default([]).describe("Tags for categorization"),
    external: z.boolean().default(false).describe("Is this an external link?"),
    draft: z.boolean().default(false).describe("Is this a draft?"),
    aliases: z.array(z.string()).optional().describe("URL aliases for this post"),
    readingTime: z.number().optional().describe("Estimated reading time in minutes"),
  }),
});

const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string().describe("Project name"),
    description: z.string().describe("Project description"),
    date: z.date().describe("Project completion date"),
    url: z.string().describe("Project URL or GitHub link"),
    image: z.string().optional().describe("Project image/screenshot"),
    draft: z.boolean().default(false).describe("Is this project a draft?"),
  }),
});

const favsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/favs" }),
  schema: z.object({
    title: z.string().describe("Favorites list title"),
    date: z.date().describe("Last updated date"),
    external: z.boolean().default(false).describe("Is this an external link?"),
    hide: z.array(z.string()).optional().describe("Items to hide from display"),
  }),
});

// Export a single `collections` object to register your collection(s)
export const collections = {
  posts: postsCollection,
  projects: projectsCollection,
  favs: favsCollection,
};
