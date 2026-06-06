'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit3, MoreVertical, PlusCircle, Search } from 'lucide-react';

import { ApiError } from '@/components/admin/ApiError';
import { Button } from '@/components/admin/Button';
import { Card } from '@/components/admin/Card';
import { Input } from '@/components/admin/Input';
import { getApiErrorMessage, unwrapObject } from '@/lib/admin-response';
import { adminCategoriesService } from '@/services/admin-categories.service';
import { adminCategoryTreeService } from '@/services/admin-category-tree.service';

function makeSlug(value: string) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function getCategoryId(category: any, index?: number) {
  return String(
    category?.id ||
      category?._id ||
      category?.categoryId ||
      category?.slug ||
      category?.name ||
      index ||
      '',
  );
}

function getCategoryName(category: any) {
  return category?.name || category?.title || category?.label || 'Category';
}

function getCategorySlug(category: any) {
  return String(category?.slug || category?.handle || category?.name || '')
    .toLowerCase()
    .trim();
}

function getCategoryDeleteSlug(category: any) {
  return String(
    category?.deleteSlug ||
      category?.slug ||
      category?.seoSlug ||
      category?.handle ||
      category?.value ||
      '',
  ).trim();
}

function getCategoryDescription(category: any) {
  return category?.description || category?.shortDescription || '-';
}

function getParentSlug(category: any) {
  return String(
    category?.parentSlug ||
      category?.parent?.slug ||
      category?.parentId ||
      category?.parent?.id ||
      '',
  ).trim();
}

function getCategoryChildren(category: any) {
  const children =
    category?.children ||
    category?.subcategories ||
    category?.items ||
    category?.nodes ||
    [];

  return Array.isArray(children) ? children : [];
}

function getProductIdFromCategoryProduct(item: any) {
  return String(
    item?.id ||
      item?._id ||
      item?.productId ||
      item?.catalogProductId ||
      item?.product?.id ||
      item?.product?._id ||
      item?.catalogProduct?.id ||
      item?.catalogProduct?._id ||
      item?.sku ||
      item?.title ||
      '',
  );
}

function getCategoryProductCount(category: any): number {
  const directCount = Number(
    category?.directProductCount ??
      category?.assignedProductsCount ??
      category?.productsCount ??
      category?.totalProducts ??
      0,
  );

  if (!Number.isFinite(directCount)) return 0;

  return directCount;
}



function getCategoryImage(category: any) {
  const image =
    category?.imageUrl ||
    category?.categoryImageUrl ||
    category?.secureUrl ||
    category?.secure_url ||
    category?.image?.secureUrl ||
    category?.image?.secure_url ||
    category?.image?.url ||
    category?.thumbnail ||
    category?.coverImage ||
    category?.media?.[0]?.secureUrl ||
    category?.media?.[0]?.secure_url ||
    category?.media?.[0]?.url ||
    '';

  return typeof image === 'string' ? image : '';
}

