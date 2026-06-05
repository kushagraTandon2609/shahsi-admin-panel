'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, GripVertical, Search, X } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';import { CategoryImageUploader } from '@/components/admin/CategoryImageUploader';
import { Button } from '@/components/admin/Button';
import { Card } from '@/components/admin/Card';
import { ApiError } from '@/components/admin/ApiError';
import {
  getApiErrorMessage,
  unwrapList,
  unwrapObject,
} from '@/lib/admin-response';
import { adminCategoriesService } from '@/services/admin-categories.service';

type CategoryMetafields = {
  subHeading: string;
  topMenu: string;
  fromBlog: string;
  primaryCollection: string;
  secondaryCollection: string;
};

type CategoryEditPageProps = {
  mode: 'create' | 'edit';
  categoryId?: string;
};

type MoveTarget = 'top' | 'bottom' | 'position';

const PRODUCTS_PER_PAGE = 60;
const BROWSER_LIMIT = 20;
const SORT_OPTIONS = [
  { label: 'Most relevant', sortBy: 'relevance', sortDirection: 'desc' },
  { label: 'Best selling', sortBy: 'best_selling', sortDirection: 'desc' },
  { label: 'Product title A-Z', sortBy: 'title', sortDirection: 'asc' },
  { label: 'Product title Z-A', sortBy: 'title', sortDirection: 'desc' },
  { label: 'Highest price', sortBy: 'price', sortDirection: 'desc' },
  { label: 'Lowest price', sortBy: 'price', sortDirection: 'asc' },
  { label: 'Newest', sortBy: 'createdAt', sortDirection: 'desc' },
  { label: 'Oldest', sortBy: 'createdAt', sortDirection: 'asc' },
  { label: 'Manually', sortBy: 'manual', sortDirection: 'asc' },
];

