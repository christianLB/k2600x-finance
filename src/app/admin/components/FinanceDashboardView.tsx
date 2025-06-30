"use client";

import React from "react";
import { 
  Button,
  Card,
  CardHeader,
  CardContent,
  CardTitle
} from "@k2600x/design-system";

export function FinanceDashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}