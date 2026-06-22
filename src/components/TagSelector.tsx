import { useState, useRef, useEffect } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { PRESET_TAGS } from '../utils/constants';
import { cn } from '../lib/utils';
import { TagBadge } from './TagBadge';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
}

export const TagSelector = ({ selectedTags, onChange, className }: TagSelectorProps) => {
  const [customInput, setCustomInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((t) => t !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  const addCustomTag = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      onChange([...selectedTags, trimmed]);
    }
    setCustomInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    } else if (e.key === 'Backspace' && customInput === '' && selectedTags.length > 0) {
      onChange(selectedTags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTags.filter((t) => t !== tagToRemove));
  };

  const availablePresetTags = PRESET_TAGS.filter((tag) => !selectedTags.includes(tag.id));

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
        <Tag className="w-4 h-4" />
        <span>标签</span>
      </div>

      <div
        className={cn(
          'min-h-[44px] px-3 py-2 border rounded-xl cursor-text transition-all',
          'border-gray-200 focus-within:ring-2 focus-within:ring-amber-200 focus-within:border-amber-400',
          'flex flex-wrap gap-1.5 items-center'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 group"
          >
            <TagBadge tagName={tag} className="pr-1" />
            <button
              onClick={(e) => removeTag(tag, e)}
              className="w-4 h-4 rounded-full bg-gray-200 hover:bg-red-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={customInput}
          onChange={(e) => {
            setCustomInput(e.target.value);
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          placeholder={selectedTags.length === 0 ? '选择或输入标签...' : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
        />

        {customInput && (
          <button
            type="button"
            onClick={addCustomTag}
            className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs font-medium hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-3 h-3" />
            添加
          </button>
        )}
      </div>

      {showDropdown && availablePresetTags.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20 max-h-[240px] overflow-y-auto">
          <div className="px-3 py-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
            常用标签
          </div>
          <div className="px-2 py-1 flex flex-wrap gap-1.5">
            {availablePresetTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium border transition-all hover:scale-105',
                  tag.color
                )}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
