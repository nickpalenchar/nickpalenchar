export interface Frontmatter {
  title: string;
  date: string;
  description?: string;
  tags: string[];
  external: boolean;
  draft: boolean;
  aliases?: string[];
  readingTime?: number;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  draft: boolean;
  frontmatter: Frontmatter;
  content?: string;
}
