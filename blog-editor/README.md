# Blog Editor

A WYSIWYG markdown editor for your Astro blog. This React application allows you to create, edit, and manage your blog posts with a user-friendly interface.

## Features

- **Post Management**: List all your existing blog posts with metadata
- **WYSIWYG Editor**: Rich markdown editor with live preview
- **Frontmatter Editing**: Sidebar for editing post metadata (title, date, tags, etc.)
- **Image Upload**: Drag and drop or paste images directly into posts
- **Auto-save**: Track unsaved changes and save posts to your Astro blog
- **Draft Support**: Mark posts as drafts or published

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server (runs both React app and backend):
   ```bash
   npm run dev
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Backend server
   npm run server
   
   # Terminal 2 - React app
   npm start
   ```

3. Open your browser to `http://localhost:3000`

## How it Works

The editor connects to your Astro blog's content directory (`../blog/src/content/posts/`) and:

- Reads existing markdown files with frontmatter
- Allows editing both content and metadata
- Saves changes back to your blog's file system
- Handles image uploads to your blog's public directory

## File Structure

```
blog-editor/
├── server.js              # Express backend server
├── src/
│   ├── App.tsx           # Main application component
│   ├── components/
│   │   ├── Editor.tsx    # WYSIWYG markdown editor
│   │   ├── PostList.tsx  # List of blog posts
│   │   └── FrontmatterSidebar.tsx # Metadata editor
│   └── types.ts          # TypeScript interfaces
└── README.md
```

## Backend API

The Express server provides these endpoints:

- `GET /api/posts` - List all blog posts
- `GET /api/posts/:slug` - Get specific post content
- `POST /api/posts/:slug` - Save post changes
- `POST /api/posts` - Create new post
- `POST /api/upload-image` - Upload images

## Configuration

The server is configured to work with your Astro blog structure:
- Posts directory: `../blog/src/content/posts/`
- Images directory: `../blog/public/images/`

Make sure your Astro blog is in the correct relative path for the editor to work properly.