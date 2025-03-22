"use client";

import { useState, useEffect } from "react";
import { DndProvider } from "@minoru/react-dnd-treeview";
import { Tree, NodeModel } from "@minoru/react-dnd-treeview";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon, PlusIcon } from "lucide-react";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { useStrapiUpdateMutation } from "@/hooks/useStrapiUpdateMutation";
import { useConfirm } from "@/hooks/useConfirm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Tag {
  id: number;
  documentId: string;
  name: string;
  color?: string;
  icon?: string;
  parent_tag?: { id: number } | null;
}

export default function OperationTagsManager() {
  const {
    data: { data: tags = [] },
    refetch,
    create,
  } = useStrapiCollection<Tag>("operation-tags", {
    pagination: { page: 1, pageSize: 1000 },
    populate: ["parent_tag"],
  });

  const [treeData, setTreeData] = useState<NodeModel<number>[]>([]);
  const { mutateAsync: updateTag } =
    useStrapiUpdateMutation<Tag>("operation-tags");
  const confirm = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [tagDraft, setTagDraft] = useState<
    Partial<Tag> & { parent_tag?: number | null }
  >({});
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (tags.length) {
      const mapped = tags.map((tag) => ({
        id: tag.id,
        parent: tag.parent_tag?.id ?? 0,
        text: tag.name,
        droppable: true,
        data: tag,
      })); //@ts-ignore
      setTreeData(mapped);
    }
  }, [tags]);

  const handleDrop = async (
    newTree: NodeModel<number>[],
    { dragSourceId, dropTargetId }: any
  ) => {
    setTreeData(newTree);
    const dragged = treeData.find((n) => n.id === dragSourceId);
    const documentId =
      (dragged?.data as unknown as Tag)?.documentId ?? String(dragSourceId);

    try {
      await updateTag({
        documentId,
        updatedData: { parent_tag: dropTargetId !== 0 ? dropTargetId : null },
      });
      refetch();
    } catch (e) {
      console.error("Error al actualizar jerarquía:", e);
    }
  };

  const handleEdit = (tag: Tag) => {
    setTagDraft({
      name: tag.name,
      color: tag.color, //@ts-ignore (parent_tag)
      parent_tag: tag.parent_tag?.id ?? null,
    });
    setEditingId(tag.id);
    setModalOpen(true);
  };

  const handleDelete = (tag: Tag) => {
    confirm({
      title: "¿Eliminar tag?",
      description: `Esta acción no se puede deshacer. Se eliminará el tag '${tag.name}'.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await fetch(`/api/strapi`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              method: "DELETE",
              collection: "operation-tags",
              id: tag.id,
            }),
          });
          refetch();
        } catch (err) {
          console.error("Error al eliminar tag", err);
        }
      },
    });
  };

  const handleCreate = (parentId?: number) => {
    //@ts-ignore (parent tag)
    setTagDraft({ name: "", color: "#ccc", parent_tag: parentId ?? null });
    setEditingId(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      name: tagDraft.name,
      color: tagDraft.color,
      parent_tag: tagDraft.parent_tag ?? null,
    };

    try {
      if (editingId) {
        await updateTag({
          documentId: String(editingId),
          updatedData: payload,
        });
      } else {
        await create({ ...payload } as Tag);
      }
      refetch();
      setModalOpen(false);
    } catch (err) {
      console.error("Error al guardar tag", err);
    }
  };

  return (
    <div className="flex gap-4">
      <div className="w-full max-w-md p-4 border rounded-md bg-white">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Tags jerárquicos</h2>
          <Button size="sm" onClick={() => handleCreate(undefined)}>
            <PlusIcon className="w-4 h-4 mr-1" /> Nuevo
          </Button>
        </div>
        <DndProvider backend={HTML5Backend}>
          <Tree
            tree={treeData}
            rootId={0}
            render={(node, { depth, isOpen, onToggle }) => {
              const tag = node.data as unknown as Tag;
              return (
                <div
                  style={{ marginInlineStart: depth * 16 }}
                  className="flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded"
                >
                  <div className="flex items-center gap-2">
                    {node.droppable && (
                      <span onClick={onToggle} className="cursor-pointer">
                        {isOpen ? "▾" : "▸"}
                      </span>
                    )}
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color || "#ccc" }}
                    ></span>
                    <span>{node.text}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(tag)}
                    >
                      <PencilIcon className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(tag)}
                    >
                      <Trash2Icon className="w-4 h-4 text-red-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCreate(tag.id)}
                    >
                      <PlusIcon className="w-4 h-4 text-green-600" />
                    </Button>
                  </div>
                </div>
              );
            }}
            dragPreviewRender={(monitorProps) => (
              <div>{monitorProps.item.text}</div>
            )}
            onDrop={handleDrop}
          />
        </DndProvider>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Tag" : "Nuevo Tag"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nombre del tag"
              value={tagDraft.name ?? ""}
              onChange={(e) =>
                setTagDraft({ ...tagDraft, name: e.target.value })
              }
            />
            <Input
              type="color"
              value={tagDraft.color ?? "#cccccc"}
              onChange={(e) =>
                setTagDraft({ ...tagDraft, color: e.target.value })
              }
            />
            <Button onClick={handleSave} disabled={!tagDraft.name}>
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
