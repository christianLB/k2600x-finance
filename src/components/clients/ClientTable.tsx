"use client";

import { StrapiTable, ColumnDefinition } from "@/components/tables/StrapiTable";
import ClientModal from "./ClientModal";
import { useState } from "react";

export interface Client {
  documentId: string;
  id: number;
  name: string;
}

export default function ClientTable() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (client?: Client) => {
    setSelectedClient(client || null);
    setModalOpen(true);
  };

  // Define columns for the table
  const columns: ColumnDefinition<Client>[] = [
    {
      header: "Nombre",
      cell: (client) => client.name,
    },
  ];

  return (
    <div>
      <StrapiTable<Client>
        collection="clients"
        title="Listado de Clientes"
        columns={columns}
        onEdit={(client) => handleOpenModal(client)}
        createButtonText="Crear Cliente"
        selectable
      />
      <ClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        client={selectedClient}
      />
    </div>
  );
}