'use client';

import { useEffect, useMemo, useState } from 'react';
import { ImageIcon, Plus, Search, X } from 'lucide-react';
import { adminCatalogService } from '@/services/admin-catalog.service';
import { getApiErrorMessage, unwrapList } from '@/lib/admin-response';

type ProductMetafieldsEditorProps = {
  initialValues?: Record<string, string | string[]>;
  onChange?: (values: Record<string, string | string[]>) => void;
  currentProductId?: string;
  categoryTree?: any[];
  onAddCategory?: (payload: { name: string; parentId?: string }) => Promise<void> | void;
  selectedMetafieldProducts?: Record<string, any[]>;
  onBrowseProducts?: (field: string) => void;
  onRemoveProduct?: (field: string, productId: string) => void;
};

type FieldConfig = {
  key: string;
  label: string;
  type?: 'text' | 'tags' | 'product-picker' | 'collection-picker' | 'multi-collection-picker';
};

const PRODUCT_METAFIELDS: FieldConfig[] = [
  {
    key: 'productFaqs',
    label: 'Product Faqs',
    type: 'text',
  },
  {
    key: 'careInstructions',
    label: 'Care & Instructions',
    type: 'text',
  },
  {
    key: 'compositionOrigin',
    label: 'Composition & Origin',
    type: 'text',
  },
  {
    key: 'customBadge',
    label: 'Custom Badge',
    type: 'text',
  },
  {
    key: 'seeMoreFrom',
    label: 'See more from',
    type: 'multi-collection-picker',
  },
{
  key: 'primaryCollection',
  label: 'Primary collection',
  type: 'collection-picker',
},
{
  key: 'secondaryCollection',
  label: 'Secondary collection',
  type: 'collection-picker',
},
  {
  key: 'similarColorProducts',
  label: 'Similar Color Products',
  type: 'product-picker',
},
{
  key: 'matchWithAccessories',
  label: 'Match with Accessories',
  type: 'product-picker',
},
{
  key: 'completeTheLook',
  label: 'Complete the Look',
  type: 'product-picker',
},
  {
    key: 'advancedProductTitle',
    label: 'Advanced Product Title',
    type: 'text',
  },
  {
    key: 'similarStyleProduct',
    label: 'Similar Style Product',
    type: 'product-picker',
  },
  {
    key: 'style',
    label: 'Style',
    type: 'text',
  },
  {
    key: 'fabric',
    label: 'Fabric',
    type: 'text',
  },
  {
    key: 'print',
    label: 'Print',
    type: 'text',
  },
  {
    key: 'printSwatch',
    label: 'Print Swatch',
    type: 'text',
  },
  {
    key: 'similarPrintTitle',
    label: 'Similar Print Title',
    type: 'text',
  },
  {
    key: 'similarPrintProducts',
    label: 'Similar Print Products',
    type: 'product-picker',
  },
];

