// "use client";

import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// Define the Tag type (should match the one in your system)
export interface Tag {
  id: number;
  name: string;
  parent_tag?: { id: number } | null;
  children_tags?: Tag[];
}

// Extend Tag with children array for tree building
export interface TagTreeNode extends Tag {
  children?: TagTreeNode[];
}

export interface TagsSelectorProps {
  tags: Tag[];
  currentTag?: Tag | null;
  placeholder?: string;
  onSelect: (tag: Tag) => void;
}

// Build a tree structure from a flat list of tags
const buildTagTree = (tags: Tag[]): TagTreeNode[] => {
  if (tags.some((tag) => tag.children_tags !== undefined)) {
    return tags
      .filter((tag) => !tag.parent_tag)
      .map((tag) => ({
        ...tag,
        children: tag.children_tags || [],
      }));
  }
  const map = new Map<number, TagTreeNode>();
  tags.forEach((tag) => {
    map.set(tag.id, { ...tag, children: [] });
  });
  const tree: TagTreeNode[] = [];
  map.forEach((tag) => {
    if (tag.parent_tag && tag.parent_tag.id && map.has(tag.parent_tag.id)) {
      map.get(tag.parent_tag.id)?.children?.push(tag);
    } else {
      tree.push(tag);
    }
  });
  return tree;
};

// Recursive component to render a tag tree item and its children
interface TagTreeItemProps {
  node: TagTreeNode;
  depth: number;
  onSelect: (tag: Tag) => void;
}

const TagTreeItem: React.FC<TagTreeItemProps> = ({ node, depth, onSelect }) => {
  return (
    <div>
      <div
        style={{ paddingLeft: depth * 16, cursor: "pointer" }}
        onClick={() => onSelect(node)}
      >
        {node.name}
      </div>
      {node.children &&
        node.children.map((child) => (
          <TagTreeItem
            key={child.id}
            node={child}
            depth={depth + 1}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
};

export const TagsSelector: React.FC<TagsSelectorProps> = ({
  tags,
  currentTag,
  placeholder = "Seleccionar tag",
  onSelect,
}) => {
  const treeData = buildTagTree(tags);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {currentTag ? currentTag.name : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent style={{ width: 300, maxHeight: 400, overflowY: "auto" }}>
        {treeData.map((node) => (
          <TagTreeItem
            key={node.id}
            node={node}
            depth={0}
            onSelect={onSelect}
          />
        ))}
      </PopoverContent>
    </Popover>
  );
};
