import { notFound } from "next/navigation";

import BrandForm from "@/components/forms/BrandForm";
import { getBrandBySlug } from "@/lib/actions/brand.action";
import { BrandInput } from "@/lib/validations/brand.validation";

const BrandEditPage = async ({ params }: RouteParams) => {
  const { slug } = await params;

  const result = await getBrandBySlug(slug);

  if (!result.success) return notFound();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Update Brand</h1>
      </header>

      <section>
        <BrandForm initialData={result.data as BrandInput} isEditing />
      </section>
    </div>
  );
};

export default BrandEditPage;
