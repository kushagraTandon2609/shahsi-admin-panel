'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Copy,
  Edit3,
  Eye,
  Filter,
  MoreVertical,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { ApiError } from '@/components/admin/ApiError';
import { adminCatalogService } from '@/services/admin-catalog.service';
import {
  getApiErrorMessage,
  normalizeProduct,
  unwrapList,
  unwrapObject,
  formatCategoryName,
} from '@/lib/admin-response';

type ProductRow = {
  id: string;
  title: string;
  sku?: string;
  status?: string;
  image?: string;
  price?: number | string;
  category?: string;
  brand?: string;
  vendor?: string;
  stock?: number | string;
  raw?: any;
};

type BulkEditForm = {
  status: string;
  category: string;
  brand: string;
  commerceTypes: string[];
  reason: string;
  adminId: string;
};

function getProductId(product: any) {
  return String(product?.id || product?._id || product?.productId || '');
}

function getProductTitle(product: any) {
  return (
    product?.title ||
    product?.name ||
    product?.productTitle ||
    product?.raw?.title ||
    'Untitled product'
  );
}

function getProductImage(product: any) {
  const images = Array.isArray(product?.images)
    ? product.images
    : Array.isArray(product?.productImages)
      ? product.productImages
      : Array.isArray(product?.media)
        ? product.media
        : [];

  const primaryImage =
    images.find((item: any) => item?.isPrimary || item?.is_primary) ||
    images[0];

  const image =
    product?.imageUrl ||
    product?.image ||
    product?.thumbnail ||
    product?.thumbnailUrl ||
    product?.primaryImage ||
    product?.primaryImageUrl ||
    primaryImage?.secureUrl ||
    primaryImage?.secure_url ||
    primaryImage?.url ||
    primaryImage?.imageUrl ||
    product?.raw?.imageUrl ||
    product?.raw?.image ||
    product?.raw?.thumbnail ||
    product?.raw?.images?.find?.((item: any) => item?.isPrimary)?.secureUrl ||
    product?.raw?.images?.find?.((item: any) => item?.isPrimary)?.url ||
    product?.raw?.images?.[0]?.secureUrl ||
    product?.raw?.images?.[0]?.url ||
    '';

  if (typeof image === 'string') return image;

  return image?.secureUrl || image?.secure_url || image?.url || image?.imageUrl || '';
}

function getProductStatus(product: any) {
  return String(product?.status || product?.raw?.status || 'DRAFT').toUpperCase();
}

function getProductSku(product: any) {
  return product?.sku || product?.raw?.sku || '-';
}

function getProductPrice(product: any) {
  return (
    product?.price ||
    product?.basePrice ||
    product?.raw?.price ||
    product?.raw?.basePrice ||
    ''
  );
}

function getProductStock(product: any) {
  return (
    product?.stock ||
    product?.inventory ||
    product?.raw?.stock ||
    product?.raw?.inventory ||
    '-'
  );
}

function getProductCategory(product: any) {
  return (
    product?.category ||
    product?.primaryCollection ||
    product?.raw?.category ||
    product?.raw?.primaryCollection ||
    '-'
  );
}

function getProductBrand(product: any) {
  return product?.brand || product?.raw?.brand || '-';
}

function statusPillClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes('active') || normalized.includes('published')) {
    return 'bg-green-50 text-green-700 border-green-200';
  }

  if (normalized.includes('draft')) {
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  }

  if (normalized.includes('archived') || normalized.includes('inactive')) {
    return 'bg-gray-100 text-gray-700 border-gray-200';
  }

  return 'bg-blue-50 text-blue-700 border-blue-200';
}

