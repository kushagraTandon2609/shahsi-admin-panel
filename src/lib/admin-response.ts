export function unwrapList(response: any): any[] {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.data,
    response?.items,
    response?.products,
    response?.categories,
    response?.collections,
    response?.media,
    response?.images,
    response?.videos,
    response?.variants,
    response?.result,
    response?.rows,
    response?.records,
    response?.list,
    response?.values,

    response?.data?.data,
    response?.data?.items,
    response?.data?.products,
    response?.data?.categories,
    response?.data?.collections,
    response?.data?.media,
    response?.data?.images,
    response?.data?.videos,
    response?.data?.variants,
    response?.data?.result,
    response?.data?.rows,
    response?.data?.records,
    response?.data?.list,
    response?.data?.values,

    response?.data?.data?.items,
    response?.data?.data?.products,
    response?.data?.data?.categories,
    response?.data?.data?.collections,
    response?.data?.data?.media,
    response?.data?.data?.images,
    response?.data?.data?.variants,

    response?.result?.data,
    response?.result?.items,
    response?.result?.products,
    response?.result?.categories,
    response?.result?.collections,
    response?.result?.rows,
    response?.result?.records,
    response?.result?.list,
    response?.result?.values,

    response?.payload?.data,
    response?.payload?.items,
    response?.payload?.products,
    response?.payload?.categories,
    response?.payload?.collections,
    response?.payload?.rows,
    response?.payload?.records,
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) return item;
  }

  return [];
}

export function unwrapObject(response: any): any {
  if (!response) return {};

  const candidates = [
    response?.data,
    response?.result,
    response?.item,
    response?.product,
    response?.category,
    response?.collection,
    response?.record,
    response?.payload,

    response?.data?.data,
    response?.data?.result,
    response?.data?.item,
    response?.data?.product,
    response?.data?.category,
    response?.data?.collection,
    response?.data?.record,

    response?.data?.data?.item,
    response?.data?.data?.product,
    response?.data?.data?.category,
    response?.data?.data?.collection,

    response?.result?.data,
    response?.result?.item,
    response?.result?.product,
    response?.result?.category,
    response?.result?.collection,
    response?.result?.record,
  ];

  for (const item of candidates) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      return item;
    }
  }

  return response;
}
export function getProductImage(product: any) {
  const image =
    product?.imageUrl ||
    product?.image ||
    product?.thumbnail ||
    product?.thumbnailUrl ||
    product?.primaryImage ||
    product?.primaryImageUrl ||
    product?.media?.[0]?.url ||
    product?.media?.[0]?.secureUrl ||
    product?.images?.find?.((item: any) => item?.isPrimary)?.secureUrl ||
    product?.images?.find?.((item: any) => item?.isPrimary)?.url ||
    product?.images?.[0]?.secureUrl ||
    product?.images?.[0]?.url ||
    product?.raw?.imageUrl ||
    product?.raw?.image ||
    product?.raw?.thumbnail ||
    product?.raw?.primaryImage ||
    product?.raw?.images?.find?.((item: any) => item?.isPrimary)?.secureUrl ||
    product?.raw?.images?.find?.((item: any) => item?.isPrimary)?.url ||
    product?.raw?.images?.[0]?.secureUrl ||
    product?.raw?.images?.[0]?.url ||
    '';

  if (typeof image === 'string') return image;

  return image?.secureUrl || image?.url || '';
}
export function extractToken(response: any): string {
  return (
    response?.accessToken ||
    response?.token ||
    response?.access_token ||
    response?.jwt ||
    response?.data?.accessToken ||
    response?.data?.token ||
    response?.data?.access_token ||
    response?.data?.jwt ||
    response?.data?.data?.accessToken ||
    response?.data?.data?.token ||
    response?.result?.accessToken ||
    response?.result?.token ||
    response?.result?.access_token ||
    response?.result?.jwt ||
    response?.user?.accessToken ||
    response?.user?.token ||
    ''
  );
}

