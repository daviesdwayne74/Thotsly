import React from 'react';
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">THOTSLY Privacy Policy</h1>
          <MarkdownRenderer filePath="/THOTSLY_PRIVACY_POLICY.md" />
        </Card>
      </main>
    </div>
  );
};

export default PrivacyPolicy;

