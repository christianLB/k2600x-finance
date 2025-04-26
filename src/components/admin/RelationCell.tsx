import React from "react";
import { StrapiRelationField } from "./StrapiRelationField";

interface RelationCellProps {
  name: string;
  value: string | number | Array<string | number> | null;
  onChange: (value: any) => void;
  target: string;
  isMulti?: boolean;
  disabled?: boolean;
  placeholder?: string;
  displayField?: string;
  apiUrl?: string;
  relatedPlural?: string;
}

export const RelationCell: React.FC<RelationCellProps> = (props) => {
  const finalTarget = props.relatedPlural || props.target;
  return <StrapiRelationField {...props} target={finalTarget} />;
};
