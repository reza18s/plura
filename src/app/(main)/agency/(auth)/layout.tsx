export default function layout({ children }: { children: React.ReactNode }) {
  const x = "good";
  console.log("fjjf");
  return (
    <div className="flex min-h-screen items-center justify-center">
      {children}
    </div>
  );
}
