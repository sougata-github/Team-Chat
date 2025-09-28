const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      {children}
    </div>
  );
};

export default AuthLayout;
