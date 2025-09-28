import React, { useState, useEffect } from 'react';
import MarkdownIt from 'markdown-it';
import { Post, Frontmatter } from '../types';
import FrontmatterSidebar from './FrontmatterSidebar';
import './Editor.css';

interface EditorProps {
  post: Post;
  onSave: (frontmatter: Frontmatter, content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ post, onSave }) => {
  const [frontmatter, setFrontmatter] = useState<Frontmatter>(post.frontmatter);
  const [content, setContent] = useState(post.content || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const mdParser = new MarkdownIt();

  useEffect(() => {
    setFrontmatter(post.frontmatter);
    setContent(post.content || '');
    setHasUnsavedChanges(false);
  }, [post]);

  const handleContentChange = (text: string) => {
    setContent(text);
    setHasUnsavedChanges(true);
  };

  const handleFrontmatterChange = (newFrontmatter: Frontmatter) => {
    setFrontmatter(newFrontmatter);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onSave(frontmatter, content);
    setHasUnsavedChanges(false);
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('http://localhost:4000/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Image upload failed');
        return;
      }

      const data = await response.json();
      const imageMarkdown = `![${file.name}](${data.url})`;
      setContent(prev => prev + '\n' + imageMarkdown);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2>{post.title}</h2>
        <div className="editor-actions">
          {hasUnsavedChanges && (
            <span className="unsaved-indicator">Unsaved changes</span>
          )}
          <button onClick={handleSave} className="save-btn">
            Save
          </button>
        </div>
      </div>
      
      <div className="editor-content">
        <div className="editor-main">
          <div className="editor-tabs">
            <button 
              className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              Edit
            </button>
            <button 
              className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
          </div>
          
          <div className="editor-panel">
            {activeTab === 'edit' ? (
              <div className="markdown-editor">
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Write your markdown here..."
                  className="markdown-textarea"
                />
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="image-upload-button">
                    📷 Upload Image
                  </label>
                </div>
              </div>
            ) : (
              <div className="markdown-preview">
                <div 
                  dangerouslySetInnerHTML={{ __html: mdParser.render(content) }}
                />
              </div>
            )}
          </div>
        </div>
        
        <FrontmatterSidebar
          frontmatter={frontmatter}
          onChange={handleFrontmatterChange}
        />
      </div>
    </div>
  );
};

export default Editor;
