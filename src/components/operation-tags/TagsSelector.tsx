"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tag, TagTreeNode } from "@/types/tag";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";

interface TagsSelectorProps {
  appliesTo: string;
  currentTag?: Tag | null;
  placeholder?: string;
  onSelect: (tag: Tag) => void;
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
}> = ({ node, depth, onSelect }) => (
  <div>
    <div
      style={{ paddingLeft: depth * 16, cursor: "pointer" }}
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
      />
    ))}
  </div>
);

export const TagsSelector: React.FC<TagsSelectorProps> = ({
  appliesTo,
  currentTag,
  placeholder = "Seleccionar tag",
  onSelect,
}) => {
  const [, setIsOpen] = useState(false);

  const {
    data: { data: tags = [] } = { data: [] },
    isLoading,
  } = useStrapiCollection<Tag>("operation-tags", {
    filters: { appliesTo: { $contains: appliesTo } },
    pagination: { page: 1, pageSize: 500 },
    populate: ["parent_tag"],
  });

  // DEBUG LOGGING
  if (typeof window !== 'undefined') {
    console.log("TagsSelector fetched tags:", tags);
    console.log("TagsSelector currentTag:", currentTag);
  }

  const treeData = buildTagTree(tags);

  return (
    <Popover onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {currentTag ? currentTag.name : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent style={{ width: 300, maxHeight: 400, overflowY: "auto" }}>
        {isLoading ? (
          <div>Cargando tags...</div>
        ) : (
          treeData.map((node) => (
            <TagTreeItem
              key={node.id}
              node={node}
              depth={0}
              onSelect={onSelect}
            />
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};
