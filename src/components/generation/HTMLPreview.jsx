export const HTMLPreview = ({ html }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <style>{`
        .html-preview h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1rem;
          margin-top: 0;
          line-height: 1.2;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        .html-preview h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          border-left: 4px solid #6366f1;
          padding-left: 0.75rem;
        }
        .html-preview h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .html-preview h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #4b5563;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .html-preview p {
          font-size: 1rem;
          color: #4b5563;
          margin-bottom: 1rem;
          line-height: 1.7;
        }
        .html-preview ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
          color: #4b5563;
        }
        .html-preview ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
          color: #4b5563;
        }
        .html-preview li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        .html-preview li::marker {
          color: #6366f1;
        }
        .html-preview strong, .html-preview b {
          font-weight: 600;
          color: #1f2937;
        }
        .html-preview em, .html-preview i {
          font-style: italic;
        }
        .html-preview a {
          color: #6366f1;
          text-decoration: underline;
        }
        .html-preview a:hover {
          color: #4f46e5;
        }
        .html-preview blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
          font-style: italic;
          background-color: #f9fafb;
          padding: 1rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .html-preview hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        .html-preview table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .html-preview th, .html-preview td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
          text-align: left;
        }
        .html-preview th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        .html-preview img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .html-preview code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: ui-monospace, monospace;
          color: #dc2626;
        }
        .html-preview pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .html-preview pre code {
          background: none;
          color: inherit;
          padding: 0;
        }
      `}</style>
      <div
        className="html-preview"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
