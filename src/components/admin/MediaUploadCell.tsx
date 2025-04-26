import React from "react";
import { StrapiMediaUpload } from "./StrapiMediaUpload";

interface MediaUploadCellProps {
  value: any;
  onChange: (value: any) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  label?: string;
}

export const MediaUploadCell: React.FC<MediaUploadCellProps> = (props) => {
  return <StrapiMediaUpload {...props} />;
};
