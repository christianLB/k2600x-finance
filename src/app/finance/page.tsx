import IncomeTable from "@/components/incomes/IncomeTable";
import InvoiceTable from "@/components/invoices/InvoiceTable";
import YearlyReportTable from "@/components/operations/YearlyExpenseReportTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientTable from "@/components/clients/ClientTable";
import ExpensesNewTab from "@/components/expenses/ExpensesNewTab";
import OperationTagsManager from "@/components/operation-tags/OperationTagsManager";
import DocumentosTable from "@/components/documents/DocumentosTable";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function FinancePage() {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8 gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="var(--color-primary)" fillOpacity="0.10"/><path d="M7 17h10M7 13h10M7 9h10" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Finance Management
        </h1>
        <ThemeToggle />
      </div>
      <div>
        <Tabs defaultValue="expenses">
          <TabsList className="grid grid-cols-8">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
          <TabsContent value="expenses" className="pt-4">
            <ExpensesNewTab />
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
