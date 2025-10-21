import React from 'react';
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminCreators: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-8">Admin Creator Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This section will allow viewing and managing creator profiles, fee tiers, and granting Elite Founding Status.</p>
            <p>Further development is needed to integrate with backend API endpoints.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminCreators;