function normalizeTags(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value;

  if (!value) return [];

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getInitialValue(
  initialValues: Record<string, string | string[]> | undefined,
  key: string,
) {
  const value = initialValues?.[key];

  if (Array.isArray(value)) return value;

  return value || '';
}

function getProductId(product: any) {
  return String(
    product?.id ||
      product?._id ||
      product?.productId ||
      product?.catalogId ||
      '',
  );
}

function getProductTitle(product: any) {
  return (
    product?.title ||
    product?.name ||
    product?.productName ||
    product?.displayName ||
    'Untitled product'
  );
}

function getProductImage(product: any) {
  const primaryImage = Array.isArray(product?.images)
    ? product.images.find((item: any) => item?.isPrimary) || product.images[0]
    : null;

  const image =
    product?.image ||
    product?.imageUrl ||
    product?.thumbnail ||
    product?.primaryImage ||
    primaryImage?.url ||
    primaryImage?.secureUrl ||
    product?.media?.[0]?.url ||
    product?.media?.[0]?.secureUrl ||
    product?.productImages?.[0]?.url ||
    product?.gallery?.[0]?.url ||
    '';

  if (typeof image === 'string') return image;

  return image?.url || image?.secureUrl || image?.src || '';
}

function getProductStatus(product: any) {
  return String(
    product?.adminStatus ||
      product?.statusLabel ||
      product?.status ||
      product?.publishStatus ||
      '',
  ).toUpperCase();
}

function getProductCategory(product: any) {
  return String(
    product?.category ||
      product?.primaryCategory ||
      product?.primaryCollection ||
      product?.collection ||
      '',
  );
}

function getProductType(product: any) {
  return String(product?.productType || product?.type || '');
}

function getProductVendor(product: any) {
  return String(product?.vendor || product?.vendorName || product?.brand || '');
}

function getProductTags(product: any) {
  if (Array.isArray(product?.tags)) return product.tags.join(' ');
  return String(product?.tags || '');
}

function getCollectionNameFromItem(category: any) {
  return String(
    category?.name ||
      category?.title ||
      category?.label ||
      category?.slug ||
      category?.handle ||
      '',
  ).trim();
}

function getCollectionIdFromItem(category: any, index?: number) {
  return String(
    category?.id ||
      category?._id ||
      category?.categoryId ||
      category?.slug ||
      category?.handle ||
      category?.name ||
      index ||
      '',
  ).trim();
}

function getCollectionChildrenFromItem(category: any) {
  const children =
    category?.children ||
    category?.subcategories ||
    category?.items ||
    category?.nodes ||
    [];

  return Array.isArray(children) ? children : [];
}

function flattenCollectionTree(categories: any[] = []) {
  const output: any[] = [];

  function walk(items: any[], level = 0) {
    items.forEach((item, index) => {
      const id = getCollectionIdFromItem(item, index);
      const name = getCollectionNameFromItem(item);

      if (name) {
        output.push({
          ...item,
          __id: id,
          __name: name,
          __level: level,
        });
      }

      const children = getCollectionChildrenFromItem(item);

      if (children.length > 0) {
        walk(children, level + 1);
      }
    });
  }

  walk(categories);
  return output;
}

function productMatchesFilter(product: any, query: string, filter: string) {
  const cleanQuery = query.toLowerCase().trim();

  if (!cleanQuery) return true;

  const title = getProductTitle(product).toLowerCase();
  const category = getProductCategory(product).toLowerCase();
  const type = getProductType(product).toLowerCase();
  const vendor = getProductVendor(product).toLowerCase();
  const tags = getProductTags(product).toLowerCase();

  if (filter === 'category') return category.includes(cleanQuery);
  if (filter === 'type') return type.includes(cleanQuery);
  if (filter === 'tags') return tags.includes(cleanQuery);
  if (filter === 'vendor') return vendor.includes(cleanQuery);

  return (
    title.includes(cleanQuery) ||
    category.includes(cleanQuery) ||
    type.includes(cleanQuery) ||
    vendor.includes(cleanQuery) ||
    tags.includes(cleanQuery)
  );
}

export function ProductMetafieldsEditor({
  initialValues,
  onChange,
  currentProductId,
  categoryTree = [],
  onAddCategory,
  selectedMetafieldProducts,
  onBrowseProducts,
  onRemoveProduct,
}: ProductMetafieldsEditorProps) {
  const initialState = useMemo(() => {
    return PRODUCT_METAFIELDS.reduce<Record<string, string | string[]>>(
      (acc, field) => {
        acc[field.key] =
          field.type === 'tags' || field.type === 'product-picker'
            ? normalizeTags(initialValues?.[field.key])
            : getInitialValue(initialValues, field.key);

        return acc;
      },
      {},
    );
  }, [initialValues]);

  const [values, setValues] = useState<Record<string, string | string[]>>(
    initialState,
  );

  const [tagInput, setTagInput] = useState<Record<string, string>>({});
const [draggedSimilarProductId, setDraggedSimilarProductId] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState('');
  const [pickerProducts, setPickerProducts] = useState<any[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerFilter, setPickerFilter] = useState<
    'all' | 'category' | 'type' | 'tags' | 'vendor'
  >('all');

  const [pickerPage, setPickerPage] = useState(1);
  const pickerLimit = 50;

  const [pickerLoaded, setPickerLoaded] = useState(false);
  const [activeCollectionField, setActiveCollectionField] = useState<string>('');
  const [collectionSearch, setCollectionSearch] = useState('');
  

  const collectionOptions = useMemo(() => {
    const flat = flattenCollectionTree(categoryTree);

    const uniqueMap = new Map<string, any>();

    flat.forEach((item) => {
      const name = String(item.__name || '').trim();
      const key = name.toLowerCase();

      if (name && !uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    return Array.from(uniqueMap.values());
  }, [categoryTree]);

  const filteredCollectionOptions = useMemo(() => {
    const query = collectionSearch.toLowerCase().trim();

    if (!query) return collectionOptions;

    return collectionOptions.filter((item) =>
      String(item.__name || '').toLowerCase().includes(query),
    );
  }, [collectionOptions, collectionSearch]);

  const displayPickerProducts = pickerProducts;




  useEffect(() => {
    setValues(initialState);
  }, [initialState]);

  function emit(nextValues: Record<string, string | string[]>) {
    setValues(nextValues);
    onChange?.(nextValues);
  }

  function updateText(key: string, value: string) {
    emit({
      ...values,
      [key]: value,
    });
  }
function handleProductDragStart(productId: string) {
  setDraggedSimilarProductId(productId);
}

function handleProductDragOver(event: React.DragEvent<HTMLDivElement>) {
  event.preventDefault();
}

function handleProductDrop(fieldKey: string, targetProductId: string) {
  if (!draggedSimilarProductId || draggedSimilarProductId === targetProductId) {
    return;
  }

  const currentIds = normalizeTags(values[fieldKey]);

  const fromIndex = currentIds.findIndex((id) => id === draggedSimilarProductId);
  const toIndex = currentIds.findIndex((id) => id === targetProductId);

  if (fromIndex === -1 || toIndex === -1) return;

  const reorderedIds = [...currentIds];
  const [movedId] = reorderedIds.splice(fromIndex, 1);
  reorderedIds.splice(toIndex, 0, movedId);

  emit({
    ...values,
    [fieldKey]: reorderedIds,
  });

  setDraggedSimilarProductId('');
}

function handleProductDragEnd() {
  setDraggedSimilarProductId('');
}
  function addTag(key: string, value: string) {
    const cleanValue = value.trim();
    if (!cleanValue) return;

    const currentTags = normalizeTags(values[key]);

    if (currentTags.includes(cleanValue)) {
      setTagInput((prev) => ({
        ...prev,
        [key]: '',
      }));
      return;
    }

    emit({
      ...values,
      [key]: [...currentTags, cleanValue],
    });

    setTagInput((prev) => ({
      ...prev,
      [key]: '',
    }));
  }

  function removeTag(key: string, tag: string) {
    const currentTags = normalizeTags(values[key]);

    emit({
      ...values,
      [key]: currentTags.filter((item) => item !== tag),
    });
  }

  function handleTagKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    key: string,
  ) {
    if (event.key !== 'Enter' && event.key !== ',') return;

    event.preventDefault();
    addTag(key, tagInput[key] || '');
  }

  function buildPickerParams() {
    // API expects: search, searchBy, category, collection, type, tag, vendor, status, page, limit
    const params: {
      page: number;
      limit: number;
      search?: string;
      searchBy?: 'all' | 'title' | 'productId' | 'sku' | 'barcode';
      category?: string;
      type?: string;
      tag?: string;
      vendor?: string;
      status?: string;
    } = {
      page: pickerPage,
      limit: pickerLimit,
      search: pickerSearch || undefined,
      searchBy: 'all',
    };

    if (pickerFilter === 'category') params.category = pickerSearch || undefined;
    if (pickerFilter === 'type') params.type = pickerSearch || undefined;
    if (pickerFilter === 'vendor') params.vendor = pickerSearch || undefined;
    if (pickerFilter === 'tags') params.tag = pickerSearch || undefined;

    // For the dropdown option "all", we do server-side title-ish search via searchBy=all.
    // For the other dropdown options, we set the corresponding param and still pass search.
    return params;
  }

  async function fetchProductPickerProducts() {
    if (!showProductPicker || onBrowseProducts) return;

    setPickerLoading(true);
    setPickerError('');

    try {
      const params = buildPickerParams();

      const res = await adminCatalogService.getProductPicker({
        ...params,
        // Keep backend search generic. When filter != 'all', backend will also narrow by param.
        searchBy: 'all',
      });

      const products = unwrapList(res);

      const cleanProducts = products.filter((product: any) => {
        const id = getProductId(product);
        return id && id !== currentProductId;
      });

      setPickerProducts(cleanProducts);
      setPickerLoaded(true);
    } catch (err: any) {
      setPickerError(getApiErrorMessage(err));
      setPickerProducts([]);
      setPickerLoaded(false);
    } finally {
      setPickerLoading(false);
    }
  }

  function openProductPicker() {
    setShowProductPicker(true);
    setPickerLoaded(false);
    setPickerProducts([]);
    setPickerPage(1);
  }


  function toggleProductForField(fieldKey: string, product: any) {
  const productId = getProductId(product);
  if (!productId) return;

  const currentIds = normalizeTags(values[fieldKey]);

  const nextIds = currentIds.includes(productId)
    ? currentIds.filter((id) => id !== productId)
    : [...currentIds, productId];

  emit({
    ...values,
    [fieldKey]: nextIds,
  });
}

function removeProductFromField(fieldKey: string, productId: string) {
  const currentIds = normalizeTags(values[fieldKey]);

  emit({
    ...values,
    [fieldKey]: currentIds.filter((id) => id !== productId),
  });
}

function selectCollectionValue(fieldKey: string, value: string) {
  emit({
    ...values,
    [fieldKey]: value,
  });

  setActiveCollectionField('');
  setCollectionSearch('');
}

function clearCollectionValue(fieldKey: string) {
  emit({
    ...values,
    [fieldKey]: '',
  });

  setActiveCollectionField('');
  setCollectionSearch('');
}



function renderCollectionPickerField(fieldKey: string, label: string) {
  const selectedValue = String(values[fieldKey] || '').trim();
  const isOpen = activeCollectionField === fieldKey;

  return (
    <div className="relative">
      <div className="flex min-h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-2 py-1.5 shadow-sm">
        {selectedValue ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <ImageIcon size={15} className="shrink-0 text-gray-500" />

            <span className="truncate rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800">
              {selectedValue}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setActiveCollectionField(fieldKey);
              setCollectionSearch('');
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Select collection
          </button>
        )}

        {selectedValue ? (
          <>
            <button
              type="button"
              onClick={() => {
                setActiveCollectionField(fieldKey);
                setCollectionSearch('');
              }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Change
            </button>

            <button
              type="button"
              onClick={() => clearCollectionValue(fieldKey)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Clear
            </button>
          </>
        ) : null}
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="border-b border-gray-200 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                autoFocus
                value={collectionSearch}
                onChange={(e) => setCollectionSearch(e.target.value)}
                placeholder="Find collections"
                className="h-11 w-full rounded-xl border border-gray-300 pl-10 pr-3 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto py-2">
            {filteredCollectionOptions.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                No collections found.
              </p>
            ) : (
              filteredCollectionOptions.map((item) => {
                const name = String(item.__name || '').trim();
                const level = Number(item.__level || 0);

                return (
                  <button
                    key={`${item.__id}-${name}`}
                    type="button"
                    onClick={() => selectCollectionValue(fieldKey, name)}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      selectedValue === name ? 'bg-gray-100' : ''
                    }`}
                    style={{
                      paddingLeft: `${16 + level * 18}px`,
                    }}
                  >
                    <ImageIcon size={16} className="shrink-0 text-gray-400" />

                    <span className="min-w-0 flex-1 truncate text-gray-900">
                      {name}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 p-3 text-right">

            <button
      type="button"
      onClick={() => {
        setActiveCollectionField('');
        setCollectionSearch('');
      }}
      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
    >
      Close
    </button>
  <button
    type="button"
    onClick={() => {
      setActiveCollectionField('');
      setCollectionSearch('');
    }}
    className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
  >
    Done
  </button>
</div>
        </div>
      )}
    </div>
  );
}

function normalizeMultiCollectionValue(value: any) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toggleMultiCollectionValue(fieldKey: string, value: string) {
  const selectedValues = normalizeMultiCollectionValue(values[fieldKey]);

  const nextValues = selectedValues.includes(value)
    ? selectedValues.filter((item) => item !== value)
    : [...selectedValues, value];

  emit({
    ...values,
    [fieldKey]: nextValues,
  });
}

function removeMultiCollectionValue(fieldKey: string, value: string) {
  const selectedValues = normalizeMultiCollectionValue(values[fieldKey]);

  emit({
    ...values,
    [fieldKey]: selectedValues.filter((item) => item !== value),
  });
}

function clearMultiCollectionValue(fieldKey: string) {
  emit({
    ...values,
    [fieldKey]: [],
  });

  setActiveCollectionField('');
  setCollectionSearch('');
  
}



function renderMultiCollectionPickerField(fieldKey: string, label: string) {
  const selectedValues = normalizeMultiCollectionValue(values[fieldKey]);
  const isOpen = activeCollectionField === fieldKey;

  return (
    <div className="relative">
      <div className="flex min-h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-2 py-1.5 shadow-sm">
        {selectedValues.length > 0 ? (
          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            {selectedValues.map((value) => (
              <span
                key={value}
                className="inline-flex max-w-full items-center gap-2 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800"
              >
                <ImageIcon size={14} className="shrink-0 text-gray-500" />

                <span className="truncate">{value}</span>

                <button
                  type="button"
                  onClick={() => removeMultiCollectionValue(fieldKey, value)}
                  className="shrink-0 text-gray-500 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setActiveCollectionField(fieldKey);
              setCollectionSearch('');
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Select collections
          </button>
        )}

        {selectedValues.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => {
                setActiveCollectionField(fieldKey);
                setCollectionSearch('');
              }}
              className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Change
            </button>

            <button
              type="button"
              onClick={() => clearMultiCollectionValue(fieldKey)}
              className="shrink-0 text-sm font-medium text-blue-600 hover:underline"
            >
              Clear
            </button>
          </>
        ) : null}
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="border-b border-gray-200 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                autoFocus
                value={collectionSearch}
                onChange={(e) => setCollectionSearch(e.target.value)}
                placeholder="Find collections"
                className="h-11 w-full rounded-xl border border-gray-300 pl-10 pr-3 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto py-2">
            {filteredCollectionOptions.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                No collections found.
              </p>
            ) : (
              filteredCollectionOptions.map((item) => {
                const name = String(item.__name || '').trim();
                const level = Number(item.__level || 0);
                const checked = selectedValues.includes(name);

                return (
                  <button
                    key={`${item.__id}-${name}`}
                    type="button"
                    onClick={() => toggleMultiCollectionValue(fieldKey, name)}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      checked ? 'bg-gray-100' : ''
                    }`}
                    style={{
                      paddingLeft: `${16 + level * 18}px`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="h-4 w-4"
                    />

                    <ImageIcon size={16} className="shrink-0 text-gray-400" />

                    <span className="min-w-0 flex-1 truncate text-gray-900">
                      {name}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-3">
            <button
      type="button"
      onClick={() => {
        setActiveCollectionField('');
        setCollectionSearch('');
      }}
      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
    >
      Close
    </button>
            <p className="text-sm text-gray-500">
              {selectedValues.length} selected
            </p>

            <button
              type="button"
              onClick={() => {
                setActiveCollectionField('');
                setCollectionSearch('');
                
              }}
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function renderProductPickerField(fieldKey: string, label = 'items') {
  const selectedIds = normalizeTags(values[fieldKey]);

  const externalSelected = selectedMetafieldProducts?.[fieldKey] || [];

  const selectedProducts = selectedIds.map((idOrTitle) => {
    const foundExternal = externalSelected.find((item: any) =>
      (typeof item === 'string' ? item : getProductId(item)) === idOrTitle ||
      getProductTitle(item) === idOrTitle,
    );

    if (foundExternal) return typeof foundExternal === 'string' ? { id: foundExternal, title: foundExternal } : foundExternal;

    const found = pickerProducts.find(
      (product) => getProductId(product) === idOrTitle || getProductTitle(product) === idOrTitle,
    );

    return (
      found || {
        id: idOrTitle,
        title: idOrTitle,
      }
    );
  });

  return (
    <div>
      <div className="rounded-xl border border-gray-300 bg-white shadow-sm">
        {selectedIds.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">
            No {label.toLowerCase()} added.
          </div>
        ) : (
          <div className="divide-y">
            {selectedProducts.map((product) => {
              const id = getProductId(product);
              const title = getProductTitle(product);
              const image = getProductImage(product);
              const status = getProductStatus(product);
              const dragId = id || title;

              return (
                <div
                  key={dragId}
                  draggable
                  onDragStart={() => handleProductDragStart(dragId)}
                  onDragOver={handleProductDragOver}
                  onDrop={() => handleProductDrop(fieldKey, dragId)}
                  onDragEnd={handleProductDragEnd}
                  className={`flex cursor-grab items-center gap-3 p-3 active:cursor-grabbing ${
                    draggedSimilarProductId === dragId
                      ? 'bg-gray-100 opacity-60'
                      : 'bg-white'
                  }`}
                >
                  <span className="select-none text-lg leading-none text-gray-300">
                    ⋮⋮
                  </span>

                  {image ? (
                    <img
                      src={image}
                      alt={title}
                      className="h-11 w-11 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-400">
                      {title.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-950">
                      {title}
                    </p>

                    {status && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {status}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => (onRemoveProduct ? onRemoveProduct(fieldKey, dragId) : removeProductFromField(fieldKey, dragId))}
                    className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-red-600"
                  >
                    <X size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative mt-2 inline-block">
        <button
          type="button"
          onClick={() => (onBrowseProducts ? onBrowseProducts(fieldKey) : openProductPicker())}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
        >
          <Plus size={14} />
          Browse products
        </button>

        {showProductPicker && !onBrowseProducts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
            <div className="flex max-h-[82vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h3 className="text-sm font-bold text-gray-950">
                  Add {label}
                </h3>

                <button
                  type="button"
                  onClick={() => setShowProductPicker(false)}
                  className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="border-b border-gray-200 p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px]">
                  <div className="relative flex-1">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      value={pickerSearch}
                      onChange={(e) => {
                        setPickerSearch(e.target.value);
                        setPickerPage(1);
                      }}
                      placeholder="Search products"
                      className="h-9 w-full rounded-xl border border-gray-300 pl-9 pr-3 text-sm outline-none transition focus:border-black"
                    />
                  </div>

                  <select
                    value={pickerFilter}
                    onChange={(e) => {
                      setPickerPage(1);
                      setPickerFilter(
                        e.target.value as
                          | 'all'
                          | 'category'
                          | 'type'
                          | 'tags'
                          | 'vendor',
                      );
                    }}
                    className="h-9 rounded-xl border border-gray-300 bg-white px-2 text-sm outline-none transition focus:border-black"
                  >
                    <option value="all">All</option>
                    <option value="category">Category</option>
                    <option value="type">Type</option>
                    <option value="tags">Tags</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>
              </div>

              <div className="min-h-[420px] flex-1 overflow-y-auto">
                {!pickerLoaded && !pickerLoading ? (
                  <p className="p-4 text-sm text-gray-500">Start searching to load products.</p>
                ) : pickerLoading ? (
                  <p className="p-4 text-sm text-gray-500">
                    Loading products...
                  </p>
                ) : pickerError ? (
                  <p className="p-4 text-sm text-red-600">{pickerError}</p>
                ) : displayPickerProducts.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">
                    No products found.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {displayPickerProducts.map((product: any) => {
                      const id = getProductId(product);
                      const title = getProductTitle(product);
                      const image = getProductImage(product);
                      const selectedIdsForField = normalizeTags(values[fieldKey]);
                      const checked = selectedIdsForField.includes(id);

                      return (
                        <label
                          key={id}
                          className="flex cursor-pointer items-center gap-3 px-3 py-2 transition hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProductForField(fieldKey, product)}
                            className="h-4 w-4"
                          />

                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-400">
                              {title.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-950">
                              {title}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-gray-500">
                              {getProductCategory(product) || 'No category'}
                              {getProductType(product)
                                ? ` • ${getProductType(product)}`
                                : ''}
                              {getProductVendor(product)
                                ? ` • ${getProductVendor(product)}`
                                : ''}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-500">
                  {selectedIds.length} selected
                </p>

                <button
                  type="button"
                  onClick={() => setShowProductPicker(false)}
                  className="h-9 rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-bold text-gray-950">
            Product metafields
          </h2>
        </div>

        <div className="space-y-3 p-5">
        {PRODUCT_METAFIELDS.map((field) => {
  const isTags = field.type === 'tags';
  const isProductPicker = field.type === 'product-picker';
  const isCollectionPicker = field.type === 'collection-picker';
  const isMultiCollectionPicker = field.type === 'multi-collection-picker';
  const tags = normalizeTags(values[field.key]);

            return (
              <div
                key={field.key}
                className="grid grid-cols-1 gap-2 md:grid-cols-[210px_minmax(0,1fr)] md:items-start"
              >
                <label className="pt-2 text-sm font-medium text-gray-700">
                  {field.label}
                </label>

                {isMultiCollectionPicker ? (
  renderMultiCollectionPickerField(field.key, field.label)
) : isCollectionPicker ? (
  renderCollectionPickerField(field.key, field.label)
) : isProductPicker ? (
  renderProductPickerField(field.key, field.label)
) : isTags ? (
                  <div className="min-h-11 rounded-xl border border-gray-300 bg-white px-2 py-1.5 shadow-sm transition focus-within:border-black focus-within:ring-4 focus-within:ring-black/10">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex max-w-full items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-sm text-gray-800"
                        >
                          <ImageIcon
                            size={13}
                            className="shrink-0 text-gray-500"
                          />

                          <span className="max-w-[220px] truncate">{tag}</span>

                          <button
                            type="button"
                            onClick={() => removeTag(field.key, tag)}
                            className="rounded p-0.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-800"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}

                      <input
                        value={tagInput[field.key] || ''}
                        onChange={(e) =>
                          setTagInput((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => handleTagKeyDown(e, field.key)}
                        onBlur={() =>
                          addTag(field.key, tagInput[field.key] || '')
                        }
                        className="h-8 min-w-[160px] flex-1 bg-transparent px-1 text-sm outline-none"
                      />

                      {(tagInput[field.key] || '').trim() && (
                        <button
                          type="button"
                          onClick={() =>
                            addTag(field.key, tagInput[field.key] || '')
                          }
                          className="inline-flex h-7 items-center gap-1 rounded-lg bg-black px-2 text-xs font-semibold text-white"
                        >
                          <Plus size={12} />
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <input
                    value={String(values[field.key] || '')}
                    onChange={(e) => updateText(field.key, e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-black focus:ring-4 focus:ring-black/10"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
    </>
  );
}