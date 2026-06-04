'use client';

import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { ProductEditorForm } from '@/components/admin/catalog/ProductEditorForm';

export default function CreateProductPage() {
  const router = useRouter();

  function handleProductCreated(product: any) {
    const productId =
      product?.id ||
      product?._id ||
      product?.productId ||
      product?.data?.id ||
      product?.data?._id ||
      product?.data?.productId;

    if (productId) {
      router.push(`/admin/catalog/${productId}`);
      return;
    }

    router.push('/admin/catalog');
  }

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
            <PlusCircle size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">
              Add product
            </h1>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Create a new catalog item first. After creation, you will be moved
              to the edit page where you can add media, variants, SEO,
              collections, pricing, availability and commerce settings.
            </p>
          </div>
        </div>
      </div>

      <ProductEditorForm
        mode="create"
        onCreated={handleProductCreated}
      />
    </div>
  );
}