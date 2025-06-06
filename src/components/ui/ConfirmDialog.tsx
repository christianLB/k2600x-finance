"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
} from "@k2600x/design-system";
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
    <Dialog open={open} onOpenChange={hide}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {React.isValidElement(extraContent) && (
          <div className="mb-2">
            {React.cloneElement(extraContent as React.ReactElement<any>, {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setExtraState((e.target as HTMLInputElement).checked ?? undefined),
            })}
          </div>
        )}
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
