import React, { useState, useEffect } from 'react';
import './App.css';
import PostList from './components/PostList';
import Editor from './components/Editor';
import { Post, Frontmatter } from './types';

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSelect = async (post: Post) => {
    try {
      const response = await fetch(`http://localhost:4000/api/posts/${post.slug}`);
      const data = await response.json();
      setSelectedPost({
        ...post,
        frontmatter: data.frontmatter,
        content: data.content,
      });
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };

  const handleSave = async (frontmatter: Frontmatter, content: string) => {
    if (!selectedPost) return;

    try {
      const response = await fetch(`http://localhost:4000/api/posts/${selectedPost.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frontmatter, content }),
      });

      if (!response.ok) throw new Error('Failed to save post');
      await fetchPosts();
      setSelectedPost({
        ...selectedPost,
        frontmatter,
        content,
      });
      alert('Post saved successfully!');
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post');
    }
  };

  const handleNewPost = async () => {
    const today = new Date().toISOString().split('T')[0];
    const suggested = `New Post ${new Date().toLocaleString()}`;
    const title = window.prompt('Title for new post?', suggested) || suggested;

    const frontmatter: Frontmatter = {
      title,
      date: today,
      description: '',
      tags: [],
      external: false,
      draft: true,
    };

    try {
      const response = await fetch(`http://localhost:4000/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, frontmatter, content: '' }),
      });

      if (!response.ok) throw new Error('Failed to create post');
      const result = await response.json();
      const slug = result.slug;

      await fetchPosts();

      const created: Post = {
        slug,
        title: frontmatter.title,
        date: frontmatter.date,
        draft: frontmatter.draft,
        frontmatter,
        content: '',
      };
      setSelectedPost(created);
    } catch (e) {
      console.error(e);
      alert('Failed to create post');
    }
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Blog Editor</h1>
          <button onClick={handleNewPost} className="new-post-btn">
            New Post
          </button>
        </div>
        <PostList 
          posts={posts} 
          selectedPost={selectedPost}
          onPostSelect={handlePostSelect}
        />
      </div>
      <div className="main-content">
        {selectedPost ? (
          <Editor 
            post={selectedPost}
            onSave={handleSave}
          />
        ) : (
          <div className="welcome">
            <h2>Welcome to Blog Editor</h2>
            <p>Select a post from the sidebar to start editing, or create a new post.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;