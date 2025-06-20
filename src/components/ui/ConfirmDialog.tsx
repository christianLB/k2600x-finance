"use client";

import { ConfirmDialog as DSConfirmDialog } from "@k2600x/design-system";
import React from "react";
import { useConfirmStore } from "@/hooks/useConfirm";

export function ConfirmDialog() {
  const {
    open,
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    hide,
    extraContent,
  } = useConfirmStore();

  const [extraState, setExtraState] = React.useState<any>(undefined);

  React.useEffect(() => {
    setExtraState(undefined);
  }, [open]);

  const handleConfirm = () => {
    if (onConfirm) onConfirm(extraState);
    hide();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    hide();
  };

  return (
    <DSConfirmDialog
      isOpen={open}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={title || ""}
      description={description || ""}
      confirmText={confirmText || "Ok"}
      cancelText={cancelText || "Cancel"}
    >
      {React.isValidElement(extraContent) &&
        React.cloneElement(extraContent as React.ReactElement<any>, {
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setExtraState((e.target as HTMLInputElement).checked ?? undefined),
        })}
    </DSConfirmDialog>
  );
}
