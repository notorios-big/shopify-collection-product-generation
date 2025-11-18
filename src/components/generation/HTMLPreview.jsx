export const HTMLPreview = ({ html }) => {
  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white">
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
