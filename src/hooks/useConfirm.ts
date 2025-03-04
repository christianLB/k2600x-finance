import { create } from "zustand";

interface ConfirmDialogState {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;

  show: (options: {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => void;

  hide: () => void;
}

export const useConfirmStore = create<ConfirmDialogState>((set) => ({
  open: false,
  title: "",
  description: "",
  confirmText: "Confirmar",
  cancelText: "Cancelar",
  onConfirm: undefined,
  onCancel: undefined,

  show: (options) =>
    set({
      open: true,
      ...options,
    }),

  hide: () =>
    set({
      open: false,
      title: "",
      description: "",
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      onConfirm: undefined,
      onCancel: undefined,
    }),
}));

export const useConfirm = () => {
  const { show } = useConfirmStore();
  return show;
};
