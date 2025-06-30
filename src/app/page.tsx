'use client';

import { useRouter } from "next/navigation";
import { 
  Button, 
  ThemeProvider, 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from "@k2600x/design-system";

export default function Home() {
  const router = useRouter();
  
  return (
    <ThemeProvider>
      <div className="flex flex-col items-center justify-center min-h-screen py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-xl w-full shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">K2600X Finance</CardTitle>
            <p className="text-lg text-muted-foreground">
              A modern, secure, and flexible platform for managing your financial data.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4">
              <Button 
                size="lg" 
                className="w-full" 
                onClick={() => router.push('/finance-dashboard')}
              >
                Go to Finance Dashboard
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full" 
                onClick={() => router.push('/admin')}
              >
                Access Admin Panel
              </Button>
            </div>
            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground">
                Powered by <span className="font-semibold">k2600x</span>, Next.js & Strapi
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
}
