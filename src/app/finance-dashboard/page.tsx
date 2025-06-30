"use client";

import React from "react";
import { 
  ThemeProvider, 
  AppLayout, 
  Button,
  Card,
  CardHeader,
  CardContent,
  CardTitle
} from "@k2600x/design-system";
import { useRouter } from "next/navigation";

export default function FinanceDashboardPage() {
  const router = useRouter();

  const navbarItems = [
    { label: "Finance Dashboard", href: "/finance-dashboard", active: true },
    { label: "Admin", href: "/admin" },
  ];

  const sidebar = (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold mb-3">Finance Dashboard</h3>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/finance-dashboard")}>
            Overview
          </Button>
          <Button variant="ghost" className="w-full justify-start" disabled>
            Reports (Coming Soon)
          </Button>
          <Button variant="ghost" className="w-full justify-start" disabled>
            Analytics (Coming Soon)
          </Button>
        </div>
      </div>
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin")}>
            Go to Admin
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <ThemeProvider>
      <AppLayout 
        title="Finance Dashboard"
        sidebar={sidebar}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Finance Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your financial management hub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Financial metrics and KPIs will be displayed here.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Latest transactions and updates will appear here.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate and view financial reports.
                </p>
                <Button variant="outline" className="mt-4" disabled>
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  The Finance Dashboard is currently under development. Here's what's coming:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Real-time financial metrics and KPIs</li>
                  <li>Interactive charts and graphs</li>
                  <li>Automated report generation</li>
                  <li>Budget tracking and forecasting</li>
                  <li>Integration with accounting systems</li>
                </ul>
                <div className="pt-4">
                  <Button onClick={() => router.push("/admin")}>
                    Manage Data in Admin
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ThemeProvider>
  );
}