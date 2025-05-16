declare module '@k2600x/design-system/dist/components/ConfirmDialog' {
  import { FC } from 'react';
  
  const ConfirmDialog: FC;
  
  export default ConfirmDialog;
}

declare module '@k2600x/design-system/dist/components/multi-select' {
  import { FC } from 'react';
  
  interface MultiSelectProps {
    options: Array<{ value: string | number; label: string }>;
    defaultValue?: (string | number)[];
    onChange?: (value: (string | number)[]) => void;
    placeholder?: string;
    className?: string;
  }
  
  const MultiSelect: FC<MultiSelectProps>;
  
  export default MultiSelect;
}
