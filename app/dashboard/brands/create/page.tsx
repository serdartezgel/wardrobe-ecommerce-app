import BrandForm from "@/components/forms/BrandForm";

const CreateBrandPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Create a New Brand</h1>
        <p className="text-muted-foreground">Add a new brand to your shop</p>
      </header>

      <section>
        <BrandForm />
      </section>
    </div>
  );
};

export default CreateBrandPage;
