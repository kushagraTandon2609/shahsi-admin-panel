'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PackageOpen, RefreshCw } from 'lucide-react';
import { ProductEditorForm } from '@/components/admin/catalog/ProductEditorForm';
import { adminCatalogService } from '@/services/admin-catalog.service';
import {
  getApiErrorMessage,
  unwrapList,
  unwrapObject,
} from '@/lib/admin-response';
import { ApiError } from '@/components/admin/ApiError';
import { Card } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';

function extractList(response: any) {
  const list = unwrapList(response);
  const objectData = unwrapObject(response);

  if (list.length > 0) return list;

  const possibleList =
    objectData?.items ||
    objectData?.media ||
    objectData?.images ||
    objectData?.videos ||
    objectData?.variants ||
    objectData?.data ||
    [];

  return Array.isArray(possibleList) ? possibleList : [];
}

function extractProduct(response: any) {
  const objectData = unwrapObject(response);

  return (
    objectData?.product ||
    objectData?.item ||
    objectData?.catalog ||
    objectData?.data ||
    objectData
  );
}

export default function AdminCatalogEditPage() {
  const params = useParams();
  const id = String(params?.id || '');

  const [product, setProduct] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const loadProduct = useCallback(async () => {
    if (!id || id === 'undefined' || id === 'null') {
      setError('Product ID is missing.');
      setLoading(false);
      return;
    }

    setError('');
    setWarning('');

    try {
      const [detailRes, mediaRes, variantsRes] = await Promise.allSettled([
        adminCatalogService.detail(id),
        adminCatalogService.media(id),
        adminCatalogService.getVariants(id),
      ]);

      if (detailRes.status === 'fulfilled') {
        const nextProduct = extractProduct(detailRes.value);

        if (!nextProduct) {
          setProduct(null);
          setError('Product detail response is empty.');
          return;
        }

        setProduct(nextProduct);
      } else {
        setProduct(null);
        setError(getApiErrorMessage(detailRes.reason));
        return;
      }

      if (mediaRes.status === 'fulfilled') {
        setMedia(extractList(mediaRes.value));
      } else {
        setMedia([]);
        setWarning((prev) =>
          prev
            ? `${prev} Media could not be loaded.`
            : 'Media could not be loaded.',
        );
      }

      if (variantsRes.status === 'fulfilled') {
        setVariants(extractList(variantsRes.value));
      } else {
        setVariants([]);
        setWarning((prev) =>
          prev
            ? `${prev} Variants could not be loaded.`
            : 'Variants could not be loaded.',
        );
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err));
      setProduct(null);
      setMedia([]);
      setVariants([]);
    }
  }, [id]);

  async function reloadProduct() {
    setRefreshing(true);

    try {
      await loadProduct();
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true);

      try {
        await loadProduct();
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [loadProduct]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
          </div>

          <div className="space-y-5">
            <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-52 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ApiError message={error} />

        <Button type="button" variant="secondary" onClick={reloadProduct}>
          <span className="flex items-center gap-2">
            <RefreshCw size={16} />
            Try again
          </span>
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <PackageOpen size={28} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-gray-950">
            Product not found
          </h2>

          <p className="mt-1 max-w-md text-sm leading-6 text-gray-500">
            This product could not be loaded from the backend. Please check the
            product ID or try refreshing the catalog.
          </p>

          <div className="mt-5">
            <Button type="button" variant="secondary" onClick={reloadProduct}>
              <span className="flex items-center gap-2">
                <RefreshCw size={16} />
                Refresh product
              </span>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {warning && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          {warning}
        </div>
      )}

      {refreshing && (
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-500">
          Refreshing latest product data...
        </div>
      )}

      <ProductEditorForm
        mode="edit"
        productId={id}
        initialProduct={product}
        initialMedia={media}
        initialVariants={variants}
        onReload={reloadProduct}
      />
    </div>
  );
}