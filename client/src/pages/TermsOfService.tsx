import React from 'react';
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">THOTSLY Terms of Service</h1>
          <MarkdownRenderer filePath="/THOTSLY_TERMS_OF_SERVICE_GLOBAL.md" />
        </Card>
      </main>
    </div>
  );
};

export default TermsOfService;

