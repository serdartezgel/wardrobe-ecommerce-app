import ProductForm from "@/components/forms/ProductForm";
import { getAllBrands } from "@/lib/actions/brand.action";
import { getAllCategories } from "@/lib/actions/category.action";

const CreateProductPage = async () => {
  const [categories, brands] = await Promise.all([
    getAllCategories(true),
    getAllBrands(true),
  ]);

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
        <ProductForm
          categories={categories.data || []}
          brands={brands.data || []}
        />
      </section>
    </div>
  );
};

export default CreateProductPage;
