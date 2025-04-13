export interface Tag {
  id: number;
  name: string;
  parent_tag?: { id: number } | null;
  appliesTo: string;
  children_tags?: Tag[];
}

// Extend Tag with children array for tree building
export interface TagTreeNode extends Tag {
  children?: TagTreeNode[];
}
