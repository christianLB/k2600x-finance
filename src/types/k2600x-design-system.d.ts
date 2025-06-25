// Type declarations to resolve JSX element compatibility issues
import React from 'react';

declare module '@k2600x/design-system' {
  // Fix Dialog component types
  export interface DialogProps {
    isOpen?: boolean;
    onClose?: () => void;
    children?: React.ReactNode;
    className?: string;
  }
  
  export const Dialog: React.FC<DialogProps>;
  export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  
  // Fix DataTable component types
  export interface DataTableProps<TData> {
    data: TData[];
    columns: any[];
    pagination?: {
      pageCount: number;
      currentPage: number;
      itemsPerPage: number;
      onPageChange: (page: number) => void;
    };
  }
  
  export const DataTable: <TData extends object>(props: DataTableProps<TData>) => JSX.Element;
  
  // Other components
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
  }
  
  export const Button: React.FC<ButtonProps>;
  
  // Add other components as needed
  export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>>;
}
