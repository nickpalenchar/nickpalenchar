import React from 'react';
import { Frontmatter } from '../types';
import './FrontmatterSidebar.css';

interface FrontmatterSidebarProps {
  frontmatter: Frontmatter;
  onChange: (frontmatter: Frontmatter) => void;
}

const FrontmatterSidebar: React.FC<FrontmatterSidebarProps> = ({ frontmatter, onChange }) => {
  const formatDateForInput = (date: string | undefined): string => {
    if (!date) return new Date().toISOString().split('T')[0];
    
    // Handle different date formats
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    return dateObj.toISOString().split('T')[0];
  };

  const handleChange = (field: keyof Frontmatter, value: any) => {
    onChange({
      ...frontmatter,
      [field]: value
    });
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    // Always ensure tags is an array, even if empty
    handleChange('tags', tags);
  };

  return (
    <div className="frontmatter-sidebar">
      <h3>Post Settings</h3>
      
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={frontmatter.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter post title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={formatDateForInput(frontmatter.date)}
          onChange={(e) => handleChange('date', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={frontmatter.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter post description"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <input
          id="tags"
          type="text"
          value={(frontmatter.tags || []).join(', ')}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={frontmatter.draft}
            onChange={(e) => handleChange('draft', e.target.checked)}
          />
          <span className="checkmark"></span>
          Draft
        </label>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={frontmatter.external}
            onChange={(e) => handleChange('external', e.target.checked)}
          />
          <span className="checkmark"></span>
          External Link
        </label>
      </div>

      {(frontmatter.aliases && frontmatter.aliases.length > 0) && (
        <div className="form-group">
          <label htmlFor="aliases">Aliases</label>
          <input
            id="aliases"
            type="text"
            value={(frontmatter.aliases || []).join(', ')}
            onChange={(e) => {
              const aliases = e.target.value.split(',').map(alias => alias.trim()).filter(alias => alias.length > 0);
              handleChange('aliases', aliases);
            }}
            placeholder="alias1, alias2"
          />
        </div>
      )}

      {frontmatter.readingTime && (
        <div className="form-group">
          <label htmlFor="readingTime">Reading Time (minutes)</label>
          <input
            id="readingTime"
            type="number"
            value={frontmatter.readingTime}
            onChange={(e) => handleChange('readingTime', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>
      )}
    </div>
  );
};

export default FrontmatterSidebar;
