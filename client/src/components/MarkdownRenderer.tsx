import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  filePath: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ filePath }) => {
  const [markdown, setMarkdown] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load markdown: ${response.statusText}`);
        }
        return response.text();
      })
      .then(text => setMarkdown(text))
      .catch(err => {
        console.error("Error loading markdown file:", err);
        setError(`Could not load content from ${filePath}. Please check the path and file.`);
      });
  }, [filePath]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;

