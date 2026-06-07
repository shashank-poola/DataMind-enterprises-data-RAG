export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full" style={{ background: "#080706" }}>
      {children}
    </div>
  );
}
