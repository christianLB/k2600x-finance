"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirmStore } from "@/hooks/useConfirm";
import React from 'react';

export default function ConfirmDialog() {
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

  // Local state for checkbox (if present)
  const [deleteFile, setDeleteFile] = React.useState(false);
  React.useEffect(() => {
    setDeleteFile(false); // reset on open
  }, [open]);

  const handleConfirm = () => {
    if (onConfirm) onConfirm({ deleteFile });
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
        {extraContent && (
          <div className="mb-2">
            {React.cloneElement(extraContent as React.ReactElement, {
              // onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDeleteFile(e.target.checked),
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
