import IncomeTable from "@/components/tables/IncomeTable";
import InvoiceTable from "@/components/invoices/InvoiceTable";
import YearlyReportTable from "@/components/tables/YearlyExpenseReportTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientTable from "@/components/clients/ClientTable";
import OperationsTable from "@/components/operations/OperationTable";

export default function FinancePage() {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-6">Finance Management</h2>
      <div className="border rounded-lg p-4 shadow-sm">
        <Tabs defaultValue="expenses">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="yearly">Yearly Report</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
}