export function getApiErrorMessage(error: any): string {
  const rawMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.details ||
    error?.response?.data?.errors ||
    error?.response?.data?.data?.message ||
    error?.response?.data?.data?.error ||
    error?.message ||
    'Something went wrong';

  if (Array.isArray(rawMessage)) {
    return rawMessage
      .map((item) => {
        if (typeof item === 'string') return item;

        if (item?.message) return item.message;
        if (item?.error) return item.error;

        try {
          return JSON.stringify(item);
        } catch {
          return String(item);
        }
      })
      .join(', ');
  }

  if (typeof rawMessage === 'object' && rawMessage !== null) {
    try {
      return JSON.stringify(rawMessage);
    } catch {
      return 'Something went wrong';
    }
  }

  return String(rawMessage);
}

function getFirstImageUrl(product: any) {
  const imageCandidates = [
    product?.image,
    product?.thumbnail,
    product?.coverImage,
    product?.primaryImage,
    product?.imageUrl,
    product?.mediaUrl,

    product?.images?.[0],
    product?.media?.[0],
    product?.productImages?.[0],
    product?.gallery?.[0],
    product?.assets?.[0],
  ];

  for (const item of imageCandidates) {
    if (!item) continue;

    if (typeof item === 'string') return item;

    const url =
      item?.url ||
      item?.secureUrl ||
      item?.secure_url ||
      item?.imageUrl ||
      item?.src ||
      item?.path ||
      item?.mediaUrl ||
      item?.fileUrl ||
      item?.cloudinaryUrl ||
      item?.thumbnail ||
      item?.previewUrl ||
      item?.assetUrl ||
      item?.originalUrl;

    if (url) return url;
  }

  return '';
}

function getTotalVariantStock(product: any) {
  if (!Array.isArray(product?.variants)) return '';

  return product.variants.reduce((total: number, variant: any) => {
    return total + Number(variant?.stock || variant?.quantity || 0);
  }, 0);
}

export function normalizeProduct(product: any) {
  const image = getFirstImageUrl(product);

  const price =
    product?.price ??
    product?.sellingPrice ??
    product?.salePrice ??
    product?.basePrice ??
    product?.rentalPrice ??
    product?.listingPrice ??
    product?.variants?.[0]?.price ??
    '';

  const variantStock = getTotalVariantStock(product);

  const stock =
    product?.stock ??
    product?.quantity ??
    product?.totalStock ??
    product?.inventory ??
    product?.availableStock ??
    variantStock ??
    product?.variants?.[0]?.stock ??
    product?.variants?.[0]?.quantity ??
    '';

  return {
    raw: product,
    id: product?.id || product?.productId || product?._id || product?.uuid || '',
    title:
      product?.title ||
      product?.name ||
      product?.productName ||
      product?.displayName ||
      'Unnamed Product',
    sku:
      product?.sku ||
      product?.styleCode ||
      product?.productCode ||
      product?.code ||
      '-',
    price,
    stock,
    productType:
  product?.productType ||
  product?.type ||
  product?.raw?.productType ||
  product?.raw?.type ||
  product?.product_type ||
  product?.productKind ||
  product?.silhouette ||
  '',

    status:
      product?.status ||
      product?.publishStatus ||
      product?.productStatus ||
      product?.state ||
      'UNKNOWN',
    image,
    category:
      product?.category ||
      product?.categoryName ||
      product?.primaryCollection ||
      product?.collection ||
      '',
    vendor:
  product?.vendor ||
  product?.vendorName ||
  product?.brand ||
  product?.brandName ||
  '',
brand:
  product?.brand ||
  product?.vendor ||
  '',


slug: product?.slug || product?.handle || product?.urlHandle || '',
  };
}

export function formatCategoryName(value: any) {
  const text = String(value || '').trim();

  if (!text) return '';

  return text
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}