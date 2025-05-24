import React from 'react';
import {
  File,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  FileSpreadsheet,
  FileType,
  Presentation,
  FileIcon as FilePdfIcon // Use a different icon for PDF
} from 'lucide-react';

type FileIconProps = {
  fileName: string;
  size?: number;
};

/**
 * FileIcon component that displays an appropriate Lucide icon based on file extension
 */
export const FileIcon: React.FC<FileIconProps> = ({ fileName, size = 24 }) => {
  // Extract file extension
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Get appropriate icon based on file extension
  const getIcon = () => {
    // Document files
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return <FileText size={size} />;
    }
    
    // PDF files
    if (extension === 'pdf') {
      return <FilePdfIcon size={size} />;
    }
    
    // Spreadsheet files
    if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return <FileSpreadsheet size={size} />;
    }
    
    // Presentation files
    if (['ppt', 'pptx'].includes(extension)) {
      return <Presentation size={size} />;
    }
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return <FileImage size={size} />;
    }
    
    // Video files
    if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) {
      return <FileVideo size={size} />;
    }
    
    // Archive files
    if (['zip', 'rar', 'tar', 'gz', '7z'].includes(extension)) {
      return <FileArchive size={size} />;
    }
    
    // Code files
    if (['html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml'].includes(extension)) {
      return <FileType size={size} />;
    }
    
    // Default file icon for any other file type
    return <File size={size} />;
  };

  return (
    <div 
      style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'currentColor' // Use the current text color
      }}
    >
      {getIcon()}
    </div>
  );
};
