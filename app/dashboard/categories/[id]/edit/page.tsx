import { notFound } from "next/navigation";

import CategoryForm from "@/components/forms/CategoryForm";
import { getCategory } from "@/lib/actions/category.action";
import { CategoryInput } from "@/lib/validations/category.validation";

const CategoryEditPage = async ({ params }: RouteParams) => {
  const { id } = await params;

  const result = await getCategory(id);

  if (!result.success) return notFound();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Update Category</h1>
      </header>

      <section>
        <CategoryForm
          initialData={result.data as CategoryInput}
          parentId={result.data?.parentId || null}
          isEditing
        />
      </section>
    </div>
  );
};

export default CategoryEditPage;
