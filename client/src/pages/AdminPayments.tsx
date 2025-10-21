import React from 'react';
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminPayments: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-8">Admin Payment Monitoring</h1>
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This section will display real-time payment data, reconciliation reports, and payment logs.</p>
            <p>Further development is needed to integrate with backend API endpoints.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPayments;
