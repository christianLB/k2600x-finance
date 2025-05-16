"use client";

import { useState, useEffect } from "react";
import { DndProvider } from "@minoru/react-dnd-treeview";
import { Tree, NodeModel } from "@minoru/react-dnd-treeview";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@k2600x/design-system";
import { PencilIcon, Trash2Icon, PlusIcon } from "lucide-react";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { useStrapiUpdateMutation } from "@/hooks/useStrapiUpdateMutation";
import { useConfirm } from "@/hooks/useConfirm";
import useStrapiDelete from "@/hooks/useStrapiDelete";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@k2600x/design-system";
import { Input } from "@k2600x/design-system";
import { Tag } from "@/types/tag";

interface TagsManagerProps {
  appliesTo: string;
}

export default function TagsManager({ appliesTo }: TagsManagerProps) {
  const collection = "operation-tags";
  const {
    data: { data: tags = [] } = { data: [] },
    refetch,
    create,
  } = useStrapiCollection<Tag>(collection, {
    filters: { appliesTo: { $contains: appliesTo } },
    pagination: { page: 1, pageSize: 500 },
    populate: ["parent_tag"],
  });

  const [treeData, setTreeData] = useState<NodeModel<Tag>[]>([]);
  const { mutateAsync: updateTag } = useStrapiUpdateMutation<Tag>(collection);
  const { mutateAsync: deleteTag } = useStrapiDelete<Tag>(collection);
  const confirm = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [tagDraft, setTagDraft] = useState<Partial<Tag>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const mapped = tags.map((tag: Tag) => ({
      id: tag.id,
      parent: tag.parent_tag?.id || 0,
      text: tag.name,
      droppable: true,
      data: tag,
    }));
    setTreeData(mapped);
  }, [tags]);

  const sanitizeTagDraft = (draft: Partial<Tag>) => ({
    ...draft,
    parent_tag:
      draft.parent_tag && typeof draft.parent_tag === "object"
        ? draft.parent_tag.id
        : draft.parent_tag ?? null,
  });

  const handleDrop = async (
    newTree: NodeModel<Tag>[],
    { dragSourceId, dropTargetId }: any
  ) => {
    setTreeData(newTree);

    try {
      const tag = tags.find((t) => t.id === dragSourceId);
      const docId = tag?.documentId || dragSourceId;
      await updateTag({
        id: docId.toString(),
        updatedData: {
          parent_tag: dropTargetId !== 0 ? dropTargetId : null,
        },
      });
      refetch();
    } catch (e) {
      console.error("Error al actualizar jerarquía:", e);
    }
  };

  const handleEdit = (tag: Tag) => {
    setTagDraft({ name: tag.name, color: tag.color, parent_tag: tag.parent_tag });
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
        await deleteTag({ id: tag.documentId });
        refetch();
      },
    });
  };

  const handleCreate = (parent?: Tag) => {
    setTagDraft({ name: "", color: "#ccc", parent_tag: parent });
    setEditingId(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const sanitized = sanitizeTagDraft(tagDraft);
      if (editingId) {
        const tag = tags.find((t) => t.id === editingId);
        const docId = tag?.documentId || editingId;
        await updateTag({
          id: docId.toString(),
          updatedData: sanitized as any,
        });
      } else {
        await create({
          ...sanitized as any,
          appliesTo,
        } as Tag);
      }
      refetch();
      setModalOpen(false);
    } catch (err) {
      console.error("Error al guardar tag", err);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-2 md:p-4 transition-colors">
      <div className="flex justify-between mb-2">
        <h2 className="font-semibold">Tags: {appliesTo}</h2>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={() => handleCreate()}
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Nuevo
        </Button>
      </div>
      <DndProvider backend={HTML5Backend}>
        <Tree
          tree={treeData}
          rootId={0}
          onDrop={handleDrop}
          render={(node, { depth, isOpen, onToggle }) => (
            <div
              style={{ marginInlineStart: depth * 16 }}
              className="flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded bg-background"
            >
              <div className="flex items-center gap-2">
                {node.droppable && (
                  <span onClick={onToggle} className="cursor-pointer">
                    {isOpen ? "▾" : "▸"}
                  </span>
                )}
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: node.data?.color || "#ccc" }}
                ></span>
                <span>{node.text}</span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (node.data && 'id' in node.data && 'name' in node.data) {
                      handleEdit(node.data as Tag);
                    }
                  }}
                >
                  <PencilIcon className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (node.data && 'id' in node.data && 'name' in node.data) {
                      handleDelete(node.data as Tag);
                    }
                  }}
                >
                  <Trash2Icon className="w-4 h-4 text-destructive" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (node.data && 'id' in node.data && 'name' in node.data) {
                      handleCreate(node.data as Tag);
                    }
                  }}
                >
                  <PlusIcon className="w-4 h-4 text-green-600" />
                </Button>
              </div>
            </div>
          )}
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
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={handleSave}
            disabled={!tagDraft.name}
          >
            Guardar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
