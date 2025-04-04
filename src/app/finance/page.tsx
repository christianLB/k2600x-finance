import IncomeTable from "@/components/incomes/IncomeTable";
import InvoiceTable from "@/components/invoices/InvoiceTable";
import YearlyReportTable from "@/components/operations/YearlyExpenseReportTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientTable from "@/components/clients/ClientTable";
import OperationsTable from "@/components/operations/OperationTable";
import OperationTagsManager from "@/components/operation-tags/OperationTagsManager";
import DocumentosTable from "@/components/documents/DocumentosTable";

export default function FinancePage() {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-6">Finance Management</h2>
      <div className="border rounded-lg p-4 shadow-sm">
        <Tabs defaultValue="expenses">
          <TabsList className="grid grid-cols-7">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="yearly">Yearly Report</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="pt-4">
            <OperationsTable />
          </TabsContent>

          <TabsContent value="income" className="pt-4">
            <IncomeTable />
          </TabsContent>

          <TabsContent value="invoices" className="pt-4">
            <InvoiceTable />
          </TabsContent>

          <TabsContent value="clients" className="pt-4">
            <ClientTable />
          </TabsContent>

          <TabsContent value="yearly" className="pt-4">
            <YearlyReportTable year={2025} />
          </TabsContent>

          <TabsContent value="documents" className="pt-4">
            <DocumentosTable />
          </TabsContent>

          <TabsContent value="tags" className="pt-4">
            <OperationTagsManager appliesTo="operation" />
            <OperationTagsManager appliesTo="documento" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
