"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirmStore } from "@/hooks/useConfirm";

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
  } = useConfirmStore();

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
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