function dedupeCategoriesBySlug(categories: any[]) {
  const seen = new Set<string>();

  return (Array.isArray(categories) ? categories : []).filter((category) => {
    const categorySlug = getCategorySlug(category);
    const categoryName = getCategoryName(category).toLowerCase().trim();
    const categoryParentSlug = getParentSlug(category);

    if (!categorySlug && !categoryName) return true;

    if (
      categorySlug &&
      categoryParentSlug &&
      categorySlug === categoryParentSlug
    ) {
      return false;
    }

    const key = `${categorySlug || categoryName}__${
      categoryParentSlug || 'root'
    }`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function flattenCategories(categories: any[]) {
  const rows: any[] = [];
  const globalSeen = new Set<string>();

  function walk(items: any[], level = 0, parentCategory: any = null) {
    const parentSlug = parentCategory ? getCategorySlug(parentCategory) : '';
    const parentName = parentCategory
      ? getCategoryName(parentCategory).toLowerCase().trim()
      : '';

    const cleanItems = dedupeCategoriesBySlug(Array.isArray(items) ? items : []);

    cleanItems.forEach((item, index) => {
      const itemSlug = getCategorySlug(item);
      const itemName = getCategoryName(item);
      const normalizedItemName = itemName.toLowerCase().trim();
      const id = getCategoryId(item, index);

      if (itemSlug && parentSlug && itemSlug === parentSlug) {
        return;
      }

      if (
        normalizedItemName &&
        parentName &&
        normalizedItemName === parentName
      ) {
        return;
      }

      const rowKey = `${itemSlug || normalizedItemName || id}__${
        parentSlug || 'root'
      }`;

      if (globalSeen.has(rowKey)) {
        return;
      }

      globalSeen.add(rowKey);

      const children = getCategoryChildren(item);

      const cleanedChildren = dedupeCategoriesBySlug(children).filter(
        (child: any) => {
          const childSlug = getCategorySlug(child);
          const childName = getCategoryName(child).toLowerCase().trim();

          if (itemSlug && childSlug && childSlug === itemSlug) {
            return false;
          }

          if (
            normalizedItemName &&
            childName &&
            childName === normalizedItemName
          ) {
            return false;
          }

          return true;
        },
      );

      rows.push({
        ...item,
        __id: id,
        __level: level,
        __parentName: parentName,
        __parentSlug: parentSlug,
        __hasChildren: cleanedChildren.length > 0,
      });

      if (cleanedChildren.length > 0) {
        walk(cleanedChildren, level + 1, item);
      }
    });
  }

  walk(Array.isArray(categories) ? categories : []);
  return rows;
}

function findCategoryPathById(
  categories: any[],
  categoryId: string,
  path: any[] = [],
): any[] {
  for (let index = 0; index < categories.length; index += 1) {
    const category = categories[index];
    const id = getCategoryId(category, index);
    const nextPath = [...path, category];

    if (id === categoryId) {
      return nextPath;
    }

    const foundPath = findCategoryPathById(
      getCategoryChildren(category),
      categoryId,
      nextPath,
    );

    if (foundPath.length > 0) {
      return foundPath;
    }
  }

  return [];
}

function flattenCategoryOptions(categories: any[], depth = 0): any[] {
  return categories.flatMap((category, index) => {
    const id = getCategoryId(category, index);
    const labelPrefix = depth > 0 ? `${'— '.repeat(depth)}` : '';

    return [
      {
        id,
        label: `${labelPrefix}${getCategoryName(category)}`,
        category,
        depth,
      },
      ...flattenCategoryOptions(getCategoryChildren(category), depth + 1),
    ];
  });
}

function extractCategoryTree(response: any) {
  const root = unwrapObject(response);

  const tree =
    root?.data ||
    root?.categories ||
    root?.tree ||
    root?.items ||
    root?.children ||
    root?.data?.data ||
    root?.data?.categories ||
    [];

  return Array.isArray(tree) ? tree : [];
}

export default function AdminCategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState('');

  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    parentId: '',
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const visibleRows = useMemo(() => {
    const rows = flattenCategories(categories);

    if (!search.trim()) return rows;

    return rows.filter((item) => {
      const searchableText = `${getCategoryName(item)} ${getCategoryDescription(
        item,
      )} ${getCategorySlug(item)}`.toLowerCase();

      return searchableText.includes(search.toLowerCase());
    });
  }, [categories, search]);

  const categoryOptions = useMemo(() => {
    return flattenCategoryOptions(categories);
  }, [categories]);

  async function loadCategories() {
    try {
      setLoading(true);
      setError('');

      const res = await adminCategoryTreeService.getAdminCategoryTree({
        includeInactive: true,
        showProductCount: true,
        showEmpty: true,
        maxDepth: 20,
      });

      const finalTree = extractCategoryTree(res);

      setCategories(finalTree);
    } catch (err: any) {
      setError(getApiErrorMessage(err));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openEditPage(category: any) {
    const editId =
      category?.slug ||
      category?.handle ||
      category?.__id ||
      category?.id ||
      category?._id ||
      category?.categoryId;

    if (!editId) {
      setError('Category ID or slug missing. Cannot open edit page.');
      return;
    }

    router.push(`/admin/category-tree/${encodeURIComponent(String(editId))}`);
  }

  async function createSubCategoryFromCategoryPage(e?: React.FormEvent) {
    e?.preventDefault();

    const name = subCategoryForm.name.trim();

    if (!name) {
      setError('Subcategory name is required.');
      return;
    }

    if (!subCategoryForm.parentId) {
      setError('Please select a parent category.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const parentPath = findCategoryPathById(
        categories,
        subCategoryForm.parentId,
      );

      const parentCategory = parentPath[parentPath.length - 1];

      if (!parentCategory) {
        setError('Parent category not found. Please select parent again.');
        return;
      }

      const parentSlug = getCategorySlug(parentCategory);

      if (!parentSlug) {
        setError('Parent category slug missing.');
        return;
      }

      await adminCategoriesService.createChildCategory({
        name,
        slug: makeSlug(name),
        description: '',
        parentSlug,
        isActive: true,
        sortOrder: 1,
      });

      setSuccess('Subcategory created successfully.');
      setShowSubCategoryModal(false);
      setSubCategoryForm({
        name: '',
        parentId: '',
      });

      await loadCategories();
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(category: any) {
    const slug = getCategoryDeleteSlug(category);
    const name = getCategoryName(category);

    if (!slug) {
      setError('Category slug missing. Delete API needs category slug.');
      return;
    }

    const confirmed = window.confirm(`Delete "${name}"?`);
    if (!confirmed) return;

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      await adminCategoriesService.deleteCategory(slug);

      setSuccess('Category deleted successfully.');
      setOpenMenuId('');

      await loadCategories();
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError(
          `Backend could not find category slug "${slug}". Please verify this slug in Swagger: DELETE /admin/catalog/categories/${slug}`,
        );
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Catalog › Categories</p>

          <h1 className="mt-2 text-3xl font-bold text-gray-950">
            Categories
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage collections, subcategories, product grouping and category
            hierarchy.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={loadCategories}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSubCategoryForm({
                name: '',
                parentId: '',
              });
              setShowSubCategoryModal(true);
            }}
          >
            Create new subcategory
          </Button>

          <Button
            type="button"
            onClick={() => router.push('/admin/category-tree/create')}
          >
            <span className="flex items-center gap-2">
              <PlusCircle size={16} />
              Add new category
            </span>
          </Button>
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

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">
            Categories ({visibleRows.length})
          </h2>
        </div>

        <div className="border-b bg-gray-50 px-5 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories"
              className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading categories...</p>
        ) : visibleRows.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No categories found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Products</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleRows.map((category, index) => {
                  const id = category.__id || getCategoryId(category, index);
                  const name = getCategoryName(category);
                  const hasChildren = Boolean(category.__hasChildren);
                  const image = getCategoryImage(category);

                  return (
                    <tr key={`${id}-${getCategorySlug(category)}`} className="border-b last:border-b-0">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span style={{ width: `${category.__level * 24}px` }} />

                          {category.__level > 0 && (
                            <span className="text-gray-400">↳</span>
                          )}

                          {image ? (
                            <img
                              src={image}
                              alt={name}
                              className="h-11 w-11 rounded-xl border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-400">
                              {name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-gray-950">
                                {name}
                              </span>

                              {category.__level === 0 ? (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                  Category
                                </span>
                              ) : (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                  Sub category
                                </span>
                              )}

                              {hasChildren && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                  Parent
                                </span>
                              )}

                              {category.isActive === false && (
                                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">
                                  Hidden
                                </span>
                              )}
                            </div>

                            <p className="mt-1 break-all text-xs text-gray-500">
                              /{getCategorySlug(category) || '-'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
    {getCategoryProductCount(category)}
  </span>
</td>

                      <td className="px-5 py-4">
                        <div className="relative flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => openEditPage(category)}
                            className="text-gray-600 hover:text-black"
                            title="Edit category"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSubCategoryForm({
                                name: '',
                                parentId: id,
                              });
                              setShowSubCategoryModal(true);
                            }}
                            className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            title="Add subcategory"
                          >
                            Add sub
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(openMenuId === id ? '' : id)
                            }
                            className="text-gray-600 hover:text-black"
                            title="More actions"
                          >
                            <MoreVertical size={17} />
                          </button>

                          {openMenuId === id && (
                            <div className="absolute right-0 top-7 z-20 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                              <button
                                type="button"
                                disabled={deleting}
                                onClick={() => handleDeleteCategory(category)}
                                className="block w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                {deleting ? 'Deleting...' : 'Delete'}
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
      </Card>

      {showSubCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-bold text-gray-950">
                Create new subcategory
              </h2>

              <button
                type="button"
                onClick={() => setShowSubCategoryModal(false)}
                className="rounded-lg px-2 py-1 text-xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={createSubCategoryFromCategoryPage}
              className="space-y-4 p-5"
            >
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">
                  Parent category
                </span>

                <select
                  value={subCategoryForm.parentId}
                  onChange={(e) =>
                    setSubCategoryForm((prev) => ({
                      ...prev,
                      parentId: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-black"
                  required
                >
                  <option value="">Select parent category</option>

                  {categoryOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <Input
                label="Subcategory name"
                value={subCategoryForm.name}
                onChange={(e) =>
                  setSubCategoryForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Example: Bridesmaid Dresses"
              />

              <div className="rounded-xl bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-500">
                This creates a child category using selected parent&apos;s slug as{' '}
                <b>parentSlug</b>. It does not send <b>collectionSlug</b>.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowSubCategoryModal(false)}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create subcategory'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}