function stripHtml(value: string) {
  if (!value) return '';

  return value
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function makeDescriptionPreview(value: string, maxLength = 180) {
  const clean = stripHtml(value);

  if (clean.length <= maxLength) return clean;

  return `${clean.slice(0, maxLength).trim()}...`;
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function moveArrayItem<T>(list: T[], fromIndex: number, toIndex: number) {
  const copy = [...list];
  const [removed] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, removed);
  return copy;
}

function cleanText(value: any) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function getProductId(product: any) {
  const p = product?.product || product?.catalogProduct || product;

  return String(
    p?.id ||
      p?._id ||
      p?.productId ||
      p?.catalogProductId ||
      p?.catalogId ||
      product?.id ||
      product?._id ||
      product?.productId ||
      product?.catalogProductId ||
      '',
  );
}

function getProductSku(product: any) {
  const p = product?.product || product?.catalogProduct || product;

  return String(
    p?.sku ||
      p?.SKU ||
      p?.productSku ||
      p?.variantSku ||
      product?.sku ||
      product?.SKU ||
      product?.productSku ||
      '',
  ).trim();
}

function getProductTitle(product: any) {
  const p = product?.product || product?.catalogProduct || product;

  return (
    p?.title ||
    p?.name ||
    p?.productName ||
    p?.displayName ||
    product?.title ||
    product?.name ||
    product?.productName ||
    'Untitled product'
  );
}

function getProductImage(product: any) {
  const p = product?.product || product?.catalogProduct || product;

  const images = Array.isArray(p?.images)
    ? p.images
    : Array.isArray(p?.productImages)
      ? p.productImages
      : Array.isArray(p?.media)
        ? p.media
        : Array.isArray(p?.assets)
          ? p.assets
          : [];

  const primaryImage =
    images.find((item: any) => item?.isPrimary || item?.is_primary) ||
    images[0];

  const image =
    p?.imageUrl ||
    p?.image ||
    p?.thumbnail ||
    p?.thumbnailUrl ||
    p?.primaryImage ||
    p?.primaryImageUrl ||
    p?.mediaUrl ||
    p?.fileUrl ||
    p?.cloudinaryUrl ||
    primaryImage?.secureUrl ||
    primaryImage?.secure_url ||
    primaryImage?.url ||
    primaryImage?.imageUrl ||
    primaryImage?.src ||
    primaryImage?.mediaUrl ||
    primaryImage?.fileUrl ||
    primaryImage?.cloudinaryUrl ||
    '';

  if (typeof image === 'string') return image;

  return (
    image?.secureUrl ||
    image?.secure_url ||
    image?.url ||
    image?.imageUrl ||
    image?.src ||
    image?.mediaUrl ||
    image?.fileUrl ||
    image?.cloudinaryUrl ||
    ''
  );
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

function getProductPrice(product: any) {
  const value =
    product?.price ||
    product?.salePrice ||
    product?.regularPrice ||
    product?.pricing?.price ||
    product?.product?.price ||
    '';

  return value ? String(value) : '';
}

function getProductVendor(product: any) {
  return (
    product?.vendor ||
    product?.vendorName ||
    product?.brand ||
    product?.brandName ||
    product?.product?.vendor ||
    ''
  );
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

function getCategoryChildren(category: any) {
  const children =
    category?.children ||
    category?.subcategories ||
    category?.items ||
    category?.nodes ||
    [];

  return Array.isArray(children) ? children : [];
}

function flattenCategories(categories: any[]) {
  const list: any[] = [];

  function walk(items: any[], level = 0) {
    items.forEach((item, index) => {
      const id = getCategoryId(item, index);
      const children = getCategoryChildren(item);

      list.push({
        ...item,
        __id: id,
        __level: level,
      });

      if (children.length > 0) {
        walk(children, level + 1);
      }
    });
  }

  walk(categories);
  return list;
}

function findCategoryById(categories: any[], id: string): any | null {
  for (let index = 0; index < categories.length; index += 1) {
    const item = categories[index];
    const itemId = getCategoryId(item, index);

    if (itemId === id || getCategorySlug(item) === id) return item;

    const found = findCategoryById(getCategoryChildren(item), id);
    if (found) return found;
  }

  return null;
}

function getCategoryImage(category: any) {
  const image =
    category?.imageUrl ||
    category?.image ||
    category?.thumbnail ||
    category?.coverImage ||
    category?.mediaUrl ||
    category?.secureUrl ||
    category?.categoryImage ||
    category?.collectionImage ||
    '';

  if (typeof image === 'string') return image;

  return (
    image?.url ||
    image?.imageUrl ||
    image?.secureUrl ||
    image?.secure_url ||
    image?.src ||
    ''
  );
}

function unwrapCategoryProducts(response: any): any[] {
  const root = response?.data || response;

  const candidates = [
    root?.products,
    root?.data?.products,
    root?.items,
    root?.rows,
    root?.data?.items,
    root?.data?.rows,
    Array.isArray(root?.data) ? root.data : null,
    Array.isArray(root) ? root : null,
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) return item;
  }

  return [];
}

function unwrapCategoryProductMeta(response: any) {
  const root = response?.data || response || {};
  const meta = root?.meta || root?.data?.meta || root?.data || root;

  return {
    count: Number(meta?.count || meta?.total || 0),
    total: Number(meta?.total || meta?.count || 0),
    page: Number(meta?.page || 1),
    limit: Number(meta?.limit || PRODUCTS_PER_PAGE),
    totalPages: Number(meta?.totalPages || 1),
  };
}

function unwrapProductSearchProducts(response: any): any[] {
  const root = response?.data || response;

  const products =
    root?.products ||
    root?.data?.products ||
    root?.items ||
    root?.rows ||
    root?.data ||
    [];

  return Array.isArray(products) ? products : [];
}

function unwrapProductSearchMeta(response: any) {
  const root = response?.data || response || {};
  const meta = root?.meta || root?.data?.meta || {};

  return {
    page: Number(meta?.page || 1),
    limit: Number(meta?.limit || BROWSER_LIMIT),
    total: Number(meta?.total || 0),
    totalPages: Number(meta?.totalPages || 1),
  };
}

export default function CategoryEditPage({
  mode,
  categoryId,
}: CategoryEditPageProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');

  const [sortOrder, setSortOrder] = useState('1');
  const [themeTemplate, setThemeTemplate] = useState('default');
  const [isActive, setIsActive] = useState(true);

  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [imageAltText, setImageAltText] = useState('');
const [productsSort, setProductsSort] = useState('manual|asc');
const [browserSort, setBrowserSort] = useState('createdAt|desc');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [checkedProductIds, setCheckedProductIds] = useState<string[]>([]);
  const [moveTarget, setMoveTarget] = useState<MoveTarget>('top');
  const [movePosition, setMovePosition] = useState('1');
  const [draggedProductId, setDraggedProductId] = useState('');
  const [productsPage, setProductsPage] = useState(1);

  const [productsLoading, setProductsLoading] = useState(false);
  const [productsMeta, setProductsMeta] = useState({
    count: 0,
    total: 0,
    page: 1,
    limit: PRODUCTS_PER_PAGE,
    totalPages: 1,
  });

  const [showProductBrowser, setShowProductBrowser] = useState(false);
  const [productBrowserSearch, setProductBrowserSearch] = useState('');
  const [productBrowserProducts, setProductBrowserProducts] = useState<any[]>(
    [],
  );
  const [productBrowserLoading, setProductBrowserLoading] = useState(false);
  const [productBrowserError, setProductBrowserError] = useState('');
  const [productBrowserPage, setProductBrowserPage] = useState(1);
  const [productBrowserMeta, setProductBrowserMeta] = useState({
    page: 1,
    limit: BROWSER_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [metafields, setMetafields] = useState<CategoryMetafields>({
    subHeading: '',
    topMenu: '',
    fromBlog: '',
    primaryCollection: '',
    secondaryCollection: '',
  });

  const [seoForm, setSeoForm] = useState({
    pageTitle: '',
    metaDescription: '',
    urlHandle: '',
  });

  const [faqs, setFaqs] = useState([
    {
      question: '',
      answer: '',
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return selectedProducts;

    const q = cleanText(productSearch);

    return selectedProducts.filter((product: any) => {
      const title = cleanText(getProductTitle(product));
      const sku = cleanText(getProductSku(product));
      const id = cleanText(getProductId(product));
      return title.includes(q) || sku.includes(q) || id.includes(q);
    });
  }, [selectedProducts, productSearch]);

  const totalProductPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );

  const paginatedProducts = filteredProducts.slice(
    (productsPage - 1) * PRODUCTS_PER_PAGE,
    productsPage * PRODUCTS_PER_PAGE,
  );

  const productStartNumber =
    filteredProducts.length === 0
      ? 0
      : (productsPage - 1) * PRODUCTS_PER_PAGE + 1;

  const productEndNumber = Math.min(
    productsPage * PRODUCTS_PER_PAGE,
    filteredProducts.length,
  );

  function updateMetafield(key: keyof CategoryMetafields, value: string) {
    setMetafields((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function loadCategoryProducts(category: any) {
    const categorySlug = getCategorySlug(category);

    if (!categorySlug) {
      setSelectedProducts([]);
      return;
    }

    setProductsLoading(true);

    try {
      const [sortBy, sortDirection] = productsSort.split('|');

const productsRes = await adminCategoriesService.getCategoryProducts(
  categorySlug,
  {
    page: 1,
    limit: PRODUCTS_PER_PAGE,
    sortBy: sortBy || 'manual',
    sortDirection: (sortDirection as 'asc' | 'desc') || 'asc',
  },
);

      const productsList = unwrapCategoryProducts(productsRes);
      const meta = unwrapCategoryProductMeta(productsRes);

      setSelectedProducts(productsList);
      setProductsMeta(meta);
      setCheckedProductIds([]);
      setProductsPage(1);
    } catch (err: any) {
      setSelectedProducts([]);
      setProductsMeta({
        count: 0,
        total: 0,
        page: 1,
        limit: PRODUCTS_PER_PAGE,
        totalPages: 1,
      });
      setError(getApiErrorMessage(err));
    } finally {
      setProductsLoading(false);
    }
  }

  async function loadCategories() {
    setLoading(true);
    setError('');

    try {
      const res = await adminCategoriesService.tree({
        includeInactive: true,
        showProductCount: true,
        showEmpty: true,
        maxDepth: 20,
      });

      const data = unwrapObject(res);
      const list = unwrapList(res);

      const tree =
        list.length > 0
          ? list
          : data?.tree ||
            data?.categories ||
            data?.items ||
            data?.data ||
            [];

      const nextTree = Array.isArray(tree) ? tree : [];
      setCategories(nextTree);

      if (mode === 'edit' && categoryId) {
        const found = findCategoryById(nextTree, decodeURIComponent(categoryId));

        if (!found) {
          setError('Category not found in tree.');
          return;
        }

        const foundSlug = getCategorySlug(found);

        setCurrentCategory(found);
        setTitle(getCategoryName(found));
        setSlug(foundSlug);
        setDescription(
          found?.description ||
            found?.shortDescription ||
            found?.metaDescription ||
            '',
        );
        setParentId(
          found?.parentSlug ||
            found?.parent?.slug ||
            found?.parentId ||
            found?.parent?.id ||
            '',
        );
        setIsActive(
          !(
            found?.isActive === false ||
            found?.active === false ||
            found?.isDisplayed === false ||
            found?.displayed === false
          ),
        );
        setSortOrder(String(found?.sortOrder || found?.position || 1));
        setThemeTemplate(found?.themeTemplate || found?.template || 'default');

        setImagePreview(getCategoryImage(found));
        setImageName(found?.imageName || found?.image_name || '');
        setImageAltText(
          found?.imageAltText || found?.imageAlt || found?.altText || '',
        );

        setSeoForm({
          pageTitle: found?.seoTitle || found?.metaTitle || '',
          metaDescription: found?.seoDescription || found?.metaDescription || '',
          urlHandle: found?.seoSlug || found?.urlHandle || foundSlug || '',
        });

        setMetafields({
          subHeading: found?.metafields?.subHeading || '',
          topMenu: found?.metafields?.topMenu || '',
          fromBlog: found?.metafields?.fromBlog || '',
          primaryCollection: found?.metafields?.primaryCollection || '',
          secondaryCollection: found?.metafields?.secondaryCollection || '',
        });

        const savedFaqs =
          found?.faqs ||
          found?.faqSection?.items ||
          found?.faqItems ||
          [];

        setFaqs(
          Array.isArray(savedFaqs) && savedFaqs.length > 0
            ? savedFaqs.map((faq: any) => ({
                question: faq.question || '',
                answer: faq.answer || '',
              }))
            : [
                {
                  question: '',
                  answer: '',
                },
              ],
        );

        await loadCategoryProducts(found);
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadProductBrowser(page = 1, query = productBrowserSearch) {
    setProductBrowserLoading(true);
    setProductBrowserError('');

    try {
      const [sortBy, sortDirection] = browserSort.split('|');

const res = await adminCategoriesService.searchCatalogProducts({
  page,
  limit: BROWSER_LIMIT,
  q: query,
  searchBy: 'all',
  sortBy: sortBy || 'createdAt',
  sortDirection: (sortDirection as 'asc' | 'desc') || 'desc',
});

      setProductBrowserProducts(unwrapProductSearchProducts(res));
      setProductBrowserMeta(unwrapProductSearchMeta(res));
      setProductBrowserPage(page);
    } catch (err: any) {
      setProductBrowserProducts([]);
      setProductBrowserError(getApiErrorMessage(err));
    } finally {
      setProductBrowserLoading(false);
    }
  }

  async function openProductBrowser() {
    setShowProductBrowser(true);
    await loadProductBrowser(1, productBrowserSearch);
  }

  function addProductFromBrowser(product: any) {
    const productId = getProductId(product);

    if (!productId) return;

    setSelectedProducts((prev) => {
      const exists = prev.some((item) => getProductId(item) === productId);
      if (exists) return prev;
      return [...prev, product];
    });
  }

  function removeProductLocally(productId: string) {
    setSelectedProducts((prev) =>
      prev.filter((product) => getProductId(product) !== productId),
    );

    setCheckedProductIds((prev) => prev.filter((id) => id !== productId));
  }

  async function removeAssignedProduct(product: any) {
    const categorySlug = getCategorySlug(currentCategory) || makeSlug(slug || title);
    const productId = getProductId(product);
    const productTitle = getProductTitle(product);

    if (!categorySlug) {
      setError('Category slug missing. Product cannot be removed.');
      return;
    }

    if (!productId) {
      setError('Product ID missing. Product cannot be removed.');
      return;
    }

    const confirmed = window.confirm(
      `Remove "${productTitle}" from this category?`,
    );

    if (!confirmed) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await adminCategoriesService.removeCategoryProduct(categorySlug, productId);
      removeProductLocally(productId);
      setSuccess('Product removed from category.');
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveCategoryProductsOrder() {
    const categorySlug = getCategorySlug(currentCategory) || makeSlug(slug || title);

    if (!categorySlug) {
      setError('Category slug missing.');
      return;
    }

    const uniqueProductIds = Array.from(
      new Set(
        selectedProducts
          .map((product: any) => getProductId(product))
          .filter(Boolean),
      ),
    );

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await adminCategoriesService.updateCategoryProducts(categorySlug, {
        productIds: uniqueProductIds,
        sortOrder: uniqueProductIds.map((productId, index) => ({
          productId,
          position: index,
        })),
      });

      setSuccess('Product order saved successfully.');

      if (currentCategory) {
        await loadCategoryProducts(currentCategory);
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function toggleCheckedProduct(productId: string) {
    if (!productId) return;

    setCheckedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }

  function clearCheckedProducts() {
    setCheckedProductIds([]);
  }

  function moveCheckedProducts() {
    if (checkedProductIds.length === 0) return;

    setSelectedProducts((prev) => {
      const checkedItems = prev.filter((product) =>
        checkedProductIds.includes(getProductId(product)),
      );

      const remainingItems = prev.filter(
        (product) => !checkedProductIds.includes(getProductId(product)),
      );

      if (moveTarget === 'bottom') {
        return [...remainingItems, ...checkedItems];
      }

      if (moveTarget === 'position') {
        const targetIndex = Math.max(
          0,
          Math.min(Number(movePosition || 1) - 1, remainingItems.length),
        );

        return [
          ...remainingItems.slice(0, targetIndex),
          ...checkedItems,
          ...remainingItems.slice(targetIndex),
        ];
      }

      return [...checkedItems, ...remainingItems];
    });

    setCheckedProductIds([]);
  }

  function handleProductDragStart(productId: string) {
    if (!productId) return;
    setDraggedProductId(productId);
  }

  function handleProductDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleProductDrop(targetProductId: string) {
    if (!draggedProductId || draggedProductId === targetProductId) return;

    setSelectedProducts((prev) => {
      const fromIndex = prev.findIndex(
        (product) => getProductId(product) === draggedProductId,
      );

      const toIndex = prev.findIndex(
        (product) => getProductId(product) === targetProductId,
      );

      if (fromIndex < 0 || toIndex < 0) return prev;

      return moveArrayItem(prev, fromIndex, toIndex);
    });

    setDraggedProductId('');
  }
function handleFaqDragStart(index: number) {
  setDraggedProductId(`faq-${index}`);
}

function handleFaqDragOver(e: React.DragEvent<HTMLDivElement>) {
  e.preventDefault();
}

function handleFaqDrop(targetIndex: number) {
  if (!draggedProductId.startsWith('faq-')) return;

  const fromIndex = Number(draggedProductId.replace('faq-', ''));

  if (Number.isNaN(fromIndex) || fromIndex === targetIndex) return;

  setFaqs((prev) => moveArrayItem(prev, fromIndex, targetIndex));
  setDraggedProductId('');
}
  function updateFaq(index: number, field: 'question' | 'answer', value: string) {
    setFaqs((prev) =>
      prev.map((faq, faqIndex) =>
        faqIndex === index
          ? {
              ...faq,
              [field]: value,
            }
          : faq,
      ),
    );
  }

  function addFaq() {
    setFaqs((prev) => [
      ...prev,
      {
        question: '',
        answer: '',
      },
    ]);
  }

  function removeFaq(index: number) {
    setFaqs((prev) => {
      const next = prev.filter((_, faqIndex) => faqIndex !== index);

      return next.length > 0
        ? next
        : [
            {
              question: '',
              answer: '',
            },
          ];
    });
  }
async function toggleCategoryDisplayed() {
  const nextIsActive = !isActive;
  const categorySlug = getCategorySlug(currentCategory) || makeSlug(slug || title);

  if (!categorySlug || !title.trim()) {
    setIsActive(nextIsActive);
    return;
  }

  const previousIsActive = isActive;

  setIsActive(nextIsActive);
  setSaving(true);
  setError('');
  setSuccess('');

  try {
    await adminCategoriesService.updateCategory({
      name: title.trim(),
      slug: categorySlug,
      parentSlug: parentId || undefined,
      isActive: nextIsActive,
    });

    setCurrentCategory((prev: any) => ({
      ...(prev || {}),
      isActive: nextIsActive,
    }));

    setSuccess(nextIsActive ? 'isActive saved as true.' : 'isActive saved as false.');
  } catch (err: any) {
    setIsActive(previousIsActive);
    setError(getApiErrorMessage(err));
  } finally {
    setSaving(false);
  }
}

  async function saveCategory() {
    if (!title.trim()) {
      setError('Category title is required.');
      return;
    }

    const cleanTitle = title.trim();
    const cleanSlug = makeSlug(slug || title);
    const parentCategory = parentId ? findCategoryById(categories, parentId) : null;

    

    const safeImageUrl =
      imagePreview && !imagePreview.startsWith('blob:')
        ? imagePreview
        : getCategoryImage(currentCategory);

    const commonPayload = {
      name: cleanTitle,
      slug: cleanSlug,
      description,
      imageUrl: safeImageUrl,
      imageName: imageName.trim(),
      imageAltText: imageAltText.trim(),
      isActive,
      sortOrder: Number(sortOrder || 1),
      themeTemplate,
      seoTitle: seoForm.pageTitle.trim(),
      seoDescription: seoForm.metaDescription.trim(),
      seoSlug: makeSlug(seoForm.urlHandle || cleanSlug),
      metafields: {
        subHeading: metafields.subHeading.trim(),
        topMenu: metafields.topMenu.trim(),
        fromBlog: metafields.fromBlog.trim(),
        primaryCollection: metafields.primaryCollection.trim(),
        secondaryCollection: metafields.secondaryCollection.trim(),
      },
      faqs: faqs
        .filter((item) => item.question.trim() || item.answer.trim())
        .map((item) => ({
          question: item.question.trim(),
          answer: item.answer.trim(),
        })),
    };

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const selectedParentSlug = parentCategory
        ? getCategorySlug(parentCategory)
        : '';

      await adminCategoriesService.updateCategory({
        ...commonPayload,
        parentSlug: selectedParentSlug || undefined,
        parentId: undefined,
        collectionSlug: undefined,
      });

      if (cleanSlug && imageFile) {
  if (!(imageFile instanceof File)) {
    throw new Error('Please select a valid image file before uploading.');
  }

  const imageRes = await adminCategoriesService.uploadCategoryImage(cleanSlug, {
    file: imageFile,
    name: imageName.trim() || imageFile.name,
    altText: imageAltText.trim(),
  });

  const imageData = imageRes?.data?.image || imageRes?.data || imageRes;

  const uploadedImageUrl =
    imageData?.imageUrl ||
    imageData?.url ||
    imageData?.secureUrl ||
    imageData?.secure_url ||
    imageData?.cloudinaryUrl ||
    '';

  if (uploadedImageUrl) {
    setImagePreview(uploadedImageUrl);
  }

  setImageFile(null);
}

      if (mode === 'edit') {
        await saveCategoryProductsOrder();
      }

      setSuccess(
        mode === 'create'
          ? 'Category created successfully.'
          : 'Category updated successfully.',
      );

      await loadCategories();

      if (mode === 'create') {
        router.push('/admin/category-tree');
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/category-tree')}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <p className="text-sm text-gray-500">Catalog › Categories</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950">
            {mode === 'create' ? 'Add new category' : `Edit ${title || 'category'}`}
          </h1>
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

      {loading ? (
        <p className="text-sm text-gray-500">Loading category...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Card>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-800">
                  Title
                </span>

                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);

                    if (mode === 'create') {
                      const nextSlug = makeSlug(e.target.value);
                      setSlug(nextSlug);
                      setSeoForm((prev) => ({
                        ...prev,
                        urlHandle: nextSlug,
                      }));
                    }
                  }}
                  className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-black"
                />
              </label>

              <div className="mt-5">
                <span className="mb-1 block text-sm font-semibold text-gray-800">
                  Description
                </span>

                <RichTextEditor
  label=""
  value={description}
  onChange={setDescription}
  minHeight={300}
/>
              </div>
            </Card>

            <Card className="p-0">
              <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
                <div>
                  <h2 className="font-semibold text-gray-950">Products</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Browse products, drag/drop manual order, then save order.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={openProductBrowser}
                  disabled={mode === 'create'}
                >
                  Browse products
                </Button>
              </div>

              <div className="p-5">
                {mode === 'create' && (
                  <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                    Pehle category save karo, phir products assign karna.
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setProductsPage(1);
                      }}
                      placeholder="Search included products"
                      className="h-11 w-full rounded-xl border border-gray-300 pl-10 pr-3 text-sm outline-none focus:border-black"
                    />
                  </div>
<select
  value={productsSort}
  onChange={async (e) => {
    setProductsSort(e.target.value);

    const categorySlug = getCategorySlug(currentCategory);
    if (!categorySlug) return;

    const [sortBy, sortDirection] = e.target.value.split('|');

    setProductsLoading(true);

    try {
      const productsRes = await adminCategoriesService.getCategoryProducts(
        categorySlug,
        {
          page: 1,
          limit: PRODUCTS_PER_PAGE,
          sortBy,
          sortDirection: sortDirection as 'asc' | 'desc',
        },
      );

      setSelectedProducts(unwrapCategoryProducts(productsRes));
      setProductsMeta(unwrapCategoryProductMeta(productsRes));
      setProductsPage(1);
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setProductsLoading(false);
    }
  }}
  className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-black"
>
  {SORT_OPTIONS.map((option) => (
    <option
      key={`${option.sortBy}|${option.sortDirection}`}
      value={`${option.sortBy}|${option.sortDirection}`}
    >
      Sort: {option.label}
    </option>
  ))}
</select>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={saveCategoryProductsOrder}
                    disabled={saving || mode === 'create'}
                  >
                    Save order
                  </Button>
                </div>

                <div className="mt-4 rounded-xl border">
                  {checkedProductIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 border-b bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-gray-900">
                        Move {checkedProductIds.length} products to:
                      </p>

                      <select
                        value={moveTarget}
                        onChange={(e) =>
                          setMoveTarget(e.target.value as MoveTarget)
                        }
                        className="h-10 min-w-[180px] rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-black"
                      >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="position">Position</option>
                      </select>

                      {moveTarget === 'position' && (
                        <input
                          type="number"
                          min="1"
                          value={movePosition}
                          onChange={(e) => setMovePosition(e.target.value)}
                          className="h-10 w-24 rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-black"
                          placeholder="1"
                        />
                      )}

                      <button
                        type="button"
                        onClick={clearCheckedProducts}
                        className="ml-auto text-sm font-semibold text-blue-700 hover:underline"
                      >
                        Deselect all
                      </button>

                      <button
                        type="button"
                        onClick={moveCheckedProducts}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
                      >
                        Move
                      </button>
                    </div>
                  )}

                  <div className="divide-y">
                    {productsLoading ? (
                      <p className="p-5 text-sm text-gray-500">
                        Loading included products...
                      </p>
                    ) : filteredProducts.length === 0 ? (
                      <p className="p-5 text-sm text-gray-500">
                        No products included in this category yet.
                      </p>
                    ) : (
                      paginatedProducts.map((product: any, index: number) => {
                        const productId = getProductId(product);
                        const productNumber =
                          (productsPage - 1) * PRODUCTS_PER_PAGE + index + 1;
                        const productImage = getProductImage(product);
                        const productTitle = getProductTitle(product);
                        const productStatus = getProductStatus(product);
                        const productSku = getProductSku(product);
                        const checked = checkedProductIds.includes(productId);

                        return (
                          <div
                            key={productId || index}
                            draggable
                            onDragStart={() => handleProductDragStart(productId)}
                            onDragOver={handleProductDragOver}
                            onDrop={() => handleProductDrop(productId)}
                            className="flex cursor-move items-center gap-3 p-3 hover:bg-gray-50"
                          >
                            <GripVertical className="h-4 w-4 text-gray-400" />

                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCheckedProduct(productId)}
                              className="h-4 w-4"
                            />

                            <span className="w-8 text-sm text-gray-500">
                              {productNumber}.
                            </span>

                            {productImage ? (
                              <img
                                src={productImage}
                                alt={productTitle}
                                className="h-14 w-14 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-xs font-semibold text-gray-400">
                                {productTitle.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {productTitle}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-gray-500">
                                {productSku ? `SKU: ${productSku}` : productId}
                              </p>

                              <p className="mt-0.5 text-xs font-semibold text-green-700">
                                {productStatus || 'ACTIVE'}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeAssignedProduct(product)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {!productsLoading && filteredProducts.length > 0 && (
                    <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {productStartNumber}-{productEndNumber} of{' '}
                        {productsMeta.total || selectedProducts.length} included products
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setProductsPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={productsPage <= 1}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40"
                        >
                          ‹
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setProductsPage((prev) =>
                              Math.min(totalProductPages, prev + 1),
                            )
                          }
                          disabled={productsPage >= totalProductPages}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-gray-900">
                    Product Metafields
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Sub Heading
                    </label>
                    <input
                      type="text"
                      value={metafields.subHeading}
                      onChange={(e) =>
                        updateMetafield('subHeading', e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Top Menu Label
                    </label>
                    <input
                      type="text"
                      value={metafields.topMenu}
                      onChange={(e) =>
                        updateMetafield('topMenu', e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      From Blog
                    </label>
                    <input
                      type="text"
                      value={metafields.fromBlog}
                      onChange={(e) =>
                        updateMetafield('fromBlog', e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Primary Collection
                    </label>
                    <input
                      type="text"
                      value={metafields.primaryCollection}
                      onChange={(e) =>
                        updateMetafield('primaryCollection', e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Secondary Collection
                    </label>
                    <input
                      type="text"
                      value={metafields.secondaryCollection}
                      onChange={(e) =>
                        updateMetafield('secondaryCollection', e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-gray-950">
                Search engine listing
              </h2>

              <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-700">Shahsi</p>

                <p className="mt-1 break-all text-sm text-gray-500">
                  https://shahsi.com/collections/{seoForm.urlHandle || ''}
                </p>

                <p className="mt-3 text-xl font-medium text-blue-700">
                  {seoForm.pageTitle || 'Page title preview'}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  {seoForm.metaDescription || 'Meta description preview'}
                </p>
              </div>

              <div className="mt-5 space-y-5">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-800">
                    Page title
                  </span>

                  <input
                    value={seoForm.pageTitle}
                    onChange={(e) =>
                      setSeoForm((prev) => ({
                        ...prev,
                        pageTitle: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
                    placeholder="SEO page title"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    {seoForm.pageTitle.length} of 70 characters used
                  </p>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-800">
                    Meta description
                  </span>

                  <textarea
                    value={seoForm.metaDescription}
                    onChange={(e) =>
                      setSeoForm((prev) => ({
                        ...prev,
                        metaDescription: e.target.value,
                      }))
                    }
                    className="min-h-[110px] w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    placeholder="SEO meta description"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    {seoForm.metaDescription.length} of 160 characters used
                  </p>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-800">
                    URL handle
                  </span>

                  <input
                    value={seoForm.urlHandle}
                    onChange={(e) =>
                      setSeoForm((prev) => ({
                        ...prev,
                        urlHandle: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
                    placeholder="seo-url-handle"
                  />

                  <p className="mt-1 break-all text-xs text-gray-500">
                    https://shahsi.com/collections/{seoForm.urlHandle || ''}
                  </p>
                </label>
              </div>
            </Card>

            <Card>
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="font-semibold text-gray-950">FAQs</h2>

                <Button type="button" variant="secondary" onClick={addFaq}>
                  Add FAQ
                </Button>
              </div>

              <div className="space-y-4">
  {faqs.map((faq, index) => (
    <div
      key={index}
      draggable
      onDragStart={() => handleFaqDragStart(index)}
      onDragOver={handleFaqDragOver}
      onDrop={() => handleFaqDrop(index)}
      className="space-y-3 rounded-xl border border-gray-200 p-4"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
        <GripVertical size={16} />
        Drag to reorder FAQ #{index + 1}
      </div>

      <input
        value={faq.question}
        onChange={(e) => updateFaq(index, 'question', e.target.value)}
        className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
        placeholder="Question"
      />

      <RichTextEditor
        label=""
        value={faq.answer}
        onChange={(value) => updateFaq(index, 'answer', value)}
        minHeight={180}
      />

      <button
        type="button"
        onClick={() => removeFaq(index)}
        className="text-sm font-semibold text-red-600"
      >
        Remove FAQ
      </button>
    </div>
  ))}
</div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-950">
                      Displayed
                    </p>
                    <p className="text-xs text-gray-500">
                      Category will be displayed in the store front.
                    </p>
                  </div>

                  <button
                    type="button"
onClick={toggleCategoryDisplayed}                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isActive ? 'Displayed' : 'Hidden'}
                  </button>
                </label>
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-gray-950">Image</h2>

              <div className="mt-4">
                <CategoryImageUploader
                  imageUrl={imagePreview}
                  imageFile={imageFile}
                  imageName={imageName}
                  imageAltText={imageAltText}
                  onImageChange={({ file, url, name, altText }) => {
  const nextFile = file instanceof File ? file : null;

  setImageFile(nextFile);
  setImagePreview(url || '');
  setImageName(name || nextFile?.name || '');
  setImageAltText(altText || '');
}}
                />
              </div>
            </Card>

            <Card>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-800">
                  Parent category
                </span>

                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-black"
                >
                  <option value="">No parent / Root category</option>

                  {flatCategories
                    .filter((item) => getCategorySlug(item) !== slug)
                    .map((item) => (
                      <option key={item.__id} value={item.__id}>
                        {'— '.repeat(item.__level || 0)}
                        {getCategoryName(item)}
                      </option>
                    ))}
                </select>
              </label>
            </Card>

            <Card>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-800">
                  Theme template
                </span>

                <select
                  value={themeTemplate}
                  onChange={(e) => setThemeTemplate(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-black"
                >
                  <option value="default">default</option>
                  <option value="collection">collection</option>
                  <option value="editorial">editorial</option>
                  <option value="landing">landing</option>
                </select>
              </label>
            </Card>

            <Button
              type="button"
              onClick={saveCategory}
              disabled={saving || !title.trim()}
              className="w-full"
            >
              {saving
                ? 'Saving...'
                : mode === 'create'
                  ? 'Save category'
                  : 'Save changes'}
            </Button>
          </div>
        </div>
      )}

      {showProductBrowser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-950">
                  Browse products
                </h2>
                <p className="text-sm text-gray-500">
                  Search catalog products and add them to this category.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowProductBrowser(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            <div className="border-b p-5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    value={productBrowserSearch}
                    onChange={(e) => setProductBrowserSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        loadProductBrowser(1, productBrowserSearch);
                      }
                    }}
                    placeholder="Search by title, SKU, product ID, barcode"
                    className="h-11 w-full rounded-xl border border-gray-300 pl-10 pr-3 text-sm outline-none focus:border-black"
                  />
                </div>
<select
  value={browserSort}
  onChange={(e) => {
    setBrowserSort(e.target.value);

    const [sortBy, sortDirection] = e.target.value.split('|');

    setProductBrowserLoading(true);
    setProductBrowserError('');

    adminCategoriesService
      .searchCatalogProducts({
        page: 1,
        limit: BROWSER_LIMIT,
        q: productBrowserSearch,
        searchBy: 'all',
        sortBy,
        sortDirection: sortDirection as 'asc' | 'desc',
      })
      .then((res) => {
        setProductBrowserProducts(unwrapProductSearchProducts(res));
        setProductBrowserMeta(unwrapProductSearchMeta(res));
        setProductBrowserPage(1);
      })
      .catch((err: any) => {
        setProductBrowserProducts([]);
        setProductBrowserError(getApiErrorMessage(err));
      })
      .finally(() => {
        setProductBrowserLoading(false);
      });
  }}
  className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-black"
>
  {SORT_OPTIONS.map((option) => (
    <option
      key={`${option.sortBy}|${option.sortDirection}`}
      value={`${option.sortBy}|${option.sortDirection}`}
    >
      Sort: {option.label}
    </option>
  ))}
</select>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => loadProductBrowser(1, productBrowserSearch)}
                >
                  Search
                </Button>
              </div>

              {productBrowserError && (
                <div className="mt-3">
                  <ApiError message={productBrowserError} />
                </div>
              )}
            </div>

            <div className="max-h-[55vh] overflow-y-auto divide-y">
              {productBrowserLoading ? (
                <p className="p-5 text-sm text-gray-500">Loading products...</p>
              ) : productBrowserProducts.length === 0 ? (
                <p className="p-5 text-sm text-gray-500">
                  No products found.
                </p>
              ) : (
                productBrowserProducts.map((product, index) => {
                  const productId = getProductId(product);
                  const productTitle = getProductTitle(product);
                  const productImage = getProductImage(product);
                  const productSku = getProductSku(product);
                  const vendor = getProductVendor(product);
                  const price = getProductPrice(product);
                  const alreadyAdded = selectedProducts.some(
                    (item) => getProductId(item) === productId,
                  );

                  return (
                    <div
                      key={productId || index}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50"
                    >
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={productTitle}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-xs font-semibold text-gray-400">
                          {productTitle.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {productTitle}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {productSku ? `SKU: ${productSku}` : productId}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {[vendor, price ? `₹${price}` : '']
                            .filter(Boolean)
                            .join(' • ')}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => addProductFromBrowser(product)}
                        disabled={alreadyAdded}
                      >
                        {alreadyAdded ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t bg-gray-50 px-5 py-4">
              <p className="text-sm text-gray-600">
                Page {productBrowserMeta.page} of {productBrowserMeta.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    loadProductBrowser(
                      Math.max(1, productBrowserPage - 1),
                      productBrowserSearch,
                    )
                  }
                  disabled={productBrowserPage <= 1 || productBrowserLoading}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() =>
                    loadProductBrowser(
                      Math.min(
                        productBrowserMeta.totalPages,
                        productBrowserPage + 1,
                      ),
                      productBrowserSearch,
                    )
                  }
                  disabled={
                    productBrowserPage >= productBrowserMeta.totalPages ||
                    productBrowserLoading
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-40"
                >
                  Next
                </button>

                <Button
                  type="button"
                  onClick={() => {
                    setShowProductBrowser(false);
                    setSuccess(
                      'Products added locally. Click Save order to persist.',
                    );
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}