import React from "react";
import { TagsSelector } from "../operation-tags/TagsSelector";
import type { Tag } from "../operation-tags/TagsSelector";

interface TagsCellProps {
  value: Tag | null;
  onChange: (tag: Tag) => void;
  appliesTo: string;
  fetchCollection: string;
}

export const TagsCell: React.FC<TagsCellProps> = ({ value, onChange, appliesTo, fetchCollection }) => {
  return (
    <TagsSelector
      appliesTo={appliesTo}
      fetchCollection={fetchCollection}
      currentTag={value}
      onSelect={onChange}
    />
  );
};
