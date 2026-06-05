'use client';

import { DragEvent, useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

type CategoryImageUploaderProps = {
  imageUrl: string;
  imageFile?: File | null;
  imageName: string;
  imageAltText: string;
  onImageChange: (payload: {
    file?: File | null;
    url: string;
    name: string;
    altText: string;
  }) => void;
};

export function CategoryImageUploader({
  imageUrl,
  imageFile,
  imageName,
  imageAltText,
  onImageChange,
}: CategoryImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastObjectUrlRef = useRef<string>('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => {
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
      }
    };
  }, []);

  function handleFile(file: File) {
    if (!(file instanceof File)) {
      alert('Please select a valid image file.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
      return;
    }

    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    const defaultName = file.name.replace(/\.[^/.]+$/, '');

    lastObjectUrlRef.current = previewUrl;

    onImageChange({
      file,
      url: previewUrl,
      name: imageName || defaultName,
      altText: imageAltText || defaultName,
    });

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    handleFile(file);
  }

  function clearImage() {
    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = '';
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }

    onImageChange({
      file: null,
      url: '',
      name: '',
      altText: '',
    });
  }

  function updateImageName(name: string) {
    onImageChange({
      file: imageFile instanceof File ? imageFile : null,
      url: imageUrl || '',
      name,
      altText: imageAltText || '',
    });
  }

  function updateImageAltText(altText: string) {
    onImageChange({
      file: imageFile instanceof File ? imageFile : null,
      url: imageUrl || '',
      name: imageName || '',
      altText,
    });
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={`rounded-2xl border border-dashed p-4 transition ${
          dragActive ? 'border-black bg-gray-50' : 'border-gray-300 bg-white'
        }`}
      >
        {imageUrl ? (
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img
              src={imageUrl}
              alt={imageAltText || imageName || 'Category image'}
              draggable={false}
              className="h-48 w-full object-cover"
            />

            <button
              type="button"
              onClick={clearImage}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex min-h-[170px] w-full flex-col items-center justify-center rounded-xl text-center"
          >
            <ImagePlus size={26} className="text-gray-400" />

            <span className="mt-3 rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm">
              Add image
            </span>

            <span className="mt-2 text-sm text-gray-500">
              or drop an image to upload
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (!file) return;

            handleFile(file);
          }}
        />
      </div>

      {imageUrl && (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-800">
              Image name
            </span>

            <input
              value={imageName || ''}
              onChange={(e) => updateImageName(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-black"
              placeholder="Image name"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-800">
              Alt text
            </span>

            <textarea
              value={imageAltText || ''}
              onChange={(e) => updateImageAltText(e.target.value)}
              className="min-h-20 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
              placeholder="Describe this image"
            />
          </label>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            Replace image
          </button>
        </div>
      )}
    </div>
  );
}