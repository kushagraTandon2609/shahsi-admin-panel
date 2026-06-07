'use client';

import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Star,
  X,
} from 'lucide-react';
import { Button } from '@/components/admin/Button';

type ProductCategoryTreeSelectorProps = {
  categories: any[];
  selectedCategoryIds: string[];
  primaryCategoryId: string;
  onSelectedChange: (ids: string[]) => void;
  onPrimaryChange: (id: string) => void;
  onAddCategory: (payload: {
    name: string;
    parentId?: string;
  }) => Promise<void>;
};

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

function getCategoryChildren(category: any) {
  const children =
    category?.children ||
    category?.subcategories ||
    category?.items ||
    category?.nodes ||
    [];

  return Array.isArray(children) ? children : [];
}

function getCategoryProductCount(category: any) {
  return (
    category?.directProductCount ||
    category?.productCount ||
    category?.productsCount ||
    category?.count ||
    0
  );
}

function getCategoryImage(category: any) {
  return (
    category?.imageUrl ||
    category?.categoryImageUrl ||
    category?.image?.url ||
    category?.image?.secureUrl ||
    category?.image ||
    category?.thumbnail ||
    category?.coverImage ||
    category?.media?.[0]?.url ||
    category?.media?.[0]?.secureUrl ||
    ''
  );
}

function flattenCategories(categories: any[]) {
  const list: any[] = [];

  function walk(items: any[], level = 0, parentName = '') {
    items.forEach((item, index) => {
      const id = getCategoryId(item, index);
      const children = getCategoryChildren(item);

      list.push({
        ...item,
        __id: id,
        __level: level,
        __parentName: parentName,
        __hasChildren: children.length > 0,
      });

      if (children.length > 0) {
        walk(children, level + 1, getCategoryName(item));
      }
    });
  }

  walk(categories);
  return list;
}

function searchTree(items: any[], search: string): any[] {
  if (!search.trim()) return items;

  const query = search.toLowerCase();

  return items
    .map((item) => {
      const children = getCategoryChildren(item);
      const matchedChildren = searchTree(children, search);
      const name = getCategoryName(item).toLowerCase();
      const slug = getCategorySlug(item).toLowerCase();

      const selfMatches = name.includes(query) || slug.includes(query);

      if (selfMatches || matchedChildren.length > 0) {
        return {
          ...item,
          children: matchedChildren.length > 0 ? matchedChildren : children,
          subcategories: matchedChildren.length > 0 ? matchedChildren : children,
        };
      }

      return null;
    })
    .filter(Boolean);
}

