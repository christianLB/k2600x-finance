import YearlyReportTable from "@/components/operations/YearlyExpenseReportTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OperationTagsManager from "@/components/operation-tags/OperationTagsManager";
import { ThemeToggle } from "@k2600x/design-system";

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
        <Tabs defaultValue="yearly">
          <TabsList className="grid grid-cols-8">
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
          <TabsContent value="yearly" className="pt-4">
            <YearlyReportTable year={2025} />
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
