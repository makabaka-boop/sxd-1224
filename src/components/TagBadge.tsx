import { PRESET_TAGS, TAG_COLORS } from '../utils/constants';
import { cn } from '../lib/utils';

interface TagBadgeProps {
  tagName: string;
  className?: string;
}

export const TagBadge = ({ tagName, className }: TagBadgeProps) => {
  const presetTag = PRESET_TAGS.find((t) => t.id === tagName || t.name === tagName);
  const color = presetTag?.color || getColorForCustomTag(tagName);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        color,
        className
      )}
    >
      {presetTag?.name || tagName}
    </span>
  );
};

const getColorForCustomTag = (tagName: string): string => {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
};
