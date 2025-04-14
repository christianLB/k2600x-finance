export interface Tag {
  id: number;
  name: string;
  parent_tag?: number;
  appliesTo: string;
  children_tags?: Tag[];
  color?: string;
}

// Extend Tag with children array for tree building
export interface TagTreeNode extends Tag {
  children?: TagTreeNode[];
}
