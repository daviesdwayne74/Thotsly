import React from 'react';
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-8">Admin Dashboard (God Mode)</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/payments">
            <Card className="cursor-pointer hover:bg-muted transition-colors">
              <CardHeader>
                <CardTitle>Payment Monitoring & Reconciliation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>View all transactions, generate reconciliation reports, and track payment logs.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/payouts">
            <Card className="cursor-pointer hover:bg-muted transition-colors">
              <CardHeader>
                <CardTitle>Payout Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Manage creator payouts, view payout history, trigger batch payouts, and monitor failover queue.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/creators">
            <Card className="cursor-pointer hover:bg-muted transition-colors">
              <CardHeader>
                <CardTitle>Creator Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>View and manage creator profiles, fee tiers, and grant Elite Founding Status.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="cursor-pointer hover:bg-muted transition-colors">
              <CardHeader>
                <CardTitle>Platform Settings & Legal</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Configure global platform settings, manage legal documents, and content policies.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
