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
import { Tag } from "@/types/tag";

interface TagsManagerProps {
  appliesTo: string;
}

export default function TagsManager({ appliesTo }: TagsManagerProps) {
  const collection = "operation-tags";
  const {
    data: { data: tags = [] },
    refetch,
    create,
  } = useStrapiCollection<Tag>(collection, {
    filters: { appliesTo: { $contains: appliesTo } },
    pagination: { page: 1, pageSize: 500 },
    populate: ["parent_tag"],
  });

  const [treeData, setTreeData] = useState<NodeModel<number>[]>([]);
  const { mutateAsync: updateTag } = useStrapiUpdateMutation<Tag>(collection);
  const confirm = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [tagDraft, setTagDraft] = useState<Partial<Tag>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const mapped = tags.map((tag: any) => ({
      id: tag.id,
      parent: tag.parent_tag?.id ?? 0,
      text: tag.name,
      droppable: true,
      data: tag,
    }));
    setTreeData(mapped);
  }, [tags]);

  const handleDrop = async (
    newTree: NodeModel<number>[],
    { dragSourceId, dropTargetId }: any
  ) => {
    setTreeData(newTree);
    const documentId = String(dragSourceId);

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
    //@ts-ignore
    setTagDraft({ name: tag.name, color: tag.color });
    setEditingId(tag.id);
    setModalOpen(true);
  };

  const handleDelete = (tag: Tag) => {
    confirm({
      title: "¿Eliminar tag?",
      description: `Esta acción eliminará '${tag.name}'.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        //@ts-ignore
        await updateTag({ documentId: String(tag.id), updatedData: null });
        refetch();
      },
    });
  };

  const handleCreate = (parentId?: number) => {
    //@ts-ignore
    setTagDraft({ name: "", color: "#ccc", parent_tag: parentId ?? null });
    setEditingId(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload: Partial<Tag> = {
      ...tagDraft,
      appliesTo: appliesTo, // Changed to single value
    };

    try {
      if (editingId) {
        await updateTag({
          documentId: String(editingId),
          updatedData: payload,
        });
      } else {
        await create(payload as Tag);
      }
      refetch();
      setModalOpen(false);
    } catch (err) {
      console.error("Error al guardar tag", err);
    }
  };

  return (
    <div className="p-4 border rounded bg-white">
      <div className="flex justify-between mb-2">
        <h2 className="font-semibold">Tags: {appliesTo}</h2>
        <Button size="sm" onClick={() => handleCreate()}>
          <PlusIcon className="w-4 h-4 mr-1" />
          Nuevo
        </Button>
      </div>
      <DndProvider backend={HTML5Backend}>
        <Tree
          tree={treeData}
          rootId={0}
          onDrop={handleDrop}
          render={(node, { depth, isOpen, onToggle }) => {
            //@ts-ignore
            const tag = node.data as Tag;
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
                    className="w-3 h-3 rounded-full" //@ts-ignore
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
        />
      </DndProvider>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Tag" : "Nuevo Tag"}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nombre del tag"
            value={tagDraft.name ?? ""}
            onChange={(e) => setTagDraft({ ...tagDraft, name: e.target.value })}
          />
          <Input
            type="color" //@ts-ignore
            value={tagDraft.color ?? "#cccccc"}
            onChange={(
              e //@ts-ignore
            ) => setTagDraft({ ...tagDraft, color: e.target.value })}
          />
          <Button onClick={handleSave} disabled={!tagDraft.name}>
            Guardar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}