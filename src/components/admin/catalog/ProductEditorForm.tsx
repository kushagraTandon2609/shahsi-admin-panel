"use client";

import React, { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '@/components/admin/ApiError';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/admin/Button';
import { Card } from '@/components/admin/Card';
import { Input } from '@/components/admin/Input';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ProductCategoryTreeSelector } from '@/components/admin/catalog/ProductCategoryTreeSelector';
import { VariantOptionsEditor } from '@/components/admin/catalog/VariantOptionsEditor';
import { ProductMetafieldsEditor } from '@/components/admin/catalog/ProductMetafieldsEditor';
import { adminCategoriesService } from '@/services/admin-categories.service';
import { adminCatalogService } from '@/services/admin-catalog.service';
import { getApiErrorMessage, unwrapList, unwrapObject } from '@/lib/admin-response';

type SelectedMedia = {
  file: File;
  previewUrl: string;
  name: string;
  altText: string;
};

type ProductEditorFormProps = {
  mode: 'create' | 'edit';
  productId?: string;
  initialProduct?: any;
  initialMedia?: any[];
  initialVariants?: any[];
  onReload?: () => Promise<void> | void;
  onCreated?: (product: any) => void;
};

const STOREFRONT_DOMAIN = 'https://shahsi.com';
const STOREFRONT_DISPLAY_DOMAIN = 'shahsi.com';
const PRODUCT_URL_PREFIX = 'product';

function stripHtml(value: string) {
  if (!value) return '';

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeSeoUrlHandle(value: string) {
  return sanitizeSeoUrlInput(value)
    .trim()
    .replace(/^-+|-+$/g, '');
}

function getCategoryIdFromItem(category: any, index?: number) {
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

function getCategoryNameFromItem(category: any) {
  return category?.name || category?.title || category?.label || 'Category';
}

function getCategoryChildrenFromItem(category: any) {
  const children =
    category?.children ||
    category?.subcategories ||
    category?.items ||
    category?.nodes ||
    [];

  return Array.isArray(children) ? children : [];
}

function findCategoryById(categories: any[], categoryId: string): any | null {
  for (let index = 0; index < categories.length; index += 1) {
    const category = categories[index];
    const id = getCategoryIdFromItem(category, index);

    if (id === categoryId) {
      return category;
    }

    const children = getCategoryChildrenFromItem(category);
    const found = findCategoryById(children, categoryId);

    if (found) return found;
  }

  return null;
}

function sanitizeSeoUrlInput(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?shahsi\.com\/?/i, '')
    .replace(/^https?:\/\/[^/]+\/?/i, '')
    .replace(/^product\/?/i, '')
    .replace(/^products\/?/i, '')
    .replace(/['"]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9 -]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function ProductEditorForm({
  mode,
  productId,
  initialProduct,
  initialMedia = [],
  initialVariants = [],
  onReload,
  onCreated,
}: ProductEditorFormProps) {
  const router = useRouter();


  const [product, setProduct] = useState<any>(initialProduct || null);
  const [media, setMedia] = useState<any[]>(initialMedia);
  const [variants, setVariants] = useState<any[]>(initialVariants);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

const [dragActive, setDragActive] = useState(false);
const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
const [selectedMediaDragIndex, setSelectedMediaDragIndex] = useState<number | null>(null);
const [mediaDragIndex, setMediaDragIndex] = useState<number | null>(null);

const [categoryTree, setCategoryTree] = useState<any[]>([]);
const [showSimilarProductPicker, setShowSimilarProductPicker] = useState(false);
const [similarProductSearch, setSimilarProductSearch] = useState('');
const [similarProductFilter, setSimilarProductFilter] = useState<
  'all' | 'category' | 'type' | 'tag' | 'vendor'
>('all');

const [similarFilterValue, setSimilarFilterValue] = useState('');
const [allCatalogProductsForFilters, setAllCatalogProductsForFilters] = useState<any[]>([]);
const [similarPickerStatus, setSimilarPickerStatus] = useState<
  'all' | 'active' | 'draft' | 'unlisted'
>('all');
const [similarPickerProducts, setSimilarPickerProducts] = useState<any[]>([]);
const [similarPickerLoading, setSimilarPickerLoading] = useState(false);
const [selectedSimilarProductIds, setSelectedSimilarProductIds] = useState<string[]>([]);
const [activeProductPickerField, setActiveProductPickerField] = useState<string>('');

const [selectedMetafieldProducts, setSelectedMetafieldProducts] = useState<
  Record<ProductPickerMetafield, any[]>
>({
  similarStyleProduct: [],
  similarColorProducts: [],
  matchWithAccessories: [],
  completeTheLook: [],
  similarPrintProducts: [],
});

const filteredSimilarPickerProducts = similarPickerProducts;

const [similarProducts, setSimilarProducts] = useState<any[]>([]);

type ProductPickerMetafield =
 | 'similarStyleProduct'
 | 'similarColorProducts'
 | 'matchWithAccessories'
 | 'completeTheLook'
 | 'similarPrintProducts';
const PRODUCT_PICKER_FIELDS: ProductPickerMetafield[] = [
  'similarStyleProduct',
  'similarColorProducts',
  'matchWithAccessories',
  'completeTheLook',
  'similarPrintProducts',
];

const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() => {
  const categories =
    initialProduct?.categories ||
    initialProduct?.categoryIds ||
    initialProduct?.productCategories ||
    [];

  if (Array.isArray(categories)) {
    return categories
      .map((item: any) =>
        typeof item === 'string'
          ? item
          : item?.id || item?._id || item?.categoryId || '',
      )
      .filter(Boolean);
  }

  return [];
});

const [primaryCategoryId, setPrimaryCategoryId] = useState<string>(
  initialProduct?.primaryCategoryId ||
    initialProduct?.primaryCategory?.id ||
    initialProduct?.primaryCategory?._id ||
    initialProduct?.categoryId ||
    initialProduct?.category?.id ||
    '',
);

const [showMediaPicker, setShowMediaPicker] = useState(false);
const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);

  const initialTitle = initialProduct?.title || initialProduct?.name || '';
  const initialSlug =
    initialProduct?.slug ||
    initialProduct?.urlHandle ||
    makeSeoUrlHandle(initialTitle);

  const [basicForm, setBasicForm] = useState({
    title: initialTitle,
    name: initialProduct?.name || '',
    slug: initialSlug,
    sku: initialProduct?.sku || '',
    description: initialProduct?.description || '',
  });

  const [mediaEdits, setMediaEdits] = useState<
  Record<string, { name: string; altText: string }>
>({});

const [productMetafields, setProductMetafields] = useState<
  Record<string, string | string[]>
>({
  productFaqs: initialProduct?.metafields?.productFaqs || initialProduct?.productFaqs || '',
  careInstructions: initialProduct?.metafields?.careInstructions || initialProduct?.careInstructions || '',
  compositionOrigin: initialProduct?.metafields?.compositionOrigin || initialProduct?.compositionOrigin || '',
  customBadge: initialProduct?.metafields?.customBadge || initialProduct?.customBadge || '',
  seeMoreFrom: initialProduct?.metafields?.seeMoreFrom || initialProduct?.seeMoreFrom || '',
  primaryCollection: initialProduct?.metafields?.primaryCollection || initialProduct?.primaryCollection || '',
  secondaryCollection: initialProduct?.metafields?.secondaryCollection || initialProduct?.secondaryCollection || '',
  similarColorProducts: initialProduct?.metafields?.similarColorProducts || initialProduct?.similarColorProducts || [],
  matchWithAccessories: initialProduct?.metafields?.matchWithAccessories || initialProduct?.matchWithAccessories || [],
  completeTheLook: initialProduct?.metafields?.completeTheLook || initialProduct?.completeTheLook || [],
  advancedProductTitle: initialProduct?.metafields?.advancedProductTitle || initialProduct?.advancedProductTitle || '',
  similarStyleProduct: initialProduct?.metafields?.similarStyleProduct || initialProduct?.similarStyleProduct || [],
  style: initialProduct?.metafields?.style || initialProduct?.style || '',
  fabric: initialProduct?.metafields?.fabric || initialProduct?.fabric || '',
  print: initialProduct?.metafields?.print || initialProduct?.print || '',
  printSwatch: initialProduct?.metafields?.printSwatch || initialProduct?.printSwatch || '',
  similarPrintTitle: initialProduct?.metafields?.similarPrintTitle || initialProduct?.similarPrintTitle || '',
  similarPrintProducts: initialProduct?.metafields?.similarPrintProducts || initialProduct?.similarPrintProducts || [],
});

  const [pricingForm, setPricingForm] = useState({
    price: initialProduct?.price || '',
    compareAtPrice: initialProduct?.compareAtPrice || '',
    rentalPrice: initialProduct?.rentalPrice || '',
    depositAmount: initialProduct?.depositAmount || '',
  });

const [availabilityForm, setAvailabilityForm] = useState({
  stock: initialProduct?.stock || initialProduct?.quantity || '',
  status: normalizeStatus(initialProduct?.status || initialProduct?.publishStatus),
  isAvailable: String(initialProduct?.isAvailable ?? true),
});

const [organizationForm, setOrganizationForm] = useState({
  category: initialProduct?.category?.name || initialProduct?.categoryName || '',
  productType: initialProduct?.productType || '',
  vendor:
    initialProduct?.vendor ||
   
  
    '',
  collections: Array.isArray(initialProduct?.collections)
    ? initialProduct.collections.join(', ')
    : initialProduct?.collections || '',
  tags: Array.isArray(initialProduct?.tags)
    ? initialProduct.tags.join(', ')
    : initialProduct?.tags || '',
});

  const [seoForm, setSeoForm] = useState({
    metaTitle:
      initialProduct?.metaTitle ||
      initialProduct?.seoTitle ||
      initialProduct?.title ||
      initialProduct?.name ||
      '',
    metaDescription:
      initialProduct?.metaDescription ||
      initialProduct?.seoDescription ||
      stripHtml(initialProduct?.description || ''),
    urlHandle: initialSlug,
  });


  const [commerceForm, setCommerceForm] = useState({
    isShopEnabled: String(initialProduct?.isShopEnabled ?? true),
    isRentalEnabled: String(initialProduct?.isRentalEnabled ?? false),
    isResaleEnabled: String(initialProduct?.isResaleEnabled ?? false),
  });

  useEffect(() => {
    if (!initialProduct) return;

    const nextTitle = initialProduct.title || initialProduct.name || '';
    const nextSlug =
      initialProduct.slug ||
      initialProduct.urlHandle ||
      makeSeoUrlHandle(nextTitle);

    setBasicForm((prev) => ({
      ...prev,
      title: nextTitle,
      name: initialProduct.name || '',
      slug: nextSlug,
      sku: initialProduct.sku || '',
      description: initialProduct.description || '',
    }));
setProduct(initialProduct || null);
setMedia(Array.isArray(initialMedia) ? initialMedia : []);
setVariants(Array.isArray(initialVariants) ? initialVariants : []);

setPricingForm({
  price: String(initialProduct.basePrice || initialProduct.price || ''),
  compareAtPrice: String(initialProduct.compareAtPrice || ''),
  rentalPrice: String(initialProduct.rentalPrice || ''),
  depositAmount: String(initialProduct.depositAmount || ''),
});

setAvailabilityForm({
  stock: String(
    initialProduct.stock ||
      initialProduct.quantity ||
      initialProduct.lowStockThreshold ||
      '',
  ),
  status: normalizeStatus(initialProduct.status || initialProduct.publishStatus),
  isAvailable: String(initialProduct.isAvailable ?? true),
});

setCommerceForm({
  isShopEnabled: String(
    initialProduct.isSellable ??
      initialProduct.isShopEnabled ??
      true,
  ),
  isRentalEnabled: String(
    initialProduct.isRentable ??
      initialProduct.isRentalEnabled ??
      false,
  ),
  isResaleEnabled: String(initialProduct.isResaleEnabled ?? false),
});

setOrganizationForm({
  category:
    initialProduct.category ||
    initialProduct.categoryName ||
    initialProduct.primaryCollection ||
    '',
  productType: initialProduct.productType || initialProduct.type || '',
  vendor: initialProduct.vendor || '',
  collections: Array.isArray(initialProduct.categories)
    ? initialProduct.categories.join(', ')
    : Array.isArray(initialProduct.collections)
      ? initialProduct.collections.join(', ')
      : initialProduct.collections || '',
  tags: Array.isArray(initialProduct.tags)
    ? initialProduct.tags.join(', ')
    : initialProduct.tags || '',
});
    setSeoForm((prev) => ({
      ...prev,
      metaTitle:
        initialProduct.metaTitle ||
        initialProduct.seoTitle ||
        initialProduct.title ||
        initialProduct.name ||
        '',
      metaDescription:
        initialProduct.metaDescription ||
        initialProduct.seoDescription ||
        stripHtml(initialProduct.description || ''),
      urlHandle: nextSlug,
    }));

    setProductMetafields({
      productFaqs: initialProduct.productFaqs || '',
      careInstructions: initialProduct.careInstructions || [],
      compositionOrigin: initialProduct.compositionOrigin || [],
      customBadge: initialProduct.customBadge || '',
      primaryCollection: initialProduct.primaryCollection
        ? [initialProduct.primaryCollection]
        : [],
      secondaryCollection: initialProduct.secondaryCollection
        ? [initialProduct.secondaryCollection]
        : [],
      similarColorProducts: initialProduct.similarColorProducts || [],
      matchWithAccessories: initialProduct.matchWithAccessories || [],
      completeTheLook: initialProduct.completeTheLook || [],
      advancedProductTitle: initialProduct.advancedProductTitle || '',
      similarStyleProduct: initialProduct.similarStyleProduct || '',
      style: initialProduct.style || '',
      fabric: initialProduct.fabric || '',
      print: initialProduct.print || '',
      printSwatch: initialProduct.printSwatch ? [initialProduct.printSwatch] : [],
      similarPrintTitle: initialProduct.similarPrintTitle || '',
      similarPrintProducts: initialProduct.similarPrintProducts || [],
    });

setSelectedMetafieldProducts({
  similarStyleProduct: normalizeProductPickerValue(
    getMetafieldValue(initialProduct, 'similarStyleProduct') ||
      initialProduct.similarStyleProducts,
  ),
  similarColorProducts: normalizeProductPickerValue(
    getMetafieldValue(initialProduct, 'similarColorProducts'),
  ),
  matchWithAccessories: normalizeProductPickerValue(
    getMetafieldValue(initialProduct, 'matchWithAccessories'),
  ),
  completeTheLook: normalizeProductPickerValue(
    getMetafieldValue(initialProduct, 'completeTheLook'),
  ),
  similarPrintProducts: normalizeProductPickerValue(
    getMetafieldValue(initialProduct, 'similarPrintProducts') ||
      initialProduct.similarPrintProducts,
  ),
});

  }, [initialProduct, initialMedia, initialVariants]);
useEffect(() => {
  setMediaEdits((prev) => {
    const next = { ...prev };

    media.forEach((item, index) => {
      const mediaId =
        item?.id ||
        item?.imageId ||
        item?.mediaId ||
        item?._id ||
        item?.productImageId ||
        item?.publicId ||
        '';

      const mediaUrl =
        item?.url ||
        item?.secureUrl ||
        item?.secure_url ||
        item?.imageUrl ||
        item?.image ||
        item?.videoUrl ||
        item?.path ||
        item?.src ||
        item?.mediaUrl ||
        item?.fileUrl ||
        item?.cloudinaryUrl ||
        '';

      const key = mediaId || mediaUrl || `media-${index}`;

      if (!next[key]) {
        next[key] = {
          name:
            item?.caption ||
            item?.name ||
            item?.title ||
            item?.fileName ||
            item?.originalName ||
            '',
          altText:
            item?.alt ||
            item?.altText ||
            item?.alt_text ||
            item?.description ||
            '',
        };
      }
    });

    return next;
  });
}, [media]);
  const currentProductId =
    productId || product?.id || product?.productId || product?._id || '';

    

  function updateForm(setter: any, key: string, value: string) {
    setter((prev: any) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
  if (mode !== 'edit' || !currentProductId) return;

  reloadProduct(currentProductId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [mode, currentProductId]);

useEffect(() => {
  setMediaEdits((prev) => {
    const next = { ...prev };

    media.forEach((item, index) => {
      const key = getMediaEditKey(item, index);

      if (!next[key]) {
        next[key] = {
          name:
            item?.caption ||
            item?.name ||
            item?.title ||
            item?.fileName ||
            item?.originalName ||
            '',
          altText:
            item?.alt ||
            item?.altText ||
            item?.alt_text ||
            item?.description ||
            '',
        };
      }
    });

    return next;
  });
}, [media]);
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
 ''
 );
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
 'Untitled product'
 );
}
function getMetafieldValue(source: any, key: string) {
  return source?.metafields?.[key] ?? source?.[key] ?? [];
}

