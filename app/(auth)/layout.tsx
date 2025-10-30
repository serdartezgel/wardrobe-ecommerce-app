const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-screen">
      <div className="relative hidden w-1/2 bg-[url(/images/auth-image.jpg)] bg-cover bg-center md:flex">
        <div className="bg-background/20 absolute inset-0" />

        <div className="text-primary relative z-10 mt-16 flex w-full flex-col items-center justify-center gap-4 px-12 text-center">
          <h1 className="font-serif text-5xl font-extrabold tracking-tight">
            WARDROBE
          </h1>
          <p className="text-foreground max-w-sm text-lg leading-relaxed">
            Redefine your style with timeless essentials and modern fits — built
            for every moment.
          </p>
          <p className="text-accent text-sm font-medium tracking-wide uppercase">
            Discover your look today
          </p>
        </div>
      </div>

      <div className="bg-background flex w-full items-center justify-center md:w-1/2">
        {children}
      </div>
    </main>
  );
};

export default AuthLayout;
