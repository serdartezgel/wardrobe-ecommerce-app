import { notFound } from "next/navigation";

import ProductForm from "@/components/forms/ProductForm";
import { getAllBrands } from "@/lib/actions/brand.action";
import { getAllCategories } from "@/lib/actions/category.action";
import { getProductForEdit } from "@/lib/actions/product.action";

const EditProductPage = async ({ params }: RouteParams) => {
  const { slug } = await params;
  const [product, categories, brands] = await Promise.all([
    getProductForEdit(slug),
    getAllCategories(true),
    getAllBrands(true),
  ]);

  if (!product.success) return notFound();

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
        <ProductForm
          initialData={product.data}
          isEditing
          categories={categories.data || []}
          brands={brands.data || []}
        />
      </section>
    </div>
  );
};

export default EditProductPage;