export default function AdminCatalogPage() {
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeSource, setActiveSource] = useState<'all' | 'low-stock' | 'out-of-stock'>('all');

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [bulkForm, setBulkForm] = useState<BulkEditForm>({
    status: '',
    category: '',
    brand: '',
    commerceTypes: [],
    reason: 'Bulk update from admin catalog',
    adminId: 'admin-user-id',
  });

  const products: ProductRow[] = useMemo(() => {
    return rawProducts.map((item) => {
      const normalized = normalizeProduct(item);

      return {
        ...normalized,
        id: getProductId(normalized) || getProductId(item),
        title: getProductTitle(normalized) || getProductTitle(item),
        sku: getProductSku(normalized) || getProductSku(item),
        status: getProductStatus(normalized) || getProductStatus(item),
        image: getProductImage(normalized) || getProductImage(item),
        price: getProductPrice(normalized) || getProductPrice(item),
        category: getProductCategory(normalized) || getProductCategory(item),
        brand: getProductBrand(normalized) || getProductBrand(item),
        stock: getProductStock(normalized) || getProductStock(item),
        raw: item,
      };
    });
  }, [rawProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = `${product.title} ${product.sku} ${product.status} ${product.category} ${product.brand}`.toLowerCase();

      const matchSearch = searchText.includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ||
        String(product.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [products, search, statusFilter]);

  const filteredIds = useMemo(() => {
    return filteredProducts.map((item) => item.id).filter(Boolean);
  }, [filteredProducts]);

  const allFilteredSelected =
    filteredIds.length > 0 &&
    filteredIds.every((id) => selectedIds.includes(id));

  const statusCounts = useMemo(() => {
    return products.reduce(
      (acc, product) => {
        const status = String(product.status || '').toLowerCase();

        acc.all += 1;

        if (status.includes('active') || status.includes('published')) {
          acc.active += 1;
        } else if (status.includes('draft')) {
          acc.draft += 1;
        } else if (status.includes('archived') || status.includes('inactive')) {
          acc.archived += 1;
        }

        return acc;
      },
      {
        all: 0,
        active: 0,
        draft: 0,
        archived: 0,
      },
    );
  }, [products]);

  async function extractProducts(res: any) {
    const list = unwrapList(res);
    const objectData = unwrapObject(res);

    const items =
      list.length > 0
        ? list
        : objectData?.items ||
          objectData?.products ||
          objectData?.catalog ||
          objectData?.data ||
          [];

    return Array.isArray(items) ? items : [];
  }

  async function loadProducts() {
  setLoading(true);
  setError('');

  try {
    const res = await adminCatalogService.list({
  page: 1,
  limit: 100,
});

    const list =
      unwrapList(res).length > 0
        ? unwrapList(res)
        : unwrapObject(res)?.items ||
          unwrapObject(res)?.products ||
          unwrapObject(res)?.data ||
          [];

    setRawProducts(Array.isArray(list) ? list : []);
  } catch (err: any) {
    setError(getApiErrorMessage(err));
    setRawProducts([]);
  } finally {
    setLoading(false);
  }
}
  useEffect(() => {
    loadProducts();
  }, []);

  function toggleSelect(id: string) {
    if (!id) return;

    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id],
    );
  }

  function toggleAll() {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  }

  function resetBulkForm() {
    setBulkForm({
      status: '',
      category: '',
      brand: '',
      commerceTypes: [],
      reason: 'Bulk update from admin catalog',
      adminId: 'admin-user-id',
    });
  }

  function closeBulkEdit() {
    setBulkEditOpen(false);
    resetBulkForm();
  }

  function toggleCommerceType(type: string) {
    setBulkForm((prev) => {
      const exists = prev.commerceTypes.includes(type);

      return {
        ...prev,
        commerceTypes: exists
          ? prev.commerceTypes.filter((item) => item !== type)
          : [...prev.commerceTypes, type],
      };
    });
  }

  async function handleBulkPublish() {
  if (selectedIds.length === 0) return;

  setBulkSaving(true);
  setError('');

  try {
    await adminCatalogService.bulkPublish({
      ids: selectedIds,
    });

    setSelectedIds([]);
    await loadProducts();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setBulkSaving(false);
  }
}

  async function handleBulkUnpublish() {
  if (selectedIds.length === 0) return;

  setBulkSaving(true);
  setError('');

  try {
    await adminCatalogService.bulkUnpublish({
      ids: selectedIds,
    });

    setSelectedIds([]);
    await loadProducts();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setBulkSaving(false);
  }
}

 async function handleBulkDelete() {
  if (selectedIds.length === 0) return;
  if (!confirm(`Delete ${selectedIds.length} selected products?`)) return;

  setBulkSaving(true);
  setError('');

  try {
    await adminCatalogService.bulkDelete(selectedIds);

    setSelectedIds([]);
    await loadProducts();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setBulkSaving(false);
  }
}

  async function applyBulkEdit() {
    if (selectedIds.length === 0) return;

    const data: Record<string, any> = {};

    if (bulkForm.status) {
      data.status = bulkForm.status;
    }

    if (bulkForm.category.trim()) {
      data.category = bulkForm.category.trim();
    }

    if (bulkForm.brand.trim()) {
      data.brand = bulkForm.brand.trim();
    }

    if (bulkForm.commerceTypes.length > 0) {
      data.commerceTypes = bulkForm.commerceTypes;
    }

    if (Object.keys(data).length === 0) {
      setError('Bulk edit ke liye at least one field select karo.');
      return;
    }

    setBulkSaving(true);
    setError('');
    setSuccess('');

    try {
      await adminCatalogService.bulkUpdate({
        ids: selectedIds,
        data,
        reason: bulkForm.reason || 'Bulk update from admin catalog',
        adminId: bulkForm.adminId || 'admin-user-id',
      });

      setSuccess('Bulk edit applied successfully.');
      closeBulkEdit();
      await loadProducts();
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setBulkSaving(false);
    }
  }

  async function duplicateProduct(productId: string) {
    if (!productId) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminCatalogService.duplicate(productId);
      setSuccess('Product duplicated successfully.');
      setOpenMenuId('');
      await loadProducts();
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function updateProductStatus(productId: string, status: string) {
    if (!productId) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminCatalogService.updateStatus(productId, {
        status,
        publishedAt: status === 'ACTIVE' ? new Date().toISOString() : undefined,
      });

      setSuccess('Product status updated successfully.');
      setOpenMenuId('');
      await loadProducts();
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function publishProduct(productId: string) {
    if (!productId) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminCatalogService.publish(productId, {
        publishedAt: new Date().toISOString(),
      });

      setSuccess('Product published successfully.');
      setOpenMenuId('');
      await loadProducts();
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function unpublishProduct(productId: string) {
    if (!productId) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminCatalogService.unpublish(productId);

      setSuccess('Product unpublished successfully.');
      setOpenMenuId('');
      await loadProducts();
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Admin / Catalog</p>

          <h1 className="mt-2 text-3xl font-bold text-gray-950">
            Products
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage products, status, publishing, inventory and bulk updates.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => loadProducts()}
            disabled={loading || actionLoading}
          >
            <span className="flex items-center gap-2">
              <RefreshCw size={16} />
              Refresh
            </span>
          </Button>

          <Link href="/admin/catalog/create">
            <Button type="button">
              <span className="flex items-center gap-2">
                <Plus size={16} />
                Add product
              </span>
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <ApiError message={error} />
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
        <button
          type="button"
          onClick={() => {
            setStatusFilter('all');
            loadProducts();
          }}
          className={`rounded-2xl border p-4 text-left shadow-sm ${
            activeSource === 'all'
              ? 'border-black bg-white'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Package size={20} />
            <span className="text-sm font-semibold text-gray-600">All</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-950">
            {statusCounts.all}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('ACTIVE')}
          className={`rounded-2xl border p-4 text-left shadow-sm ${
            statusFilter === 'ACTIVE'
              ? 'border-green-400 bg-green-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <span className="text-sm font-semibold text-gray-600">Active</span>
          <p className="mt-3 text-2xl font-bold text-gray-950">
            {statusCounts.active}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('DRAFT')}
          className={`rounded-2xl border p-4 text-left shadow-sm ${
            statusFilter === 'DRAFT'
              ? 'border-yellow-400 bg-yellow-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <span className="text-sm font-semibold text-gray-600">Draft</span>
          <p className="mt-3 text-2xl font-bold text-gray-950">
            {statusCounts.draft}
          </p>
        </button>

        <button
          type="button"
          onClick={() => loadProducts()}
          className={`rounded-2xl border p-4 text-left shadow-sm ${
            activeSource === 'low-stock'
              ? 'border-orange-400 bg-orange-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <span className="text-sm font-semibold text-gray-600">
            Low stock
          </span>
          <p className="mt-3 text-sm font-medium text-gray-500">
            Load low stock products
          </p>
        </button>
      </div>

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title, SKU, category, brand or status"
              className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-black"
            >
              <option value="all">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="UNLISTED">Unlisted</option>
              
            </select>

            <Button
              type="button"
              variant="secondary"
              onClick={() => loadProducts()}
            >
              <span className="flex items-center gap-2">
                <Filter size={15} />
                Out of stock
              </span>
            </Button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-700">
              {selectedIds.length} product(s) selected
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setBulkEditOpen(true)}
                disabled={actionLoading || bulkSaving}
              >
                Bulk edit
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleBulkPublish}
                disabled={actionLoading || bulkSaving}
              >
                Publish
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleBulkUnpublish}
                disabled={actionLoading || bulkSaving}
              >
                Unpublish
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleBulkDelete}
                disabled={actionLoading || bulkSaving}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-950">
            Product list ({filteredProducts.length})
          </h2>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              No products found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <th className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-4 py-3">Product Type</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const productId = product.id;
                  const checked = selectedIds.includes(productId);
                  const status = getProductStatus(product);
                  const image = getProductImage(product);

                  return (
                    <tr key={productId} className="border-b last:border-b-0">
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelect(productId)}
                        />
                      </td>

                      <td className="w-[38%] px-5 py-4 align-top">
  <div className="flex items-start gap-3">
    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
      {getProductImage(product) ? (
        <img
          src={getProductImage(product)}
          alt={getProductTitle(product)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-400">
          {getProductTitle(product).charAt(0).toUpperCase()}
        </div>
      )}
    </div>

    <div className="min-w-0 flex-1">
      <p className="max-w-[420px] whitespace-normal break-words text-sm font-semibold leading-5 text-gray-950">
        {getProductTitle(product)}
      </p>

      <p className="mt-0.5 break-all text-xs text-gray-500">
        ID: {(product as any)?.id || (product as any)?._id || (product as any)?.productId || '-'}
      </p>
    </div>
  </div>
</td>

                      <td className="w-[100px] px-3 py-4 align-top text-sm text-gray-700">
  <span
    title={getProductSku(product) || '-'}
    className="block max-w-[100px] truncate whitespace-nowrap"
  >
    {getProductSku(product) || '-'}
  </span>
</td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatCategoryName(
  product.raw?.category ||
    product.raw?.primaryCategory ||
    product.raw?.primaryCollection ||
    product.raw?.collection ||
    '',
) || '-'}
                      </td>

                     <td className="px-4 py-3">
  {product.vendor || product.raw?.vendor || product.raw?.brand || '-'}
</td>
<td className="px-4 py-3">
  {(product as any)?.productType ||
  (product as any)?.raw?.productType ||
  (product as any)?.raw?.product_type ||
  (product as any)?.raw?.productKind ||
  '-'}
</td>
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {product.price ? `$${product.price}` : '-'}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {product.stock}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusPillClass(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="relative flex justify-end gap-3">
                          <Link
                            href={`/admin/catalog/${productId}`}
                            className="text-gray-600 hover:text-black"
                            title="Edit product"
                          >
                            <Edit3 size={17} />
                          </Link>

                          <Link
                            href={`/product/${product.raw?.slug || productId}`}
                            className="text-gray-600 hover:text-black"
                            title="View product"
                          >
                            <Eye size={17} />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(openMenuId === productId ? '' : productId)
                            }
                            className="text-gray-600 hover:text-black"
                            title="More actions"
                          >
                            <MoreVertical size={17} />
                          </button>

                          {openMenuId === productId && (
                            <div className="absolute right-0 top-7 z-20 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                              <button
                                type="button"
                                onClick={() => duplicateProduct(productId)}
                                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Copy size={15} />
                                Duplicate
                              </button>

                              <button
                                type="button"
                                onClick={() => publishProduct(productId)}disabled={bulkSaving}
                                className="block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Publish
                              </button>

                              <button
                                type="button"
                                onClick={() => unpublishProduct(productId)}disabled={bulkSaving}
                                className="block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Unpublish
                              </button>

                              <button
                                type="button"
                                onClick={() => updateProductStatus(productId, 'ARCHIVED')}
                                className="block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Archive
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
  const confirmed = window.confirm('Delete this product?');
  if (!confirmed) return;

  setActionLoading(true);
  setError('');
  setSuccess('');

  try {
    await adminCatalogService.bulkDelete([productId]);
    setSuccess('Product deleted successfully.');
    setOpenMenuId('');
    await loadProducts();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setActionLoading(false);
  }
}}
                                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {bulkEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-950">
                  Bulk edit products
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Apply changes to {selectedIds.length} selected product(s).
                </p>
              </div>

              <button
                type="button"
                onClick={closeBulkEdit}
                className="rounded-lg px-3 py-1.5 text-xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </span>

                <select
                  value={bulkForm.status}
                  onChange={(e) =>
                    setBulkForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-black"
                >
                  <option value="">No change</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </span>

                <input
                  value={bulkForm.category}
                  onChange={(e) =>
                    setBulkForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-black"
                  placeholder="Category slug/name"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Brand
                </span>

                <input
                  value={bulkForm.brand}
                  onChange={(e) =>
                    setBulkForm((prev) => ({
                      ...prev,
                      brand: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-black"
                  placeholder="Brand"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Admin ID
                </span>

                <input
                  value={bulkForm.adminId}
                  onChange={(e) =>
                    setBulkForm((prev) => ({
                      ...prev,
                      adminId: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-black"
                />
              </label>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Commerce types
              </p>

              <div className="flex flex-wrap gap-2">
                {['retail', 'rental', 'resale', 'made_to_order', 'subscription'].map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleCommerceType(type)}
                      className={`rounded-full border px-3 py-1.5 text-sm ${
                        bulkForm.commerceTypes.includes(type)
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      {type}
                    </button>
                  ),
                )}
              </div>
            </div>

            <label className="mt-5 block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Reason
              </span>

              <textarea
                value={bulkForm.reason}
                onChange={(e) =>
                  setBulkForm((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                className="min-h-24 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
              />
            </label>

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={closeBulkEdit}>
                Cancel
              </Button>

              <Button
                type="button"
                onClick={applyBulkEdit}
                disabled={bulkSaving}
              >
                {bulkSaving ? 'Applying...' : 'Apply bulk edit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}