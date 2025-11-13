import ProductForm from "@/components/forms/ProductForm";

const CreateProductPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Create a New Product</h1>
        <p className="text-muted-foreground">
          Add a new product to your catalog. Enter all required details, upload
          images, and save as draft or publish immediately.
        </p>
      </header>

      <section>
        <ProductForm />
      </section>
    </div>
  );
};

export default CreateProductPage;
