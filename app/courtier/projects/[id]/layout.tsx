export default function CourtierProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1">
      <div className="flex-1 space-y-4">
        {children}
      </div>
    </div>
  );
}