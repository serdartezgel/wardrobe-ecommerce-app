import ProductForm from "@/components/forms/ProductForm";

const EditProductPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">
          Update product details, adjust pricing, manage images, and modify
          variants. Save changes as a draft or update the published version.
        </p>
      </header>

      <section>
        <ProductForm initialData={{}} isEditing />
      </section>
    </div>
  );
};

export default EditProductPage;
