import CategoryForm from "@/components/forms/CategoryForm";

const CreateCategoryPage = async ({ searchParams }: RouteParams) => {
  const { c } = await searchParams;

  console.log(c);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Create a New Category</h1>
        <p className="text-muted-foreground">Add a new category to your shop</p>
      </header>

      <section>
        <CategoryForm parentId={c || null} />
      </section>
    </div>
  );
};

export default CreateCategoryPage;
