'use client';

import { useMemo, useState } from 'react';
import {
  Layers3,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/admin/Button';

type VariantOption = {
  id: string;
  name: string;
  values: string[];
  valuesInput: string;
  isEditing?: boolean;
};

type GeneratedVariant = {
  id: string;
  optionValues: Record<string, string>;
  title: string;
  sku: string;
  price: string;
  stock: string;
};

type VariantOptionsEditorProps = {
  variants: any[];
  productSku?: string;
  defaultPrice?: string | number;
  onCreateVariant: (payload: {
    size: string;
    color: string;
    sku: string;
    price: number;
    stock: number;
  }) => Promise<void>;
  onDeleteVariant: (variantId: string) => Promise<void>;
  onUpdateStock: (variantId: string, stock: string) => Promise<void>;
};

const RECOMMENDED_OPTIONS = [
  'Size',
  'Color',
  'Fabric',
  'Age group',
  'Care instructions',
  'Clothing features',
  'Dress occasion',
  'Dress style',
  'Fit',
  'Length',
  'Material',
  'Neckline',
  'Pattern',
  'Sleeve',
  'Waist',
];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function splitValues(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanSkuPart(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getVariantId(variant: any) {
  return String(variant?.id || variant?.variantId || variant?._id || '');
}

function getVariantSize(variant: any) {
  return variant?.size || variant?.optionValues?.Size || variant?.optionValues?.size || '';
}

function getVariantColor(variant: any) {
  return variant?.color || variant?.optionValues?.Color || variant?.optionValues?.color || '';
}

function getVariantPrice(variant: any) {
  return variant?.price || variant?.basePrice || '';
}

function getVariantStock(variant: any) {
  return variant?.stock ?? variant?.quantity ?? 0;
}

function cartesianProduct(options: VariantOption[]) {
  const validOptions = options.filter(
    (option) => option.name.trim() && option.values.length > 0,
  );

  if (validOptions.length === 0) return [];

  return validOptions.reduce<Record<string, string>[]>((acc, option) => {
    const values = option.values.length > 0 ? option.values : [''];

    if (acc.length === 0) {
      return values.map((value) => ({
        [option.name]: value,
      }));
    }

    return acc.flatMap((combination) =>
      values.map((value) => ({
        ...combination,
        [option.name]: value,
      })),
    );
  }, []);
}

export function VariantOptionsEditor({
  variants = [],
  productSku = '',
  defaultPrice = '',
  onCreateVariant,
  onDeleteVariant,
  onUpdateStock,
}: VariantOptionsEditorProps) {
  const [options, setOptions] = useState<VariantOption[]>([
  {
    id: createId(),
    name: 'Size',
    values: [],
    valuesInput: '',
    isEditing: true,
  },
]);
const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [showOptionPicker, setShowOptionPicker] = useState(false);
  const [optionSearch, setOptionSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [draftOverrides, setDraftOverrides] = useState<
    Record<string, Partial<GeneratedVariant>>
  >({});

  const filteredRecommendedOptions = RECOMMENDED_OPTIONS.filter((item) =>
    item.toLowerCase().includes(optionSearch.toLowerCase()),
  );

  const generatedVariants: GeneratedVariant[] = useMemo(() => {
    const combinations = cartesianProduct(options);

    return combinations.map((optionValues, index) => {
      const title =
        Object.values(optionValues).filter(Boolean).join(' / ') ||
        `Variant ${index + 1}`;

      const size =
        optionValues.Size ||
        optionValues.size ||
        optionValues.Length ||
        optionValues.Fit ||
        '';

      const color = optionValues.Color || optionValues.color || '';

      const skuParts = [
        productSku || 'SKU',
        color ? cleanSkuPart(color) : '',
        size ? cleanSkuPart(size) : '',
        index + 1,
      ].filter(Boolean);

      const id = `${title}-${index}`;

      return {
        id,
        optionValues,
        title,
        sku: skuParts.join('-'),
        price: String(defaultPrice || ''),
        stock: '0',
        ...draftOverrides[id],
      };
    });
  }, [options, productSku, defaultPrice, draftOverrides]);

  function updateDraft(id: string, key: keyof GeneratedVariant, value: string) {
    setDraftOverrides((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  }

  function closeOptionPicker() {
    setShowOptionPicker(false);
    setOptionSearch('');
  }

  function addRecommendedOption(name: string) {
    const alreadyExists = options.some(
      (option) => option.name.toLowerCase() === name.toLowerCase(),
    );

    if (alreadyExists) {
      closeOptionPicker();
      return;
    }

    setOptions((prev) => [
      ...prev,
      {
  id: createId(),
  name,
  values: name === 'Color' ? ['Black'] : [],
  valuesInput: name === 'Color' ? 'Black' : '',
  isEditing: true,
},
    ]);

    closeOptionPicker();
  }

  function addCustomOption() {
    setOptions((prev) => [
      ...prev,
      {
  id: createId(),
  name: '',
  values: [],
  valuesInput: '',
  isEditing: true,
},
    ]);

    closeOptionPicker();
  }

  function updateOptionName(optionId: string, name: string) {
    setOptions((prev) =>
      prev.map((option) =>
        option.id === optionId
          ? {
              ...option,
              name,
            }
          : option,
      ),
    );
  }

 function updateOptionValues(optionId: string, value: string) {
  setOptions((prev) =>
    prev.map((option) =>
      option.id === optionId
        ? {
            ...option,
            valuesInput: value,
            values: splitValues(value),
          }
        : option,
    ),
  );
}

  function deleteOption(optionId: string) {
    setOptions((prev) => {
      const next = prev.filter((option) => option.id !== optionId);

      return next.length > 0
        ? next
        : [
            {
  id: createId(),
  name: 'Size',
  values: [],
  valuesInput: '',
  isEditing: true,
},
          ];
    });
  }

  function doneEditing(optionId: string) {
    setOptions((prev) =>
      prev.map((option) =>
        option.id === optionId
          ? {
              ...option,
              isEditing: false,
            }
          : option,
      ),
    );
  }

  function startEditing(optionId: string) {
    setOptions((prev) =>
      prev.map((option) =>
        option.id === optionId
          ? {
              ...option,
              isEditing: true,
            }
          : option,
      ),
    );
  }

  async function saveGeneratedVariants() {
    if (generatedVariants.length === 0) return;

    setSaving(true);
    setActionError('');

    try {
      for (const variant of generatedVariants) {
        await onCreateVariant({
          size:
            variant.optionValues.Size ||
            variant.optionValues.size ||
            variant.optionValues.Length ||
            variant.optionValues.Fit ||
            '',
          color: variant.optionValues.Color || variant.optionValues.color || '',
          sku: variant.sku,
          price: Number(variant.price || 0),
          stock: Number(variant.stock || 0),
        });
      }

      setDraftOverrides({});
      setOptions([
        {
  id: createId(),
  name: 'Size',
  values: [],
  valuesInput: '',
  isEditing: true,
},
      ]);
    } catch (err: any) {
      setActionError(err?.message || 'Unable to save variants.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVariant(variantId: string) {
    if (!variantId) return;

    setSaving(true);
    setActionError('');

    try {
      await onDeleteVariant(variantId);
    } catch (err: any) {
      setActionError(err?.message || 'Unable to delete variant.');
    } finally {
      setSaving(false);
    }
  }

  const savedVariantIds = variants
  .map((variant: any) => getVariantId(variant))
  .filter(Boolean);

const allSavedVariantsSelected =
  savedVariantIds.length > 0 &&
  savedVariantIds.every((id) => selectedVariantIds.includes(id));

function toggleAllSavedVariants() {
  if (allSavedVariantsSelected) {
    setSelectedVariantIds([]);
    return;
  }

  setSelectedVariantIds(savedVariantIds);
}

function toggleSavedVariant(variantId: string) {
  if (!variantId) return;

  setSelectedVariantIds((prev) =>
    prev.includes(variantId)
      ? prev.filter((id) => id !== variantId)
      : [...prev, variantId],
  );
}

  async function handleStockBlur(variantId: string, stock: string) {
    if (!variantId) return;

    setActionError('');

    try {
      await onUpdateStock(variantId, stock);
    } catch (err: any) {
      setActionError(err?.message || 'Unable to update variant stock.');
    }
  }

  return (
    <div className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
            <Layers3 size={18} />
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-950">Variants</h2>
            <p className="mt-1 text-sm text-gray-500">
              Add size, color, price, SKU and stock variants for this product.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowOptionPicker((prev) => !prev)}
        >
          <span className="flex items-center gap-2">
            <Plus size={16} />
            Add variant
          </span>
        </Button>
      </div>

      {actionError && (
        <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="border-b border-gray-200 bg-gray-50/40 px-5 py-4">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {options.map((option, index) => (
            <div key={option.id} className="border-b border-gray-100 last:border-b-0">
              {!option.isEditing ? (
                <div className="flex items-start gap-4 px-4 py-4 transition hover:bg-gray-50/70">
                  <div className="pt-1 text-lg leading-none text-gray-300">::</div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-950">
                        {option.name || 'Option'}
                      </p>

                      {index === 0 && (
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {option.values.length === 0 ? (
                        <span className="text-sm text-gray-400">
                          No values added
                        </span>
                      ) : (
                        option.values.map((value) => (
                          <span
                            key={value}
                            className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-sm font-medium text-gray-800"
                          >
                            {value}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => startEditing(option.id)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 px-4 py-4">
                  <div className="flex items-start gap-4">
                    <div className="pt-9 text-lg leading-none text-gray-300">::</div>

                    <div className="flex-1 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-gray-800">
                          Option name
                        </span>

                        <input
                          className={`h-10 w-full rounded-xl border px-3 text-sm shadow-sm outline-none transition focus:ring-4 ${
                            !option.name
                              ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500/10'
                              : 'border-gray-200 bg-white focus:border-black focus:ring-black/10'
                          }`}
                          value={option.name}
                          placeholder="Size"
                          onChange={(e) => updateOptionName(option.id, e.target.value)}
                        />

                        {!option.name && (
                          <p className="mt-1.5 text-xs font-medium text-red-600">
                            Option name is required.
                          </p>
                        )}
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-gray-800">
                          Option values
                        </span>

                        <input
                          className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-black focus:ring-4 focus:ring-black/10"
                          value={option.valuesInput}
                          
                          onChange={(e) => updateOptionValues(option.id, e.target.value)}
                        />

                        <p className="mt-1.5 text-xs text-gray-500">
                          Add multiple values using comma. Example: S, M, L, XL
                        </p>
                      </label>

                      <div className="flex items-center justify-between gap-2">
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => deleteOption(option.id)}
                        >
                          <span className="flex items-center gap-2">
                            <Trash2 size={15} />
                            Delete
                          </span>
                        </Button>

                        <Button
                          type="button"
                          onClick={() => doneEditing(option.id)}
                          disabled={!option.name || option.values.length === 0}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowOptionPicker((prev) => !prev)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Plus size={16} />
              Add another option
            </button>

            {showOptionPicker && (
              <div className="mx-4 mb-4 rounded-2xl border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-200 p-3">
                  <div className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 shadow-sm focus-within:border-black focus-within:ring-4 focus-within:ring-black/10">
                    <Search size={16} className="text-gray-400" />

                    <input
                      autoFocus
                      className="w-full text-sm outline-none placeholder:text-gray-400"
                      placeholder="Search option name"
                      value={optionSearch}
                      onChange={(e) => setOptionSearch(e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={closeOptionPicker}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <p className="px-1 pb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                    Recommended
                  </p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredRecommendedOptions.map((item) => {
                      const disabled = options.some(
                        (option) =>
                          option.name.toLowerCase() === item.toLowerCase(),
                      );

                      return (
                        <button
                          key={item}
                          type="button"
                          disabled={disabled}
                          onClick={() => addRecommendedOption(item)}
                          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-white hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-200 p-3">
                  <button
                    type="button"
                    onClick={addCustomOption}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-white hover:text-gray-950"
                  >
                    <Plus size={16} />
                    Create custom option
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {generatedVariants.length > 0 && (
        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {generatedVariants.length} draft variant(s)
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Review price, stock and SKU before saving.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={saveGeneratedVariants}
            disabled={saving || generatedVariants.length === 0}
          >
            {saving ? 'Saving...' : 'Save generated variants'}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="w-12 px-4 py-3">
<input
  type="checkbox"
  className="h-4 w-4 rounded border-gray-300"
  checked={allSavedVariantsSelected}
  onChange={toggleAllSavedVariants}
/>              </th>
              <th className="px-4 py-3">Variant</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {generatedVariants.map((variant) => (
              <tr
                key={variant.id}
                className="border-b border-gray-100 transition hover:bg-gray-50/80"
              >
                <td className="px-4 py-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                </td>

                <td className="px-4 py-3">
                  <div>
  <p className="font-semibold text-gray-950">{variant.title}</p>
  <p className="mt-0.5 text-xs text-gray-500">Draft variant</p>
</div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex h-10 w-40 items-center rounded-xl border border-gray-200 bg-white px-3 shadow-sm focus-within:border-black focus-within:ring-4 focus-within:ring-black/10">
                    <span className="mr-2 text-gray-500">₹</span>

                    <input
                      className="w-full bg-transparent text-sm outline-none"
                      value={variant.price}
                      onChange={(e) =>
                        updateDraft(variant.id, 'price', e.target.value)
                      }
                    />
                  </div>
                </td>

                <td className="px-4 py-3">
                  <input
                    className="h-10 w-24 rounded-xl border border-gray-200 px-3 text-sm shadow-sm outline-none focus:border-black focus:ring-4 focus:ring-black/10"
                    value={variant.stock}
                    onChange={(e) =>
                      updateDraft(variant.id, 'stock', e.target.value)
                    }
                  />
                </td>

                <td className="px-4 py-3">
                  <input
                    className="h-10 w-52 rounded-xl border border-gray-200 px-3 text-sm shadow-sm outline-none focus:border-black focus:ring-4 focus:ring-black/10"
                    value={variant.sku}
                    onChange={(e) =>
                      updateDraft(variant.id, 'sku', e.target.value)
                    }
                  />
                </td>

                <td className="px-4 py-3 text-right text-xs text-gray-400">
                  Not saved
                </td>
              </tr>
            ))}

            {variants.map((variant: any, index) => {
              const variantId = getVariantId(variant);

              return (
                <tr
                  key={variantId || index}
                  className="border-b border-gray-100 bg-green-50/30 transition hover:bg-green-50/60"
                >
                  <td className="px-4 py-3">
                    <input
  type="checkbox"
  className="h-4 w-4 rounded border-gray-300"
  checked={selectedVariantIds.includes(variantId)}
  onChange={() => toggleSavedVariant(variantId)}
/>
                  </td>

                  <td className="px-4 py-3">
                    <div>
  <p className="font-semibold text-gray-950">
    {getVariantSize(variant) || '-'} /{' '}
    {getVariantColor(variant) || '-'}
  </p>
  <p className="mt-0.5 text-xs text-gray-500">
    {variant.sku || '-'}
  </p>
</div>
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {getVariantPrice(variant) ? `₹${getVariantPrice(variant)}` : '-'}
                  </td>

                  <td className="px-4 py-3">
                    <input
                      className="h-10 w-24 rounded-xl border border-gray-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-black focus:ring-4 focus:ring-black/10"
                      defaultValue={getVariantStock(variant)}
                      onBlur={(e) => handleStockBlur(variantId, e.target.value)}
                    />
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {variant.sku || '-'}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={!variantId || saving}
                      onClick={() => handleDeleteVariant(variantId)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {generatedVariants.length === 0 && variants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                      <Layers3 size={24} />
                    </div>

                    <p className="mt-4 font-semibold text-gray-950">
                      No variants yet
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Add size, color, or another option to generate product variants.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50/50 px-5 py-4 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Total inventory across all locations:{' '}
          <strong>
            {variants.reduce(
              (total, item) => total + Number(getVariantStock(item) || 0),
              0,
            )}
          </strong>{' '}
          available
        </span>

        <span className="text-xs text-gray-500">
          Existing variants: {variants.length}
        </span>
      </div>
    </div>
  );
}