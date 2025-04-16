"use client";

import { ColumnDefinition, FullStrapiTable } from "@/components/tables/FullStrapiTable";
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
      sortable: true,
      sortKey: "name",
    },
  ];

  return (
    <div>
      <FullStrapiTable<Client>
        collection="clients"
        title="Listado de Clientes"
        columns={columns}
        onEdit={handleOpenModal}
        onCreate={() => handleOpenModal(undefined)}
        createButtonText="Crear Cliente"
        allowCreate={true}
        selectable
      />
      <ClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        client={selectedClient as Client || null}
      />
    </div>
  );
}