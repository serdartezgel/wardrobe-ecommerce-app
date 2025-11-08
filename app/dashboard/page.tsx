const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="">Stat Cards</div>

      <div className="">Charts</div>

      <div className="">Recent Activity Feed</div>
    </div>
  );
};

export default DashboardPage;