export function ProductCategoryTreeSelector({
  categories = [],
  selectedCategoryIds = [],
  primaryCategoryId = '',
  onSelectedChange,
  onPrimaryChange,
  onAddCategory,
}: ProductCategoryTreeSelectorProps) {
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [adding, setAdding] = useState(false);
  const [localError, setLocalError] = useState('');

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  const searchedCategories = useMemo(() => {
    return searchTree(categories, search);
  }, [categories, search]);

  const selectedCategories = useMemo(() => {
    return selectedCategoryIds
      .map((id) => flatCategories.find((category) => category.__id === id))
      .filter(Boolean);
  }, [flatCategories, selectedCategoryIds]);

  const primaryCategory = useMemo(() => {
    return flatCategories.find((category) => category.__id === primaryCategoryId);
  }, [flatCategories, primaryCategoryId]);

  function expandAllParentsForSearch() {
    if (!search.trim()) return;

    const ids = flatCategories
      .filter((category) => category.__hasChildren)
      .map((category) => category.__id);

    setExpandedIds(ids);
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function toggleSelected(id: string) {
    const alreadySelected = selectedCategoryIds.includes(id);

    if (alreadySelected) {
      const nextIds = selectedCategoryIds.filter((item) => item !== id);

      onSelectedChange(nextIds);

      if (primaryCategoryId === id) {
        onPrimaryChange(nextIds[0] || '');
      }

      return;
    }

    const nextIds = Array.from(new Set([...selectedCategoryIds, id]));

    onSelectedChange(nextIds);

    if (!primaryCategoryId || !nextIds.includes(primaryCategoryId)) {
      onPrimaryChange(id);
    }
  }

  function removeSelected(id: string) {
    const nextIds = selectedCategoryIds.filter((item) => item !== id);

    onSelectedChange(nextIds);

    if (primaryCategoryId === id) {
      onPrimaryChange(nextIds[0] || '');
    }
  }

  function makePrimary(id: string) {
    const nextIds = selectedCategoryIds.includes(id)
      ? selectedCategoryIds
      : Array.from(new Set([...selectedCategoryIds, id]));

    if (!selectedCategoryIds.includes(id)) {
      onSelectedChange(nextIds);
    }

    onPrimaryChange(id);
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) {
      setLocalError('Category name is required.');
      return;
    }

    setAdding(true);
    setLocalError('');

    try {
      await onAddCategory({
        name: newCategoryName.trim(),
        parentId: newParentId || undefined,
      });

      setNewCategoryName('');
      setNewParentId('');
      setShowAddCategory(false);
    } catch (err: any) {
      setLocalError(err?.message || 'Unable to add category.');
    } finally {
      setAdding(false);
    }
  }

  function renderTree(items: any[], level = 0) {
    if (!items.length) {
      return null;
    }

    return (
      <div className={level > 0 ? 'ml-5 mt-1 space-y-1' : 'space-y-1'}>
        {items.map((category, index) => {
          const id = getCategoryId(category, index);
          const name = getCategoryName(category);
          const children = getCategoryChildren(category);
          const hasChildren = children.length > 0;
          const expanded = search.trim() ? true : expandedIds.includes(id);
          const checked = selectedCategoryIds.includes(id);
          const isPrimary = primaryCategoryId === id;
          const image = getCategoryImage(category);
          const productCount = getCategoryProductCount(category);

          return (
            <div key={id}>
              <div
                className={`flex items-center gap-2 rounded-xl px-2 py-2 transition ${
                  checked ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (hasChildren) toggleExpand(id);
                  }}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-white"
                >
                  {hasChildren ? (
                    expanded ? (
                      <ChevronDown size={15} />
                    ) : (
                      <ChevronRight size={15} />
                    )
                  ) : (
                    <span className="h-4 w-4" />
                  )}
                </button>

                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSelected(id)}
                  className="h-4 w-4 shrink-0"
                />

                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="h-8 w-8 shrink-0 rounded-lg border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-400">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium text-gray-900">
                      {name}
                    </span>

                    {level === 0 && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                        Collection
                      </span>
                    )}

                    {isPrimary && (
                      <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
                        Primary
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-xs text-gray-400">
                    {productCount} direct product
                    {Number(productCount) === 1 ? '' : 's'}
                  </p>
                </div>

                {checked && !isPrimary && (
                  <button
                    type="button"
                    onClick={() => makePrimary(id)}
                    className="hidden rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 hover:border-black hover:text-black sm:inline-flex"
                    title="Set as primary"
                  >
                    Primary
                  </button>
                )}
              </div>

              {hasChildren && expanded && renderTree(children, level + 1)}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-950">Categories</h2>

          <p className="mt-1 text-sm text-gray-500">
            Select one or more categories. Only the categories you manually select
            will be assigned to this product.
          </p>

          {primaryCategory && (
            <p className="mt-2 text-xs text-gray-500">
              Primary category:{' '}
              <span className="font-semibold text-gray-900">
                {getCategoryName(primaryCategory)}
              </span>
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowAddCategory((prev) => !prev)}
        >
          <span className="flex items-center gap-2">
            <Plus size={15} />
            Add category
          </span>
        </Button>
      </div>

      {localError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {localError}
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setTimeout(expandAllParentsForSearch, 0);
          }}
          placeholder="Search categories"
          className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm outline-none focus:border-black focus:bg-white"
        />
      </div>

      {showAddCategory && (
        <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px_auto]">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-black"
            />

            <select
              value={newParentId}
              onChange={(e) => setNewParentId(e.target.value)}
              className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-black"
            >
              <option value="">No parent category</option>

              {flatCategories.map((category) => (
                <option key={category.__id} value={category.__id}>
                  {'-- '.repeat(category.__level || 0)}
                  {getCategoryName(category)}
                </option>
              ))}
            </select>

            <Button
              type="button"
              onClick={handleAddCategory}
              disabled={adding || !newCategoryName.trim()}
            >
              {adding ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>
      )}

      {selectedCategories.length > 0 && (
        <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Selected categories
          </p>

          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category: any) => (
              <span
                key={category.__id}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700"
              >
                {primaryCategoryId === category.__id && <Star size={12} />}
                {getCategoryName(category)}

                {primaryCategoryId === category.__id && (
                  <span className="rounded-full bg-black px-2 py-0.5 text-[10px] text-white">
                    Primary
                  </span>
                )}

                {primaryCategoryId !== category.__id && (
                  <button
                    type="button"
                    onClick={() => makePrimary(category.__id)}
                    className="font-semibold text-gray-500 hover:text-black"
                  >
                    Set primary
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => removeSelected(category.__id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3">
        {categories.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No categories found. Add a category to start assigning products.
          </p>
        ) : searchedCategories.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No categories matched your search.
          </p>
        ) : (
          renderTree(searchedCategories)
        )}
      </div>
    </div>
  );
}