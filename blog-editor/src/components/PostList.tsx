import React from 'react';
import { Post } from '../types';
import './PostList.css';

interface PostListProps {
  posts: Post[];
  selectedPost: Post | null;
  onPostSelect: (post: Post) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, selectedPost, onPostSelect }) => {
  return (
    <div className="post-list">
      {posts.map((post) => (
        <div
          key={post.slug}
          className={`post-item ${selectedPost?.slug === post.slug ? 'selected' : ''}`}
          onClick={() => onPostSelect(post)}
        >
          <div className="post-title">{post.title}</div>
          <div className="post-meta">
            <span className={`post-status ${post.draft ? 'draft' : 'published'}`}>
              {post.draft ? 'Draft' : 'Published'}
            </span>
            <span className="post-date">
              {new Date(post.date).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
