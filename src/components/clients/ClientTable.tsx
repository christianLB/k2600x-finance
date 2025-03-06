"use client";

import { StrapiTable, ColumnDefinition } from "@/components/tables/StrapiTable";
import { useState } from "react";
import ClientModal from "./ClientModal";

export interface Client {
  documentId: string;
  id: number;
  name: string;
}

export default function ClientTable() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (Client?: Client) => {
    setSelectedClient(Client || null);
    setModalOpen(true);
  };

  // Definición de columnas.
  const columns: ColumnDefinition<Client>[] = [
    {
      header: "Cliente",
      cell: (client) => client.name || "Sin cliente",
    },
  ];

  return (
    <div>
      <StrapiTable<Client>
        collection="Clients"
        title="Listado de Clients"
        columns={columns}
        onEdit={() => handleOpenModal()}
        onCreate={() => handleOpenModal()}
        createButtonText="Crear Client"
        selectable
      />
      <ClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        client={selectedClient || undefined}
      />
    </div>
  );
}
