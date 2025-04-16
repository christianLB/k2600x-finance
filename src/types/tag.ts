export interface Tag {
  id: number;
  name: string;
  documentId?: string;
  parent_tag?: Tag | null;
  appliesTo?: string;
  children_tags?: Tag[];
  color?: string;
}

// Extend Tag with children array for tree building
export interface TagTreeNode extends Tag {
  children?: TagTreeNode[];
}
