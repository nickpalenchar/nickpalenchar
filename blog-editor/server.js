const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const BLOG_DIR = path.resolve(__dirname, '../blog/src/content');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const IMAGES_DIR = path.resolve(__dirname, '../blog/public/images');

// Serve static images from the blog's public directory
app.use('/images', express.static(IMAGES_DIR));

fs.mkdirSync(IMAGES_DIR, { recursive: true });

const upload = multer({ dest: 'tmp_uploads/' });

app.post('/api/upload-image', upload.single('image'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${Date.now()}${ext}`;
  const targetPath = path.join(IMAGES_DIR, filename);
  
  try {
    fs.renameSync(file.path, targetPath);
    const publicUrl = `http://localhost:4000/images/${filename}`;
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

app.get('/api/posts', (req, res) => {
  try {
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md') && !f.startsWith('_'));
    const posts = files.map(f => {
      const slug = f.replace(/\.md$/, '');
      const filePath = path.join(POSTS_DIR, f);
      const raw = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(raw);
      const stats = fs.statSync(filePath);
      return { 
        slug, 
        title: data.title || 'Untitled',
        date: data.date,
        draft: data.draft || false,
        createdAt: stats.birthtime,
        frontmatter: {
          title: data.title || 'Untitled',
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          description: data.description || '',
          tags: data.tags || [],
          external: data.external || false,
          draft: data.draft || false,
          aliases: data.aliases || [],
          readingTime: data.readingTime || undefined
        }
      };
    });
    
    // Sort by creation date (newest first)
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(posts);
  } catch (error) {
    console.error('Error reading posts:', error);
    res.status(500).json({ error: 'Failed to read posts' });
  }
});

app.get('/api/posts/:slug', (req, res) => {
  const slug = req.params.slug;
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);
    const frontmatter = {
      title: data.title || 'Untitled',
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: data.description || '',
      tags: data.tags || [],
      external: data.external || false,
      draft: data.draft || false,
      aliases: data.aliases || [],
      readingTime: data.readingTime || undefined
    };
    res.json({ frontmatter, content });
  } catch (error) {
    console.error('Error reading post:', error);
    res.status(500).json({ error: 'Failed to read post' });
  }
});

app.post('/api/posts/:slug', (req, res) => {
  const slug = req.params.slug;
  const { frontmatter, content } = req.body;
  
  try {
    // Clean up frontmatter - handle different field types properly
    const cleanedFrontmatter = {};
    Object.keys(frontmatter).forEach(key => {
      const value = frontmatter[key];
      
      if (key === 'date') {
        // Date field - ensure it's a valid date string
        if (value) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            cleanedFrontmatter[key] = date.toISOString().split('T')[0];
          }
        }
      } else if (key === 'description') {
        // Description field - provide empty string if null/undefined
        cleanedFrontmatter[key] = value || '';
      } else if (Array.isArray(value)) {
        // Array fields - only include non-empty arrays
        if (value.length > 0) {
          cleanedFrontmatter[key] = value;
        }
      } else if (typeof value === 'boolean') {
        // Boolean fields - always include
        cleanedFrontmatter[key] = value;
      } else if (typeof value === 'string') {
        // String fields - include if not empty
        if (value.trim() !== '') {
          cleanedFrontmatter[key] = value;
        }
      } else if (typeof value === 'number') {
        // Number fields - include if valid
        if (!isNaN(value)) {
          cleanedFrontmatter[key] = value;
        }
      }
    });
    
    // Use matter.stringify with custom options to avoid quotes around dates
    const md = matter.stringify(content, cleanedFrontmatter, {
      delimiters: '---',
      language: 'yaml'
    });
    
    // Post-process to remove quotes from date field
    const lines = md.split('\n');
    const processedLines = lines.map(line => {
      if (line.startsWith('date:')) {
        return line.replace(/date:\s*['"]([^'"]+)['"]/, 'date: $1');
      }
      return line;
    });
    
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    fs.writeFileSync(filePath, processedLines.join('\n'), 'utf8');
    res.json({ ok: true });
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ error: 'Failed to save post' });
  }
});

app.post('/api/posts', (req, res) => {
  const { title, frontmatter, content } = req.body;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  
  if (fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'Post with this title already exists' });
  }
  
  try {
    // Clean up frontmatter - handle different field types properly
    const cleanedFrontmatter = {};
    Object.keys(frontmatter).forEach(key => {
      const value = frontmatter[key];
      
      if (key === 'date') {
        // Date field - ensure it's a valid date string
        if (value) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            cleanedFrontmatter[key] = date.toISOString().split('T')[0];
          }
        }
      } else if (key === 'description') {
        // Description field - provide empty string if null/undefined
        cleanedFrontmatter[key] = value || '';
      } else if (Array.isArray(value)) {
        // Array fields - only include non-empty arrays
        if (value.length > 0) {
          cleanedFrontmatter[key] = value;
        }
      } else if (typeof value === 'boolean') {
        // Boolean fields - always include
        cleanedFrontmatter[key] = value;
      } else if (typeof value === 'string') {
        // String fields - include if not empty
        if (value.trim() !== '') {
          cleanedFrontmatter[key] = value;
        }
      } else if (typeof value === 'number') {
        // Number fields - include if valid
        if (!isNaN(value)) {
          cleanedFrontmatter[key] = value;
        }
      }
    });
    
    // Use matter.stringify with custom options to avoid quotes around dates
    const md = matter.stringify(content, cleanedFrontmatter, {
      delimiters: '---',
      language: 'yaml'
    });
    
    // Post-process to remove quotes from date field
    const lines = md.split('\n');
    const processedLines = lines.map(line => {
      if (line.startsWith('date:')) {
        return line.replace(/date:\s*['"]([^'"]+)['"]/, 'date: $1');
      }
      return line;
    });
    
    fs.writeFileSync(filePath, processedLines.join('\n'), 'utf8');
    res.json({ slug, ok: true });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Blog editor backend listening on http://localhost:${PORT}`);
});
