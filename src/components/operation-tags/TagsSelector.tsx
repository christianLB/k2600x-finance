"use client";

import React, { useState } from "react";
import { Button, Popover } from "@k2600x/design-system";
// import { useStrapiCollection } from "@/hooks/useStrapiCollection"; // DEPRECATED

export interface Tag {
  id: number;
  name: string;
  documentId?: string;
  parent_tag?: Tag | null;
  appliesTo?: string;
}

interface TagsSelectorProps {
  appliesTo: string;
  fetchCollection: string;
  currentTag?: Tag | null;
  placeholder?: string;
  onSelect: (tag: Tag) => void;
}

interface TagTreeNode extends Tag {
  children?: TagTreeNode[];
}

// Función para construir árbol desde lista plana
const buildTagTree = (tags: Tag[]): TagTreeNode[] => {
  const map = new Map<number, TagTreeNode>();
  tags.forEach((tag) => map.set(tag.id, { ...tag, children: [] }));

  const tree: TagTreeNode[] = [];
  map.forEach((tag) => {
    if (tag.parent_tag?.id && map.has(tag.parent_tag.id)) {
      map.get(tag.parent_tag.id)?.children?.push(tag);
    } else {
      tree.push(tag);
    }
  });
  return tree;
};

// Componente recursivo para renderizar el árbol
const TagTreeItem: React.FC<{
  node: TagTreeNode;
  depth: number;
  onSelect: (tag: Tag) => void;
  currentTagId?: number;
}> = ({ node, depth, onSelect, currentTagId }) => (
  <div>
    <div
      className={`pl-${depth * 4} cursor-pointer py-1 px-2 rounded ${
        currentTagId === node.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent hover:text-accent-foreground'
      }`}
      onClick={() => onSelect(node)}
    >
      {node.name}
    </div>
    {node.children?.map((child) => (
      <TagTreeItem
        key={child.id}
        node={child}
        depth={depth + 1}
        onSelect={onSelect}
        currentTagId={currentTagId}
      />
    ))}
  </div>
);

export const TagsSelector: React.FC<TagsSelectorProps> = ({
  appliesTo,
  fetchCollection,
  currentTag,
  placeholder = "Seleccionar tag",
  onSelect,
}) => {
  const [isOpen] = useState(false);

  // DEPRECATED: useStrapiCollection hook was removed
  const tags: Tag[] = []; // Placeholder for build compatibility

  const treeData = buildTagTree(tags);

  return (
    <Popover
      trigger={
        <Button variant="secondary" className="w-full justify-start">
          {currentTag?.name || placeholder}
        </Button>
      }
      align="left"
    >
      <div className="max-h-[300px] overflow-y-auto p-2">
        {treeData.map((node) => (
          <TagTreeItem
            key={node.id}
            node={node}
            depth={0}
            onSelect={onSelect}
            currentTagId={currentTag?.id}
          />
        ))}
      </div>
    </Popover>
  );
};