function normalizeProductPickerValue(value: any) {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function unwrapCatalogProducts(response: any) {
  const root = response?.data || response;

  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(root?.data?.data)) return root.data.data;
  if (Array.isArray(root?.products)) return root.products;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.rows)) return root.rows;

  return [];
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
 images.find((item: any) => item?.isPrimary || item?.is_primary) || images[0];
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
function getProductCategory(product: any) {
  const p = product?.product || product?.catalogProduct || product;

  const categories = Array.isArray(p?.categories)
    ? p.categories.filter(Boolean)
    : [];

  return String(
    p?.category ||
      p?.categoryName ||
      p?.primaryCategory ||
      categories[0] ||
      p?.primaryCollection ||
      p?.collection ||
      '',
  ).trim();
}

function getProductType(product: any) {
  const p = product?.product || product?.catalogProduct || product;

  return String(
    p?.productType ||
      p?.type ||
      p?.style ||
      p?.metafields?.style ||
      '',
  ).trim();
}

function getProductVendor(product: any) {
  const p = product?.product || product?.catalogProduct || product;

  return String(
    p?.vendor ||
      p?.brand ||
      p?.vendorName ||
      p?.storeName ||
      '',
  ).trim();
}

function getProductTags(product: any) {
  const p = product?.product || product?.catalogProduct || product;

  const tags = [
    ...(Array.isArray(p?.tags) ? p.tags : []),
    ...(Array.isArray(p?.occasionTags) ? p.occasionTags : []),
    ...(Array.isArray(p?.metaKeywords) ? p.metaKeywords : []),
  ];

  if (typeof p?.tags === 'string') {
    tags.push(...p.tags.split(','));
  }

  return Array.from(
    new Set(
      tags
        .map((item: any) => String(item || '').trim())
        .filter(Boolean),
    ),
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




function productMatchesSimilarFilter(product: any, query: string, filter: string) {
  const searchValue = query.toLowerCase().trim();

  if (!searchValue) return true;

  const title = getProductTitle(product).toLowerCase();
  const category = String(
    product?.category ||
      product?.primaryCategory ||
      product?.primaryCollection ||
      product?.collection ||
      '',
  ).toLowerCase();

  const type = getProductType(product).toLowerCase();
  const vendor = getProductVendor(product).toLowerCase();

  const tags = Array.isArray(product?.tags)
    ? product.tags.join(' ').toLowerCase()
    : String(product?.tags || '').toLowerCase();

  if (filter === 'category') return category.includes(searchValue);
  if (filter === 'type') return type.includes(searchValue);
  if (filter === 'tags') return tags.includes(searchValue);
  if (filter === 'vendor') return vendor.includes(searchValue);

  return (
    title.includes(searchValue) ||
    category.includes(searchValue) ||
    type.includes(searchValue) ||
    vendor.includes(searchValue) ||
    tags.includes(searchValue)
  );
}



function getUniquePickerValues(type: 'category' | 'type' | 'tag' | 'vendor') {
  const sourceProducts =
  allCatalogProductsForFilters.length > 0
    ? allCatalogProductsForFilters
    : similarPickerProducts;

  const values = sourceProducts.flatMap((product: any) => {
    if (type === 'category') {
      return [
        product?.category,
        product?.categoryName,
        product?.primaryCategory,
        product?.primaryCollection,
        ...(Array.isArray(product?.categories) ? product.categories : []),
      ];
    }

    if (type === 'type') {
      return product?.productType || product?.type || '';
    }

    if (type === 'vendor') {
      return product?.vendor || product?.brand || product?.vendorName || '';
    }

    if (type === 'tag') {
      if (Array.isArray(product?.tags)) return product.tags;
      if (typeof product?.tags === 'string') {
        return product.tags.split(',').map((item: string) => item.trim());
      }
      return [];
    }

    return '';
  });

  return Array.from(
    new Set(values.map((item: any) => String(item || '').trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
}

function getPreviewUrlHandle() {
  return (
    seoForm.urlHandle ||
    basicForm.slug ||
    makeSeoUrlHandle(basicForm.title) ||
    ''
  );
}

function getPreviewFullUrl() {
  const handle = getPreviewUrlHandle();

  return handle
    ? `${STOREFRONT_DOMAIN}/${PRODUCT_URL_PREFIX}/${handle}`
    : `${STOREFRONT_DOMAIN}/${PRODUCT_URL_PREFIX}/`;
}

function getPreviewBreadcrumbUrl() {
  const handle = getPreviewUrlHandle();

  return handle
    ? `${STOREFRONT_DOMAIN} › ${PRODUCT_URL_PREFIX} › ${handle}`
    : `${STOREFRONT_DOMAIN} › ${PRODUCT_URL_PREFIX}`;
}
  function getPreviewTitle() {
    return seoForm.metaTitle || basicForm.title || 'Product page title';
  }

  function getPreviewDescription() {
    return (
      seoForm.metaDescription ||
      stripHtml(basicForm.description) ||
      'Add a meta description to preview how this product may appear in Google search results.'
    );
  }

  function getMediaId(item: any) {
    return (
      item?.id ||
      item?.imageId ||
      item?.mediaId ||
      item?._id ||
      item?.productImageId ||
      item?.publicId ||
      ''
    );
  }

 function getMediaUrl(item: any) {
  return (
    item?.url ||
    item?.secureUrl ||
    item?.secure_url ||
    item?.imageUrl ||
    item?.image ||
    item?.videoUrl ||
    item?.path ||
    item?.src ||
    item?.mediaUrl ||
    item?.fileUrl ||
    item?.cloudinaryUrl ||
    item?.thumbnail ||
    item?.previewUrl ||
    item?.assetUrl ||
    item?.originalUrl ||
    ''
  );
}




function getMediaEditKey(item: any, index: number) {
  const mediaId = getMediaId(item);
  const mediaUrl = getMediaUrl(item);

  return mediaId || mediaUrl || `media-${index}`;
}

function isVideoMedia(item: any) {
  const mediaUrl = getMediaUrl(item);

  return (
    item?.type === 'video' ||
    item?.mediaType === 'video' ||
    item?.mimeType?.startsWith?.('video/') ||
    item?.fileType?.startsWith?.('video/') ||
    String(mediaUrl).match(/\.(mp4|webm|mov|avi)$/i)
  );
}
function filterActiveCategoryTree(items: any[] = []): any[] {
  return items
    .filter((item) => item?.isActive !== false)
    .map((item) => ({
      ...item,
      children: filterActiveCategoryTree(getCategoryChildrenFromItem(item)),
    }));
}
function updateMediaEdit(
  key: string,
  field: 'name' | 'altText',
  value: string,
) {
  setMediaEdits((prev) => ({
    ...prev,
    [key]: {
      name: prev[key]?.name || '',
      altText: prev[key]?.altText || '',
      [field]: value,
    },
  }));
}

function normalizeStatus(value: any) {
  const status = String(value || 'DRAFT').toUpperCase();

  if (status === 'PUBLISHED') return 'ACTIVE';
  if (status === 'UNPUBLISHED') return 'DRAFT';

  return status;
}

function makeSlug(value: string) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function getCategorySlug(category: any) {
  return String(category?.slug || category?.handle || category?.name || '')
    .toLowerCase()
    .trim();
}
function getPickerTitle(field: string) {
  if (field === 'similarStyleProduct') return 'Add similar style products';
  if (field === 'similarColorProducts') return 'Add similar color products';
  if (field === 'matchWithAccessories') return 'Add match with accessories';
  if (field === 'completeTheLook') return 'Add complete the look products';

  return 'Add products';
}

function isRootCategory(category: any) {
  return (
    category?.type === 'collection' ||
    category?.kind === 'collection' ||
    category?.level === 0 ||
    category?.isCollection === true ||
    !category?.parentSlug
  );
}
async function saveProductMetafields() {
 if (!currentProductId) {
 setError('Product save karo pehle, phir metafields save honge.');
 return;
 }
 setSaving(true);
 setError('');
 try {
 const getSelectedIds = (field: ProductPickerMetafield) => {
 const fromSelectedProducts = (selectedMetafieldProducts[field] || [])
 .map((item: any) => (typeof item === 'string' ? item : getProductId(item)))
 .filter(Boolean);
 if (fromSelectedProducts.length > 0) return fromSelectedProducts;
 const rawValue = productMetafields[field];
 return Array.isArray(rawValue)
 ? rawValue
 .map((item: any) => (typeof item === 'string' ? item : getProductId(item)))
 .filter(Boolean)
 : String(rawValue || '')
 .split(',')
 .map((item) => item.trim())
 .filter(Boolean);
 };
 const similarStyleProductIds = getSelectedIds('similarStyleProduct');
 const similarColorProductIds = getSelectedIds('similarColorProducts');
 const matchWithAccessoryIds = getSelectedIds('matchWithAccessories');
 const completeTheLookIds = getSelectedIds('completeTheLook');
const similarPrintProductIds = getSelectedIds('similarPrintProducts');

await adminCatalogService.updateProductMetafields(currentProductId, {
  productFaqs: String(productMetafields.productFaqs || ''),
  careInstructions: String(productMetafields.careInstructions || ''),
  compositionOrigin: String(productMetafields.compositionOrigin || ''),
  customBadge: String(productMetafields.customBadge || ''),
  seeMoreFrom: String(productMetafields.seeMoreFrom || ''),
  primaryCollection: String(productMetafields.primaryCollection || ''),
  secondaryCollection: String(productMetafields.secondaryCollection || ''),
  similarColorProducts: similarColorProductIds,
  matchWithAccessories: matchWithAccessoryIds,
  completeTheLook: completeTheLookIds,
  advancedProductTitle: String(productMetafields.advancedProductTitle || ''),
  similarStyleProduct: similarStyleProductIds,
  style: String(productMetafields.style || ''),
  fabric: String(productMetafields.fabric || ''),
  print: String(productMetafields.print || ''),
  printSwatch: String(productMetafields.printSwatch || ''),
  similarPrintTitle: String(productMetafields.similarPrintTitle || ''),
  similarPrintProducts: similarPrintProductIds,
});
setError('');
alert('Product metafields saved successfully');
 await reloadProduct(currentProductId);
 await hydrateSavedMetafieldProducts({
  similarStyleProduct: similarStyleProductIds,
  similarColorProducts: similarColorProductIds,
  matchWithAccessories: matchWithAccessoryIds,
  completeTheLook: completeTheLookIds,
  similarPrintProducts: similarPrintProductIds,
});
 await onReload?.();
 } catch (err: any) {
 setError(getApiErrorMessage(err));
 } finally {
 setSaving(false);
 }
}
async function loadAllCatalogProductsForFilters() {
  try {
    const res = await adminCatalogService.list();

    const products = unwrapCatalogProducts(res);
    setAllCatalogProductsForFilters(products);
  } catch (err: any) {
    console.warn('Catalog filter products load failed:', err);
  }
}

async function loadSimilarPickerProducts(searchValue = similarProductSearch) {
  setSimilarPickerLoading(true);
  setError('');
await loadAllCatalogProductsForFilters();
  try {
    const res = await adminCatalogService.getProductPicker({
      search: similarProductFilter === 'all' ? searchValue : '',
      searchBy: 'all',
      category: similarProductFilter === 'category' ? similarFilterValue : '',
      type: similarProductFilter === 'type' ? similarFilterValue : '',
      tag: similarProductFilter === 'tag' ? similarFilterValue : '',
      vendor: similarProductFilter === 'vendor' ? similarFilterValue : '',
      status: similarPickerStatus,
      page: 1,
      limit: 50,
    });

    const products = unwrapList(res);
    const currentId = currentProductId || productId || '';

    setSimilarPickerProducts(
      products.filter((item: any) => {
        const id = getProductId(item);
        return id && id !== currentId;
      }),
    );
  } catch (err: any) {
    setError(getApiErrorMessage(err));
    setSimilarPickerProducts([]);
  } finally {
    setSimilarPickerLoading(false);
  }
}

async function openProductMetafieldPicker(field: ProductPickerMetafield) {
  setActiveProductPickerField(field);
  setShowSimilarProductPicker(true);
  setSimilarProductSearch('');
  setError('');

  await loadSimilarPickerProducts('');

  const savedIdsFromMetafields = Array.isArray(productMetafields[field])
    ? (productMetafields[field] as string[])
    : String(productMetafields[field] || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

  const savedIdsFromSelected = (selectedMetafieldProducts[field] || [])
    .map((item: any) => (typeof item === 'string' ? item : getProductId(item)))
    .filter(Boolean);

  setSelectedSimilarProductIds(
    Array.from(new Set([...savedIdsFromMetafields, ...savedIdsFromSelected])),
  );
}

function toggleSimilarProduct(product: any) {
 const id = getProductId(product);
 if (!id) return;
 setSelectedSimilarProductIds((prev) =>
 prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
 );
}
function addSelectedSimilarProducts() {
 const selectedProducts = similarPickerProducts.filter((item) =>
 selectedSimilarProductIds.includes(getProductId(item)),
 );
 setSelectedMetafieldProducts((prev) => ({
 ...prev,
 [activeProductPickerField]: selectedProducts,
 }));
 setProductMetafields((prev) => ({
 ...prev,
 [activeProductPickerField]: selectedProducts.map((item) => getProductId(item)),
 }));
 setShowSimilarProductPicker(false);
}
function removeProductFromMetafield(field: ProductPickerMetafield, productId: string) {
 setSelectedMetafieldProducts((prev) => ({
 ...prev,
 [field]: (prev[field] || []).filter((item: any) => {
 const id = typeof item === 'string' ? item : getProductId(item);
 return id !== productId;
 }),
 }));
 setProductMetafields((prev) => {
 const currentValue = prev[field];
 const nextIds = Array.isArray(currentValue)
 ? currentValue.filter((item: any) => {
 const id = typeof item === 'string' ? item : getProductId(item);
 return id !== productId;
 })
 : String(currentValue || '')
 .split(',')
 .map((item) => item.trim())
 .filter((id) => id && id !== productId);
 return { ...prev, [field]: nextIds };
 });
}

function findCategoryPathById(
  categories: any[],
  categoryId: string,
  path: any[] = [],
): any[] {
  for (let index = 0; index < categories.length; index += 1) {
    const category = categories[index];

    const id = String(
      category?.id ||
        category?._id ||
        category?.categoryId ||
        category?.slug ||
        category?.name ||
        index,
    );

    const nextPath = [...path, category];

    if (id === categoryId) {
      return nextPath;
    }

    const children =
      category?.children ||
      category?.subcategories ||
      category?.items ||
      category?.nodes ||
      [];

    if (Array.isArray(children) && children.length > 0) {
      const foundPath = findCategoryPathById(children, categoryId, nextPath);

      if (foundPath.length > 0) {
        return foundPath;
      }
    }
  }

  return [];
}

async function addCategoryFromProductEditor(payload: {
  name: string;
  parentId?: string;
}) {
  try {
    const name = payload.name.trim();

    if (!name) {
      setError('Category name is required.');
      return;
    }

    const slug = makeSlug(name);

    // No parent selected = root collection/category
    if (!payload.parentId) {
      await adminCategoriesService.createRootCollection({
        name,
        slug,
        description: '',
        isActive: true,
        sortOrder: 1,
      });

      await loadProductCategoryTree();
      return;
    }

    const parentPath = findCategoryPathById(categoryTree, payload.parentId);
    const parentCategory = parentPath[parentPath.length - 1];
    const rootCollection = parentPath[0];

    if (!parentCategory) {
      setError('Parent category not found. Please select parent again.');
      return;
    }

    const parentSlug = getCategorySlug(parentCategory);
    const collectionSlug = getCategorySlug(rootCollection);

    if (!parentSlug) {
      setError('Parent category slug missing.');
      return;
    }

    // Parent selected = always child/subcategory
    await adminCategoriesService.createChildCategory({
  name,
  slug,
  description: '',
  parentSlug: isRootCategory(parentCategory) ? parentSlug : parentSlug,
  isActive: true,
  sortOrder: 1,
});

    await loadProductCategoryTree();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  }
}

async function loadProductCategoryTree() {
  try {
    const res = await adminCategoriesService.tree({
      includeInactive: true,
      showProductCount: true,
      showEmpty: true,
      maxDepth: 20,
    });

    const root = unwrapObject(res);
    const directList = unwrapList(res);

    const possibleTree =
      directList.length > 0
        ? directList
        : root?.tree ||
          root?.categories ||
          root?.collections ||
          root?.items ||
          root?.children ||
          root?.data?.tree ||
          root?.data?.categories ||
          root?.data?.collections ||
          root?.data?.items ||
          root?.data?.children ||
          root?.data ||
          [];

    const finalTree = Array.isArray(possibleTree) ? possibleTree : [];
    setCategoryTree(finalTree);

if (finalTree.length === 0) {
  console.warn('Category tree API returned empty data:', res);
}
  } catch (err: any) {
    console.error('Category tree load failed:', err);
    setError(getApiErrorMessage(err));
    setCategoryTree([]);
  }
}
useEffect(() => {
  loadProductCategoryTree();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


async function saveMediaMetadata(item: any, index: number) {
  const mediaId = getMediaId(item);
  const key = getMediaEditKey(item, index);
  const edit = mediaEdits[key];

  if (!mediaId) {
    setError('Media ID is missing, so metadata cannot be saved.');
    return;
  }

  try {
    await adminCatalogService.updateImage(mediaId, {
      alt: edit?.altText || '',
      caption: edit?.name || '',
      viewType: item?.viewType || 'front',
      position: index,
      colorName: item?.colorName || '',
      isPrimary: Boolean(item?.isPrimary),
    });

    if (currentProductId) {
      await reloadProduct(currentProductId);
      await onReload?.();
    }
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  }
}

function looksLikeMediaObject(item: any) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false;

  return Boolean(
    item.url ||
      item.secureUrl ||
      item.secure_url ||
      item.imageUrl ||
      item.image ||
      item.videoUrl ||
      item.path ||
      item.src ||
      item.mediaUrl ||
      item.fileUrl ||
      item.cloudinaryUrl ||
      item.thumbnail ||
      item.previewUrl,
  );
}

function collectMediaDeep(value: any, output: any[] = []) {
  if (!value) return output;

  if (Array.isArray(value)) {
    value.forEach((item) => collectMediaDeep(item, output));
    return output;
  }

  if (typeof value !== 'object') return output;

  if (looksLikeMediaObject(value)) {
    output.push(value);
  }

  const possibleKeys = [
    'images',
    'image',
    'media',
    'productImages',
    'videos',
    'video',
    'productVideos',
    'files',
    'assets',
    'gallery',
    'data',
    'result',
    'items',
    'records',
    'rows',
    'colors',
    'productColors',
    'variants',
  ];

  possibleKeys.forEach((key) => {
    if (value[key]) collectMediaDeep(value[key], output);
  });

  return output;
}

function normalizeMediaList(mediaResponse: any, detail?: any) {
  const combined = [
    ...unwrapList(mediaResponse),
    ...collectMediaDeep(mediaResponse),
    ...collectMediaDeep(detail),
  ];

  const uniqueMap = new Map<string, any>();

  combined.forEach((item: any, index: number) => {
    const mediaId = getMediaId(item);
    const mediaUrl = getMediaUrl(item);
    const key = mediaId || mediaUrl || `media-${index}`;

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });

  return Array.from(uniqueMap.values());
}

async function reloadProduct(id: string) {
  try {
    const [detailRes, mediaRes, variantsRes] = await Promise.allSettled([
      adminCatalogService.detail(id),
      adminCatalogService.media(id),
      adminCatalogService.getVariants(id),
    ]);

    let detail: any = null;

    if (detailRes.status === 'fulfilled') {
      detail = unwrapObject(detailRes.value);

      setProduct(detail);

      const savedMetafields = detail?.metafields || {};

      const normalizeSavedIds = (value: any) => {
        if (Array.isArray(value)) {
          return value
            .map((item: any) => (typeof item === 'string' ? item : getProductId(item)))
            .filter(Boolean);
        }

        if (!value) return [];

        return String(value)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      };

      const buildSelectedProducts = (field: ProductPickerMetafield, ids: string[]) => {
  const previousProducts = selectedMetafieldProducts[field] || [];

  return ids.map((productId) => {
    const existingProduct = previousProducts.find((item: any) => {
      const id = typeof item === 'string' ? item : getProductId(item);
      return id === productId;
    });

    if (existingProduct && typeof existingProduct !== 'string') {
      return existingProduct;
    }

    return {
      id: productId,
      productId,
      title: productId,
      name: productId,
      __needsHydration: true,
    };
  });
};

      const similarStyleProductIds = normalizeSavedIds(savedMetafields.similarStyleProduct);
      const similarColorProductIds = normalizeSavedIds(savedMetafields.similarColorProducts);
      const matchWithAccessoryIds = normalizeSavedIds(savedMetafields.matchWithAccessories);
      const completeTheLookIds = normalizeSavedIds(savedMetafields.completeTheLook);
      const similarPrintProductIds = normalizeSavedIds(savedMetafields.similarPrintProducts);

      setProductMetafields({
        productFaqs: savedMetafields.productFaqs || '',
        careInstructions: savedMetafields.careInstructions || '',
        compositionOrigin: savedMetafields.compositionOrigin || '',
        customBadge: savedMetafields.customBadge || '',
        seeMoreFrom: savedMetafields.seeMoreFrom || '',
        primaryCollection: savedMetafields.primaryCollection || '',
        secondaryCollection: savedMetafields.secondaryCollection || '',
        similarColorProducts: similarColorProductIds,
        matchWithAccessories: matchWithAccessoryIds,
        completeTheLook: completeTheLookIds,
        advancedProductTitle: savedMetafields.advancedProductTitle || '',
        similarStyleProduct: similarStyleProductIds,
        style: savedMetafields.style || '',
        fabric: savedMetafields.fabric || '',
        print: savedMetafields.print || '',
        printSwatch: savedMetafields.printSwatch || '',
        similarPrintTitle: savedMetafields.similarPrintTitle || '',
        similarPrintProducts: similarPrintProductIds,
      });

      setSelectedMetafieldProducts({
        similarStyleProduct: buildSelectedProducts('similarStyleProduct', similarStyleProductIds),
        similarColorProducts: buildSelectedProducts('similarColorProducts', similarColorProductIds),
        matchWithAccessories: buildSelectedProducts('matchWithAccessories', matchWithAccessoryIds),
        completeTheLook: buildSelectedProducts('completeTheLook', completeTheLookIds),
        similarPrintProducts: buildSelectedProducts('similarPrintProducts', similarPrintProductIds),
      });
hydrateSavedMetafieldProducts({
  similarStyleProduct: similarStyleProductIds,
  similarColorProducts: similarColorProductIds,
  matchWithAccessories: matchWithAccessoryIds,
  completeTheLook: completeTheLookIds,
  similarPrintProducts: similarPrintProductIds,
});
      const existingSimilarProducts =
        detail?.similarProducts ||
        detail?.relatedProducts ||
        detail?.recommendedProducts ||
        [];

      setSimilarProducts(Array.isArray(existingSimilarProducts) ? existingSimilarProducts : []);

      setSelectedSimilarProductIds(similarStyleProductIds);

      const nextTitle = detail?.title || detail?.name || '';
      const nextSlug =
        detail?.slug ||
        detail?.urlHandle ||
        makeSeoUrlHandle(nextTitle);

      setBasicForm((prev) => ({
        ...prev,
        title: nextTitle,
        name: detail?.name || '',
        slug: nextSlug,
        sku: detail?.sku || '',
        description: detail?.description || '',
      }));

      setPricingForm({
        price: String(detail?.basePrice || detail?.price || ''),
        compareAtPrice: String(detail?.compareAtPrice || ''),
        rentalPrice: String(detail?.rentalPrice || ''),
        depositAmount: String(detail?.depositAmount || ''),
      });

      setAvailabilityForm({
        stock: String(
          detail?.stock ||
            detail?.quantity ||
            detail?.lowStockThreshold ||
            '',
        ),
        status: normalizeStatus(
          detail?.adminStatus ||
            detail?.statusLabel ||
            detail?.status ||
            detail?.publishStatus,
        ),
        isAvailable: String(detail?.isAvailable ?? true),
      });

      setCommerceForm({
        isShopEnabled: String(
          detail?.isSellable ??
            detail?.isShopEnabled ??
            true,
        ),
        isRentalEnabled: String(
          detail?.isRentable ??
            detail?.isRentalEnabled ??
            false,
        ),
        isResaleEnabled: String(detail?.isResaleEnabled ?? false),
      });

      setOrganizationForm({
        category:
          detail?.category ||
          detail?.categoryName ||
          detail?.primaryCollection ||
          '',
        productType: detail?.productType || '',
        vendor: detail?.vendor || '',
        collections: Array.isArray(detail?.categories)
          ? detail.categories.join(', ')
          : Array.isArray(detail?.collections)
            ? detail.collections.join(', ')
            : detail?.collections || '',
        tags: Array.isArray(detail?.tags)
          ? detail.tags.join(', ')
          : detail?.tags || '',
      });

      setSeoForm((prev) => ({
        ...prev,
        metaTitle:
          detail?.metaTitle ||
          detail?.seoTitle ||
          detail?.title ||
          detail?.name ||
          '',
        metaDescription:
          detail?.metaDescription ||
          detail?.seoDescription ||
          stripHtml(detail?.description || ''),
        urlHandle: nextSlug,
      }));

      const nextCategories =
        detail?.categories ||
        detail?.categoryIds ||
        detail?.productCategories ||
        [];

      if (Array.isArray(nextCategories)) {
        setSelectedCategoryIds(
          nextCategories
            .map((item: any) =>
              typeof item === 'string'
                ? item
                : item?.id || item?._id || item?.categoryId || '',
            )
            .filter(Boolean),
        );
      }

      setPrimaryCategoryId(
        detail?.primaryCategoryId ||
          detail?.primaryCategory?.id ||
          detail?.primaryCategory?._id ||
          detail?.categoryId ||
          detail?.category?.id ||
          '',
      );
    }

    if (mediaRes.status === 'fulfilled') {
      setMedia(normalizeMediaList(mediaRes.value, detail));
    } else {
      setMedia(normalizeMediaList(null, detail));
    }

    if (variantsRes.status === 'fulfilled') {
      setVariants(unwrapList(variantsRes.value));
    }
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  }
}
async function hydrateSavedMetafieldProducts(
  idsByField: Record<ProductPickerMetafield, string[]>,
) {
  const allIds = Array.from(
    new Set(Object.values(idsByField).flat().filter(Boolean)),
  );

  if (allIds.length === 0) return;

  try {
    const res = await adminCatalogService.getProductPicker({
      search: '',
      searchBy: 'all',
      status: 'all',
      page: 1,
      limit: 200,
    });

    const products = unwrapList(res);

    const productMap = new Map<string, any>();

    products.forEach((product: any) => {
      const id = getProductId(product);
      if (id) productMap.set(id, product);
    });

    setSelectedMetafieldProducts({
      similarStyleProduct: idsByField.similarStyleProduct.map((id) =>
        productMap.get(id) || {
          id,
          productId: id,
          title: id,
          name: id,
        },
      ),
      similarColorProducts: idsByField.similarColorProducts.map((id) =>
        productMap.get(id) || {
          id,
          productId: id,
          title: id,
          name: id,
        },
      ),
      matchWithAccessories: idsByField.matchWithAccessories.map((id) =>
        productMap.get(id) || {
          id,
          productId: id,
          title: id,
          name: id,
        },
      ),
      completeTheLook: idsByField.completeTheLook.map((id) =>
        productMap.get(id) || {
          id,
          productId: id,
          title: id,
          name: id,
        },
      ),
      similarPrintProducts: idsByField.similarPrintProducts.map((id) =>
        productMap.get(id) || {
          id,
          productId: id,
          title: id,
          name: id,
        },
      ),
    });
  } catch (err: any) {
    console.warn('Saved metafield product hydration failed:', err);
  }
}
  async function createProduct(e?: FormEvent) {
  e?.preventDefault();
  setSaving(true);
  setError('');

  try {
    const cleanUrlHandle = makeSeoUrlHandle(
      seoForm.urlHandle || basicForm.slug || basicForm.title,
    );

    const payload = {
      title: basicForm.title,
      description: basicForm.description,
      shortDescription: stripHtml(basicForm.description).slice(0, 180),
      slug: cleanUrlHandle,
      sku: basicForm.sku,
      mode: 'retail',
      category: organizationForm.category || '',
      productType: organizationForm.productType || '',

  vendor: organizationForm.vendor || '',


  color: '',
  fabric: String(productMetafields.fabric || ''),
     
      occasion: '',
      composition: '',
      style: String(productMetafields.style || ''),
      print: String(productMetafields.print || ''),
      badge: String(productMetafields.customBadge || ''),
      primaryCollection: Array.isArray(productMetafields.primaryCollection)
        ? productMetafields.primaryCollection[0] || ''
        : '',
      secondaryCollection: Array.isArray(productMetafields.secondaryCollection)
        ? productMetafields.secondaryCollection[0] || ''
        : '',
      categories: getSelectedCategorySlugs(),
      tags: organizationForm.tags
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean),
      careInstructions: Array.isArray(productMetafields.careInstructions)
        ? productMetafields.careInstructions
        : [],
    };

    const res = await adminCatalogService.create(payload);
    const created = unwrapObject(res);

    const createdProduct =
      created?.product ||
      created?.item ||
      created?.data ||
      created;

    const id =
      createdProduct?.id ||
      createdProduct?._id ||
      createdProduct?.productId;

    if (onCreated) {
      onCreated(createdProduct || created);
      return;
    }

    if (id) {
      router.push(`/admin/catalog/${id}`);
    } else {
      router.push('/admin/catalog');
    }
  } catch (err: any) {
  } finally {
    setSaving(false);
  }
}
async function saveBasic(e?: FormEvent) {
  e?.preventDefault();

  if (!currentProductId) {
    setError('Create the product first.');
    return;
  }

  setSaving(true);
  setError('');

  try {
    await adminCatalogService.updateBasicInfo(currentProductId, {
  title: basicForm.title,
  description: basicForm.description,
  shortDescription: stripHtml(basicForm.description).slice(0, 180),
  category: organizationForm.category || '',

  productType: organizationForm.productType || '',


  vendor: organizationForm.vendor || '',

  color: '',
  fabric: String(productMetafields.fabric || ''),
  occasion: '',
});
    await reloadProduct(currentProductId);
    await onReload?.();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setSaving(false);
  }
}

  async function savePricing(e?: FormEvent) {
  e?.preventDefault();

  if (!currentProductId) {
    setError('Create the product first.');
    return;
  }

  setSaving(true);
  setError('');

  try {
    await adminCatalogService.updatePricing(currentProductId, {
  basePrice: Number(pricingForm.price || 0),
  compareAtPrice: Number(pricingForm.compareAtPrice || 0),
  discountPercent: 0,
  currency: 'USD',
  rentalPrice: Number(pricingForm.rentalPrice || 0),
  resalePrice: 0,
  listingPrice: Number(pricingForm.price || 0),
  minOfferPrice: 0,
});

    await reloadProduct(currentProductId);
    await onReload?.();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setSaving(false);
  }
}

async function saveStatus(e?: FormEvent) {
  e?.preventDefault();

  if (!currentProductId) {
    setError('Create the product first.');
    return;
  }

  const selectedStatus = normalizeStatus(availabilityForm.status);

  setSaving(true);
  setError('');

  try {
    await adminCatalogService.updateStatus(currentProductId, {
      status: selectedStatus,
      publishedAt:
        selectedStatus === 'ACTIVE' ? new Date().toISOString() : null,
    });

    setAvailabilityForm((prev) => ({
      ...prev,
      status: selectedStatus,
    }));

    await reloadProduct(currentProductId);
    await onReload?.();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setSaving(false);
  }
}

async function saveAvailability(e?: FormEvent) {
  e?.preventDefault();

  if (!currentProductId) {
    setError('Create the product first.');
    return;
  }

  const available = availabilityForm.isAvailable === 'true';

  setSaving(true);
  setError('');

  try {
    await adminCatalogService.updateAvailability(currentProductId, {
      availabilityStatus: available ? 'in_stock' : 'out_of_stock',
      availabilityLabel: available ? 'In stock' : 'Out of stock',
      lowStockThreshold: Number(availabilityForm.stock || 3),
      pickupAvailable: true,
      shippingAvailable: true,
    });

    await reloadProduct(currentProductId);
    await onReload?.();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setSaving(false);
  }
}

function getSelectedCategorySlugs() {
  const slugs: string[] = [];

  function walk(items: any[]) {
    items.forEach((item, index) => {
      const id = String(
        item.id ||
          item._id ||
          item.categoryId ||
          item.slug ||
          item.name ||
          index,
      );

      if (selectedCategoryIds.includes(id)) {
        const slug = getCategorySlug(item);
        if (slug) slugs.push(slug);
      }

      const children =
        item.children ||
        item.subcategories ||
        item.items ||
        item.nodes ||
        [];

      if (Array.isArray(children)) {
        walk(children);
      }
    });
  }

  walk(categoryTree);

  return Array.from(new Set(slugs));
}

function getPrimaryCategorySlug() {
  const primary = primaryCategoryId
    ? findCategoryById(categoryTree, primaryCategoryId)
    : null;

  return primary ? getCategorySlug(primary) : '';
}

  async function saveOrganization(e?: FormEvent) {
  e?.preventDefault();

  if (!currentProductId) {
    setError('Create the product first.');
    return;
  }

  setSaving(true);
  setError('');
const selectedIdsSnapshot = [...selectedCategoryIds];
const primaryIdSnapshot = primaryCategoryId;
  try {
    const categorySlugs = getSelectedCategorySlugs();
    const primarySlug = getPrimaryCategorySlug();

    await Promise.allSettled([
  adminCatalogService.updateBasicInfo(currentProductId, {
  title: basicForm.title,
  description: basicForm.description,
  shortDescription: stripHtml(basicForm.description).slice(0, 180),

  category: organizationForm.category || '',

  productType: organizationForm.productType || '',
 

  vendor: organizationForm.vendor || '',

}),
  adminCatalogService.updateTags(currentProductId, {
    tags: organizationForm.tags
      .split(',')
      .map((item: string) => item.trim())
      .filter(Boolean),
    occasionTags: [],
    metaKeywords: [],
  }),

  adminCatalogService.updateCollections(currentProductId, {
    primaryCollection:
      primarySlug ||
      categorySlugs[0] ||
      organizationForm.category ||
      '',
    secondaryCollection: categorySlugs[1] || '',
    categories: categorySlugs,
  }),
]);

    await reloadProduct(currentProductId);
    setSelectedCategoryIds(selectedIdsSnapshot);
setPrimaryCategoryId(primaryIdSnapshot);
    await onReload?.();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setSaving(false);
  }
}
async function saveCategories(e?: FormEvent) {
  e?.preventDefault();

  if (!currentProductId) {
    setError('Create the product first.');
    return;
  }

  const selectedIdsSnapshot = [...selectedCategoryIds];
  const primaryIdSnapshot = primaryCategoryId;

  setSaving(true);
  setError('');

  try {
    const categorySlugs = getSelectedCategorySlugs();
    const primarySlug = getPrimaryCategorySlug();

    await adminCatalogService.updateCollections(currentProductId, {
      primaryCollection: primarySlug || categorySlugs[0] || '',
      secondaryCollection: categorySlugs[1] || '',
      categories: categorySlugs,
    });

    setSelectedCategoryIds(selectedIdsSnapshot);
    setPrimaryCategoryId(primaryIdSnapshot);

    await reloadProduct(currentProductId);

    setSelectedCategoryIds(selectedIdsSnapshot);
    setPrimaryCategoryId(primaryIdSnapshot);

    await onReload?.();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setSaving(false);
  }
}

 async function saveSeo(e?: FormEvent) {
  e?.preventDefault();

  if (!currentProductId) {
    setError('Create the product first.');
    return;
  }

  setSaving(true);
  setError('');

  try {
    const cleanUrlHandle = makeSeoUrlHandle(
      seoForm.urlHandle || basicForm.slug || basicForm.title,
    );

    await adminCatalogService.updateSeo(currentProductId, {
      seoTitle: seoForm.metaTitle,
      seoDescription: seoForm.metaDescription,
      slug: cleanUrlHandle,
      metaKeywords: [],
    });

    setBasicForm((prev) => ({
      ...prev,
      slug: cleanUrlHandle,
    }));

    setSeoForm((prev) => ({
      ...prev,
      urlHandle: cleanUrlHandle,
    }));

    await reloadProduct(currentProductId);
    await onReload?.();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setSaving(false);
  }
}

  async function saveCommerce(e?: FormEvent) {
  e?.preventDefault();

  if (!currentProductId) {
    setError('Create the product first.');
    return;
  }

  setSaving(true);
  setError('');

  try {
    await adminCatalogService.updateCommerceSettings(currentProductId, {
      isSellable: commerceForm.isShopEnabled === 'true',
      isRentable: commerceForm.isRentalEnabled === 'true',
      availableForDailyRent: commerceForm.isRentalEnabled === 'true',
      availableForSubscription: false,
      isMadeToOrder: false,
      allowCustomSizing: true,
      allowRushProduction: false,
    });

    await reloadProduct(currentProductId);
    await onReload?.();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setSaving(false);
  }
}

  function isAcceptedMediaFile(file: File) {
  return file.type.startsWith('image/') || file.type.startsWith('video/');
}

function getDefaultAltText(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function addMediaFiles(files: FileList | File[]) {
  const acceptedFiles = Array.from(files).filter(isAcceptedMediaFile);

  if (acceptedFiles.length === 0) {
    setError('Please select image or video files only.');
    return;
  }

  setSelectedMedia((prev) => {
    const next = [...prev];

    for (const file of acceptedFiles) {
      const exists = next.some(
        (item) =>
          item.file.name === file.name &&
          item.file.size === file.size &&
          item.file.lastModified === file.lastModified,
      );

      if (!exists) {
        next.push({
          file,
          previewUrl: URL.createObjectURL(file),
          name: getDefaultAltText(file.name),
          altText: getDefaultAltText(file.name),
        });
      }
    }

    return next;
  });
}

function handleMediaInputChange(e: ChangeEvent<HTMLInputElement>) {
  const files = e.target.files;
  if (!files?.length) return;

  addMediaFiles(files);
  e.target.value = '';
  setShowMediaPicker(true);
}

function moveArrayItem<T>(list: T[], fromIndex: number, toIndex: number) {
  const copy = [...list];
  const [removed] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, removed);
  return copy;
}
function updateSelectedMedia(index: number, key: 'name' | 'altText', value: string) {
  setSelectedMedia((prev) =>
    prev.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            [key]: value,
          }
        : item,
    ),
  );
}

function handleSelectedMediaDrop(fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return;

  setSelectedMedia((prev) => {
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= prev.length ||
      toIndex >= prev.length
    ) {
      return prev;
    }

    return moveArrayItem(prev, fromIndex, toIndex);
  });

  setSelectedMediaDragIndex(null);
}

function handleMediaDrop(index: number) {
  if (mediaDragIndex === null || mediaDragIndex === index) return;

  setMedia((prev) => moveArrayItem(prev, mediaDragIndex, index));
  setMediaDragIndex(null);
}

function removeSelectedMedia(index: number) {
  setSelectedMedia((prev) => {
    const removed = prev[index];
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    return prev.filter((_, itemIndex) => itemIndex !== index);
  });
}

function clearSelectedMedia() {
  selectedMedia.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  setSelectedMedia([]);
}

async function uploadSelectedMedia() {
  if (!currentProductId) {
    setError('Create the product first, then upload media.');
    return;
  }

  if (selectedMedia.length === 0) {
    setError('Select at least 1 media file to upload.');
    return;
  }

  setSaving(true);
  setError('');

  try {
    const imageFiles = selectedMedia
      .filter((item) => item.file.type.startsWith('image/'))
      .map((item) => item.file);

    const videoFiles = selectedMedia
      .filter((item) => item.file.type.startsWith('video/'))
      .map((item) => item.file);

    if (imageFiles.length > 0) {
      await adminCatalogService.uploadImages(currentProductId, imageFiles);
    }

    if (videoFiles.length > 0) {
      await adminCatalogService.uploadVideos(currentProductId, videoFiles);
    }

    clearSelectedMedia();
    await reloadProduct(currentProductId);
    await onReload?.();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setSaving(false);
  }
}

async function saveMediaOrder() {
    if (!currentProductId) return;

    const imageIds = media.map((item) => getMediaId(item)).filter(Boolean);

    if (imageIds.length === 0) {
      setError('Reorder save karne ke liye imageIds nahi mil rahi.');
      return;
    }

    try {
      await adminCatalogService.reorderImages(currentProductId, imageIds);
      await reloadProduct(currentProductId);
      await onReload?.();
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    }
  }

 async function deleteImage(imageId: string) {
  if (!confirm('Delete this image?')) return;

  try {
    await adminCatalogService.deleteImage(imageId);

    if (currentProductId) {
      await reloadProduct(currentProductId);
    }

    await onReload?.();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  }
}

  async function setPrimaryImage(imageId: string) {
    if (!currentProductId) return;

    try {
      await adminCatalogService.setPrimaryImage(currentProductId, imageId);
      await reloadProduct(currentProductId);
      await onReload?.();
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    }
  }

async function publishProduct() {
  if (!currentProductId) return;

  setSaving(true);
  setError('');

  try {
    await adminCatalogService.publish(currentProductId, {
      publishedAt: new Date().toISOString(),
    });

    await reloadProduct(currentProductId);
    await onReload?.();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setSaving(false);
  }
}
async function unpublishProduct() {
  if (!currentProductId) return;

  setSaving(true);
  setError('');

  try {
    await adminCatalogService.unpublish(currentProductId);

    await reloadProduct(currentProductId);
    await onReload?.();
  } catch (err: any) {
    setError(getApiErrorMessage(err));
  } finally {
    setSaving(false);
  }
}
  return (
    <div className="mx-auto max-w-[1500px]">
      <ApiError message={error} />

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
              {mode === 'create' ? 'Create catalog item' : 'Edit catalog item'}
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-950">
              {mode === 'create' ? 'Add product' : basicForm.title || 'Edit product'}
            </h1>

            {mode === 'edit' && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={product?.status || product?.publishStatus} />
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
                  ID: {currentProductId}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {mode === 'edit' && (
              <>
                <Button
  variant="secondary"
  onClick={() => unpublishProduct()}
  disabled={saving}
>
  Unpublish
</Button>

<Button onClick={() => publishProduct()} disabled={saving}>
  Publish
</Button>
              </>
            )}

            {mode === 'create' && (
              <Button onClick={() => createProduct()} disabled={saving}>
                {saving ? 'Creating...' : 'Save product'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-6">
          <Card className="p-0">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-bold text-gray-950">Product information</h2>
              <p className="mt-1 text-sm text-gray-500">
                Add the product title, SKU and rich description.
              </p>
            </div>

            <div className="px-5 py-5">
              <form
                onSubmit={mode === 'create' ? createProduct : saveBasic}
                className="space-y-4"
              >
                <Input
                  label="Title"
                  value={basicForm.title}
                  onChange={(e) => {
                    const nextTitle = e.target.value;

                    updateForm(setBasicForm, 'title', nextTitle);

                    if (!seoForm.metaTitle) {
                      setSeoForm((prev) => ({
                        ...prev,
                        metaTitle: nextTitle,
                      }));
                    }

                    if (!seoForm.urlHandle && !basicForm.slug) {
                      const autoSlug = makeSeoUrlHandle(nextTitle);

                      setBasicForm((prev) => ({
                        ...prev,
                        slug: autoSlug,
                      }));

                      setSeoForm((prev) => ({
                        ...prev,
                        urlHandle: autoSlug,
                      }));
                    }
                  }}
                />

                
                <Input
                  label="SKU"
                  value={basicForm.sku}
                  onChange={(e) => updateForm(setBasicForm, 'sku', e.target.value)}
                />

                <RichTextEditor
                  label="Description"
                  value={basicForm.description}
                  onChange={(value) => {
                    updateForm(setBasicForm, 'description', value);

                    if (!seoForm.metaDescription) {
                      setSeoForm((prev) => ({
                        ...prev,
                        metaDescription: stripHtml(value).slice(0, 160),
                      }));
                    }
                  }}
                  minHeight={260}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {mode === 'create' ? 'Save product' : 'Save title & description'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          <Card className="p-0">
  <div className="border-b border-gray-200 px-5 py-4">
    <h2 className="text-base font-bold text-gray-950">Media</h2>
  </div>

  <div className="px-5 py-5">
    <input
      id="product-media-input"
      name="media"
      type="file"
      accept="image/*,video/*"
      multiple
      className="hidden"
      onChange={handleMediaInputChange}
    />

    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={(e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);

        if (e.dataTransfer.files?.length) {
          addMediaFiles(e.dataTransfer.files);
          setShowMediaPicker(true);
        }
      }}
      className={`rounded-2xl border border-dashed p-4 transition ${
        dragActive
          ? 'border-black bg-gray-50'
          : 'border-gray-300 bg-white'
      }`}
    >
      {media.length === 0 ? (
        <div className="flex min-h-36 flex-col items-center justify-center gap-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <label
              htmlFor="product-media-input"
              className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
            >
              Upload new
            </label>

            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Select existing
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Accepts images, videos, or 3D models
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {media.map((item, index) => {
            const mediaId = getMediaId(item);
            const mediaUrl = getMediaUrl(item);
            const isVideo = isVideoMedia(item);
            const active = activeMediaIndex === index;

            return (
              <button
                key={mediaId || mediaUrl || index}
                type="button"
                draggable
                onDragStart={() => setMediaDragIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.opacity = '0.5';
                  e.currentTarget.style.borderColor = 'black';
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.borderColor = '';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.borderColor = '';
                  handleMediaDrop(index);
                }}
                onClick={() => setActiveMediaIndex(index)}
                className={`group relative cursor-move overflow-hidden rounded-xl border bg-white p-1 transition hover:border-black ${
                  active ? 'border-black ring-2 ring-black/10' : 'border-gray-200'
                }`}
              >
                {mediaUrl ? (
                  isVideo ? (
                    <video
                      src={mediaUrl}
                      
                      className="h-28 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={
                        mediaEdits[getMediaEditKey(item, index)]?.altText ||
                        item?.altText ||
                        item?.alt ||
                        'media'
                      }
                      className="h-28 w-full rounded-lg object-cover"
                    />
                  )
                ) : (
                  <div className="flex h-28 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                    Media
                  </div>
                )}

                {isVideo && (
                  <span className="absolute inset-0 flex items-center justify-center text-white">
                    ▶
                  </span>
                )}

                <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                  {index + 1}
                </span>
              </button>
            );
          })}

          <button
  type="button"
  onClick={() => setShowMediaPicker(true)}
  className="flex h-[122px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-2xl text-gray-600 transition hover:border-black hover:bg-gray-50"
>
  +
</button>
        </div>
      )}
    </div>

    {media.length > 0 && (
      <div className="mt-4 flex justify-end">
        <Button
          variant="secondary"
          onClick={saveMediaOrder}
          disabled={media.length === 0}
        >
          Save order
        </Button>
      </div>
    )}

    {activeMediaIndex !== null && media[activeMediaIndex] && (
      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {(() => {
          const item = media[activeMediaIndex];
          const mediaId = getMediaId(item);
          const mediaUrl = getMediaUrl(item);
          const isVideo = isVideoMedia(item);
          const editKey = getMediaEditKey(item, activeMediaIndex);

          return (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-2xl bg-gray-50 p-4">
                {mediaUrl ? (
                  isVideo ? (
                    <video
                      src={mediaUrl}
                      className="max-h-[520px] w-full rounded-xl object-contain"
                      controls
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={mediaEdits[editKey]?.altText || 'media'}
                      className="max-h-[520px] w-full rounded-xl object-contain"
                    />
                  )
                ) : (
                  <div className="flex h-80 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                    Media preview
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-950">
                      Media details
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Edit name and alt text for this media.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveMediaIndex(null)}
                    className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-gray-700">
                      Name
                    </span>

                    <input
                      value={mediaEdits[editKey]?.name || ''}
                      onChange={(e) =>
                        updateMediaEdit(editKey, 'name', e.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-black focus:ring-4 focus:ring-black/10"
                      placeholder="Media name"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-gray-700">
                      Alt text
                    </span>

                    <textarea
                      value={mediaEdits[editKey]?.altText || ''}
                      onChange={(e) =>
                        updateMediaEdit(editKey, 'altText', e.target.value)
                      }
                      className="min-h-32 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-black focus:ring-4 focus:ring-black/10"
                      placeholder="Describe this image for accessibility and SEO"
                    />
                  </label>

                  <div className="space-y-1 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
                    <p>Order: #{activeMediaIndex + 1}</p>
                    <p>ID: {mediaId || '-'}</p>
                    <p>Type: {isVideo ? 'Video' : 'Image'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={!mediaId}
                      onClick={() => saveMediaMetadata(item, activeMediaIndex)}
                    >
                      Save details
                    </Button>

                    <Button
                      disabled={!mediaId}
                      variant="secondary"
                      onClick={() => setPrimaryImage(mediaId)}
                    >
                      Primary
                    </Button>

                    <Button
                      disabled={!mediaId}
                      variant="danger"
                      onClick={() => deleteImage(mediaId)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    )}
  </div>
</Card>

{showMediaPicker && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-bold text-gray-950">Select file</h2>

        <button
          type="button"
          onClick={() => setShowMediaPicker(false)}
          className="rounded-lg px-2 py-1 text-xl text-gray-500 hover:bg-gray-100"
        >
          ×
        </button>
      </div>

      <div className="border-b border-gray-200 px-5 py-4">
        <input
          className="h-10 w-full max-w-xl rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-black"
          placeholder="Search files"
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragActive(false);

            if (e.dataTransfer.files?.length) {
              addMediaFiles(e.dataTransfer.files);
            }
          }}
          className={`mt-4 rounded-2xl border border-dashed p-8 text-center ${
            dragActive ? 'border-black bg-gray-50' : 'border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <label
              htmlFor="product-media-input"
              className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
            >
              Add media
            </label>

            <button
              type="button"
              className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700"
            >
              Generate image
            </button>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Drag and drop images, videos, 3D models, and files
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {selectedMedia.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">
            No new media selected yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {selectedMedia.map((item, index) => (
              <div
  key={`${item.file.name}-${item.file.lastModified}-${index}`}
  onDragOver={(e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-black', 'bg-gray-50');
  }}
  onDragLeave={(e) => {
    e.currentTarget.classList.remove('border-black', 'bg-gray-50');
  }}
  onDrop={(e) => {
    e.preventDefault();

    const fromIndex = Number(e.dataTransfer.getData('text/plain'));

    e.currentTarget.classList.remove('border-black', 'bg-gray-50');

    if (Number.isNaN(fromIndex)) return;

    handleSelectedMediaDrop(fromIndex, index);
  }}
  className={`rounded-2xl border bg-white p-2 shadow-sm transition ${
    selectedMediaDragIndex === index
      ? 'border-black opacity-60'
      : 'border-gray-200'
  }`}
>
                <div className="relative overflow-hidden rounded-xl bg-gray-50">
                  <div className="mb-2 flex items-center justify-between">
  <button
    type="button"
    draggable
    onDragStart={(e) => {
      setSelectedMediaDragIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    }}
    onDragEnd={() => setSelectedMediaDragIndex(null)}
    className="cursor-grab rounded-lg px-2 py-1 text-sm text-gray-400 hover:bg-gray-100 active:cursor-grabbing"
    title="Drag to reorder"
  >
    ⋮⋮
  </button>

  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
    #{index + 1}
  </span>
</div>
                  {item.file.type.startsWith('video/') ? (
                    <video
                      src={item.previewUrl}
                      draggable={false}
                      className="h-32 w-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.previewUrl}
                      draggable={false}
                      alt={item.altText || item.name}
                      className="h-32 w-full object-cover"
                    />
                  )}

                  <button
  type="button"
  draggable={false}
  onClick={(e) => {
    e.stopPropagation();
    removeSelectedMedia(index);
  }}
  className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white"
>
  ×
</button>
                </div>

                <p className="mt-2 truncate text-xs font-medium text-gray-700">
                  {item.name || item.file.name}
                </p>

                <p className="text-xs text-gray-400">
                  {item.file.type.startsWith('video/') ? 'Video' : 'Image'}
                </p>

                <input
  value={item.name}
  onChange={(e) => updateSelectedMedia(index, 'name', e.target.value)}
  className="mt-2 h-8 w-full rounded-lg border border-gray-200 px-2 text-xs outline-none"
  placeholder="Name"
/>

<textarea
  value={item.altText}
  onChange={(e) => updateSelectedMedia(index, 'altText', e.target.value)}
  className="mt-2 min-h-14 w-full rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none"
  placeholder="Alt text"
/>

              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4">
        <Button
          variant="secondary"
          onClick={() => {
            setShowMediaPicker(false);
          }}
        >
          Cancel
        </Button>

        <Button
          disabled={selectedMedia.length === 0}
          onClick={async () => {
            await uploadSelectedMedia();
            setShowMediaPicker(false);
          }}
        >
          Done
        </Button>
      </div>
    </div>
  </div>
)}

<Card>
  <ProductCategoryTreeSelector
    categories={categoryTree}
    selectedCategoryIds={selectedCategoryIds}
    primaryCategoryId={primaryCategoryId}
    onSelectedChange={setSelectedCategoryIds}
    onPrimaryChange={setPrimaryCategoryId}
    onAddCategory={addCategoryFromProductEditor}
  />

  {mode === 'edit' && (
    <div className="mt-4 flex justify-end">
      <Button type="button" onClick={saveCategories} disabled={saving}>
        Save categories
      </Button>
    </div>
  )}
</Card>


          <VariantOptionsEditor
            variants={variants}
            productSku={basicForm.sku}
            defaultPrice={pricingForm.price}
            onCreateVariant={async (payload) => {
              if (!currentProductId) {
                setError('Pehle product create karo, phir variant create hoga.');
                return;
              }

              await adminCatalogService.createVariant(currentProductId, {
                size: payload.size,
                color: payload.color,
                chest: 0,
                waist: 0,
                hip: 0,
                length: 0,
                sleeve: 0,
                shoulder: 0,
                fitType: 'regular',
                price: payload.price,
                compareAtPrice: Number(pricingForm.compareAtPrice || 0),
                stock: payload.stock,
                sku: payload.sku,
                barcode: '',
                weight: 0,
                weightUnit: 'kg',
                isAvailable: payload.stock > 0,
                isShipsNow: true,
                productionType: 'READY_STOCK',
              });

              await reloadProduct(currentProductId);
              await onReload?.();
            }}
            onDeleteVariant={async (variantId) => {
              if (!currentProductId) return;

              if (!confirm('Delete this variant?')) return;

              await adminCatalogService.deleteVariant(currentProductId, variantId);
              await reloadProduct(currentProductId);
              await onReload?.();
            }}
            onUpdateStock={async (variantId, stock) => {
              if (!currentProductId) return;

              const numericStock = Number(stock || 0);

              await adminCatalogService.updateVariantStock(currentProductId, variantId, {
                stock: numericStock,
                isAvailable: numericStock > 0,
              });

              await reloadProduct(currentProductId);
              await onReload?.();
            }}
          />


     <ProductMetafieldsEditor
 initialValues={productMetafields}
 onChange={setProductMetafields}
 currentProductId={currentProductId}
 selectedMetafieldProducts={selectedMetafieldProducts}
 onBrowseProducts={(field: string) =>
    openProductMetafieldPicker(field as ProductPickerMetafield)
  }
  onRemoveProduct={(field: string, id: string) =>
    removeProductFromMetafield(field as ProductPickerMetafield, id)
  }
/>
{showSimilarProductPicker && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
 <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
 <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
 <h2 className="text-base font-bold text-gray-950">
 {getPickerTitle(activeProductPickerField)}
 </h2>
 <button
 type="button"
 onClick={() => setShowSimilarProductPicker(false)}
 className="rounded-lg px-2 py-1 text-xl text-gray-500 hover:bg-gray-100"
 >
 x
 </button>
 </div>
 <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-5 py-4">
  <input
    value={similarProductSearch}
    onChange={(e) => setSimilarProductSearch(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        loadSimilarPickerProducts(similarProductSearch);
      }
    }}
    className="h-11 min-w-[260px] flex-1 rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-black"
    placeholder="Search products"
  />

  <select
    value={similarProductFilter}
    onChange={(e) => {
      setSimilarProductFilter(e.target.value as any);
      setSimilarFilterValue('');
    }}
    className="h-11 rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-black"
  >
    <option value="all">All</option>
    <option value="category">Category / Subcategory</option>
    <option value="type">Type</option>
    <option value="tag">Tag</option>
    <option value="vendor">Vendor</option>
  </select>

  {similarProductFilter !== 'all' && (
    <select
      value={similarFilterValue}
      onChange={(e) => setSimilarFilterValue(e.target.value)}
      className="h-11 min-w-[180px] rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-black"
    >
      <option value="">Select {similarProductFilter}</option>
      {getUniquePickerValues(similarProductFilter).map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </select>
  )}

  <select
    value={similarPickerStatus}
    onChange={(e) => setSimilarPickerStatus(e.target.value as any)}
    className="h-11 rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-black"
  >
    <option value="all">All status</option>
    <option value="active">Active</option>
    <option value="draft">Draft</option>
    <option value="unlisted">Unlisted</option>
  </select>

  <Button
    type="button"
    variant="secondary"
    onClick={() => loadSimilarPickerProducts(similarProductSearch)}
  >
    Apply
  </Button>
</div>
 <div className="flex-1 overflow-y-auto px-5 py-3">
 {similarPickerLoading ? (
 <p className="py-10 text-center text-sm text-gray-500">Loading products...</p>
 ) : filteredSimilarPickerProducts.length === 0 ? (
 <p className="py-10 text-center text-sm text-gray-500">No products found.</p>
 ) : (
 filteredSimilarPickerProducts.map((product) => {
 const id = getProductId(product);
 const title = getProductTitle(product);
 const image = getProductImage(product);
 const checked = selectedSimilarProductIds.includes(id);
 return (
 <label
 key={id}
 className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-1 py-3 hover:bg-gray-50"
 >
 <input
 type="checkbox"
 checked={checked}
 onChange={() => toggleSimilarProduct(product)}
 className="h-4 w-4"
 />
 <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
 {image ? (
 <img src={image} alt={title} className="h-full w-full object-cover" />
 ) : (
 <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray400">
 {title.charAt(0).toUpperCase()}
 </div>
 )}
 </div>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-semibold text-gray-950">{title}</p>
 
 </div>
 </label>
 );
 })
 )}
 </div>
 <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-4">
 <p className="text-sm text-gray-500">{selectedSimilarProductIds.length} selected</p>
 <div className="flex gap-2">
 <Button variant="secondary" onClick={() => setShowSimilarProductPicker(false)}>
 Cancel
 </Button>
 <Button onClick={addSelectedSimilarProducts}>Done</Button>
 </div>
 </div>
 </div>
 </div>
)}




<div className="mt-4 flex justify-end">
  <Button
    type="button"
    onClick={saveProductMetafields}
    disabled={saving || !currentProductId}
  >
    {saving ? 'Saving...' : 'Save product metafields'}
  </Button>
</div>

          <Card className="overflow-hidden p-0">
  <div className="border-b px-5 py-4">
    <h2 className="text-base font-semibold">Search engine listing</h2>
  </div>

  <div className="px-5 py-4">
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-gray-800">
        {STOREFRONT_DISPLAY_DOMAIN}
      </p>

      <p className="mt-1 break-all text-sm text-gray-500">
        {getPreviewBreadcrumbUrl()}
      </p>

      <p className="mt-2 text-xl font-medium leading-snug text-blue-700">
        {getPreviewTitle()}
      </p>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {getPreviewDescription()}
      </p>

      {pricingForm.price && (
        <p className="mt-2 text-sm text-gray-600">
          ₹{pricingForm.price} INR
        </p>
      )}
    </div>
  </div>

  <form onSubmit={saveSeo} className="border-t px-5 py-4">
    <div className="space-y-5">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Page title</span>

        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          value={seoForm.metaTitle}
          maxLength={70}
          onChange={(e) =>
            setSeoForm((prev) => ({
              ...prev,
              metaTitle: e.target.value,
            }))
          }
        />

        <p className="mt-1 text-xs text-gray-500">
          {seoForm.metaTitle.length} of 70 characters used
        </p>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Meta description</span>

        <textarea
          className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          value={seoForm.metaDescription}
          maxLength={160}
          onChange={(e) =>
            setSeoForm((prev) => ({
              ...prev,
              metaDescription: e.target.value,
            }))
          }
        />

        <p className="mt-1 text-xs text-gray-500">
          {seoForm.metaDescription.length} of 160 characters used
        </p>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">URL handle</span>

        <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:border-black">
          <span className="flex items-center border-r bg-gray-50 px-3 text-sm text-gray-500">
            {PRODUCT_URL_PREFIX}/
          </span>

          <input
            className="w-full px-3 py-2 text-sm outline-none"
            value={seoForm.urlHandle}
            onChange={(e) => {
  const inputUrlHandle = sanitizeSeoUrlInput(e.target.value);

  setSeoForm((prev) => ({
    ...prev,
    urlHandle: inputUrlHandle,
  }));

  setBasicForm((prev) => ({
    ...prev,
    slug: inputUrlHandle,
  }));
}}
            
          />
        </div>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-all text-xs text-gray-500">
            {getPreviewFullUrl()}
          </p>

        </div>
      </label>

      {mode === 'edit' && (
        <div className="flex justify-end">
          <Button type="submit">Save SEO</Button>
        </div>
      )}
    </div>
  </form>
</Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-base font-bold text-gray-950">Status</h2>

<form onSubmit={saveStatus} className="mt-4 space-y-4">              <label className="block">
                <span className="mb-1 block text-sm font-medium">Status</span>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={availabilityForm.status}
                  onChange={(e) =>
                    updateForm(setAvailabilityForm, 'status', e.target.value)
                  }
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="UNLISTED">Unlisted</option>
                </select>
              </label>

              {mode === 'edit' && (
                <div className="flex justify-end">
                  <Button type="submit">Save status</Button>
                </div>
              )}
            </form>
          </Card>

          <Card>
            <h2 className="text-base font-bold text-gray-950">Publishing</h2>
            <p className="mt-3 text-sm text-gray-500">All channels</p>
          </Card>

          <Card>
            <h2 className="text-base font-bold text-gray-950">Product organization</h2>

            <form onSubmit={saveOrganization} className="mt-4 space-y-4">
              
              <Input
                label="Product Type"
                value={organizationForm.productType || ''}
                onChange={(e) =>
                  updateForm(setOrganizationForm, 'productType', e.target.value)
                }
              />

              <Input
                label="Vendor"
                value={organizationForm.vendor || ''}
                onChange={(e) =>
                  updateForm(setOrganizationForm, 'vendor', e.target.value)
                }
              />

             

              <label className="block">
  <span className="mb-1 block text-sm font-medium">Tags</span>

  <div className="min-h-32 w-full rounded-lg border px-3 py-2 text-sm">
    <div className="mb-2 flex flex-wrap gap-2">
      {organizationForm.tags
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean)
        .map((tag: string) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
          >
            {tag}
          </span>
        ))}
    </div>

    <textarea
      className="min-h-20 w-full resize-none border-0 p-0 text-sm outline-none"
      value={organizationForm.tags}
      onChange={(e) =>
        updateForm(setOrganizationForm, 'tags', e.target.value)
      }
      placeholder="Comma separated tags"
    />
  </div>
</label>

              {mode === 'edit' && (
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving || !currentProductId}>
  {saving ? 'Saving...' : 'Save organization'}
</Button>
                </div>
              )}
            </form>
          </Card>

          <Card>
            <h2 className="text-base font-bold text-gray-950">Pricing</h2>

            <form onSubmit={savePricing} className="mt-4 space-y-4">
              <Input
                label="Price"
                value={pricingForm.price}
                onChange={(e) => updateForm(setPricingForm, 'price', e.target.value)}
              />

              <Input
                label="Compare at price"
                value={pricingForm.compareAtPrice}
                onChange={(e) =>
                  updateForm(setPricingForm, 'compareAtPrice', e.target.value)
                }
              />

              <Input
                label="Rental price"
                value={pricingForm.rentalPrice}
                onChange={(e) =>
                  updateForm(setPricingForm, 'rentalPrice', e.target.value)
                }
              />

              <Input
                label="Deposit amount"
                value={pricingForm.depositAmount}
                onChange={(e) =>
                  updateForm(setPricingForm, 'depositAmount', e.target.value)
                }
              />

              {mode === 'edit' && (
                <div className="flex justify-end">
                  <Button type="submit">Save pricing</Button>
                </div>
              )}
            </form>
          </Card>


          <Card>
            <h2 className="text-base font-bold text-gray-950">Commerce settings</h2>

            <form onSubmit={saveCommerce} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Shop enabled</span>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={commerceForm.isShopEnabled}
                  onChange={(e) =>
                    updateForm(setCommerceForm, 'isShopEnabled', e.target.value)
                  }
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">Rental enabled</span>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={commerceForm.isRentalEnabled}
                  onChange={(e) =>
                    updateForm(setCommerceForm, 'isRentalEnabled', e.target.value)
                  }
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">Resale enabled</span>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={commerceForm.isResaleEnabled}
                  onChange={(e) =>
                    updateForm(setCommerceForm, 'isResaleEnabled', e.target.value)
                  }
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </label>

              {mode === 'edit' && (
                <div className="flex justify-end">
                  <Button type="submit">Save commerce</Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}