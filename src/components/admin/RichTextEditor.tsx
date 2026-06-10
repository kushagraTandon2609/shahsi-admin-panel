'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Node } from '@tiptap/core';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Palette,
PaintBucket,
  PlayCircle,
  Redo2,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
  X,
} from 'lucide-react';

type RichTextEditorProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
};

type LinkModalState = {
  open: boolean;
  href: string;
  title: string;
  target: '_self' | '_blank';
};

const SafeVideo = Node.create({
  name: 'safeVideo',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: '',
      },
      title: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      {
        ...HTMLAttributes,
        controls: 'true',
        playsinline: 'true',
        class: 'my-3 max-h-[420px] w-full rounded-xl bg-black object-contain',
      },
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },
});

function VideoNodeView({ node }: any) {
  return (
    <NodeViewWrapper className="my-3">
      <video
        src={node.attrs.src}
        title={node.attrs.title || 'Video'}
        controls
        playsInline
        className="max-h-[420px] w-full rounded-xl bg-black object-contain"
      />
    </NodeViewWrapper>
  );
}

function normalizeUrl(value: string) {
  const url = String(value || '').trim();

  if (!url) return '';

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('mailto:')
  ) {
    return url;
  }

  return `https://${url}`;
}

function isSafeLink(value: string) {
  return /^(https?:\/\/|mailto:)/i.test(value);
}

function isSafeImageOrVideoUrl(value: string) {
  return /^(https?:\/\/|blob:|data:image\/)/i.test(value);
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = 'Write product description...',
  minHeight = 300,
}: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(value || '');
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [selectedBlockValue, setSelectedBlockValue] = useState('p');
  const [linkModal, setLinkModal] = useState<LinkModalState>({
    open: false,
    href: '',
    title: '',
    target: '_self',
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
  heading: {
    levels: [1, 2, 3, 4],
  },
}),
Underline,
TextStyle,
Color,
Highlight.configure({
  multicolor: true,
}),
LinkExtension.configure({
        openOnClick: false,
        autolink: false,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-blue-700 underline underline-offset-2',
          rel: 'noopener noreferrer',
        },
        validate: (href) => isSafeLink(normalizeUrl(href)),
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'my-3 max-h-[520px] rounded-xl object-contain',
        },
      }),
      SafeVideo,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'my-4 w-full border-collapse border border-gray-300',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-3 py-2',
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none px-4 py-4 text-gray-950 outline-none focus:outline-none',
        style: `min-height: ${minHeight}px;`,
      },
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files || []);
        const mediaFile = files.find(
          (file) => file.type.startsWith('image/') || file.type.startsWith('video/'),
        );

        if (!mediaFile) return false;

        event.preventDefault();

        const url = URL.createObjectURL(mediaFile);
        const coordinates = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        if (coordinates) {
          view.dispatch(view.state.tr.setSelection(
            // @ts-expect-error ProseMirror selection class internal typing issue
            view.state.selection.constructor.near(view.state.doc.resolve(coordinates.pos)),
          ));
        }

        if (mediaFile.type.startsWith('image/')) {
          editor?.chain().focus().setImage({
            src: url,
            alt: mediaFile.name,
            title: mediaFile.name,
          }).run();
        }

        if (mediaFile.type.startsWith('video/')) {
          editor?.chain().focus().insertContent({
            type: 'safeVideo',
            attrs: {
              src: url,
              title: mediaFile.name,
            },
          }).run();
        }

        return true;
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html);
      setHtmlValue(html);
    },
  });
useEffect(() => {
  if (!editor) return;

  const updateSelectedBlock = () => {
    setSelectedBlockValue(getSelectedBlockValue());
  };

  updateSelectedBlock();

  editor.on('selectionUpdate', updateSelectedBlock);
  editor.on('transaction', updateSelectedBlock);

  return () => {
    editor.off('selectionUpdate', updateSelectedBlock);
    editor.off('transaction', updateSelectedBlock);
  };
}, [editor]);
  useEffect(() => {
    if (!editor || htmlMode) return;

    const currentHtml = editor.getHTML();
    const nextHtml = value || '';

    if (nextHtml !== currentHtml) {
      editor.commands.setContent(nextHtml, {
  emitUpdate: false,
});
    }
  }, [value, editor, htmlMode]);

  useEffect(() => {
    if (htmlMode) {
      setHtmlValue(value || '');
    }
  }, [htmlMode, value]);
function getSelectedBlockValue() {
  if (!editor) return 'p';

  const { from } = editor.state.selection;
  const resolvedPosition = editor.state.doc.resolve(from);

  for (let depth = resolvedPosition.depth; depth >= 0; depth -= 1) {
    const node = resolvedPosition.node(depth);

    if (node.type.name === 'heading') {
      const level = Number(node.attrs.level || 0);

      if (level === 1) return 'h1';
      if (level === 2) return 'h2';
      if (level === 3) return 'h3';
      if (level === 4) return 'h4';
    }

    if (node.type.name === 'paragraph') {
      return 'p';
    }
  }

  return 'p';
}
  const selectedBlock = selectedBlockValue;
const currentAlign = (() => {
  if (!editor) return 'left';
  if (editor.isActive({ textAlign: 'center' })) return 'center';
  if (editor.isActive({ textAlign: 'right' })) return 'right';
  return 'left';
})();

function getCurrentAlignIcon() {
  if (currentAlign === 'center') return <AlignCenter size={16} />;
  if (currentAlign === 'right') return <AlignRight size={16} />;
  return <AlignLeft size={16} />;
}

function setAlignment(value: 'left' | 'center' | 'right') {
  if (!editor) return;

  editor.chain().focus().setTextAlign(value).run();
  setShowAlignMenu(false);
}
  const openLinkModal = useCallback(() => {
    if (!editor) return;

    const previousHref = editor.getAttributes('link')?.href || '';
    const previousTarget = editor.getAttributes('link')?.target || '_self';

    setLinkModal({
      open: true,
      href: previousHref,
      title: '',
      target: previousTarget === '_blank' ? '_blank' : '_self',
    });
  }, [editor]);

  function closeLinkModal() {
    setLinkModal({
      open: false,
      href: '',
      title: '',
      target: '_self',
    });
  }

  function applyLink() {
    if (!editor) return;

    const href = normalizeUrl(linkModal.href);

    if (!href) {
      editor.chain().focus().unsetLink().run();
      closeLinkModal();
      return;
    }

    if (!isSafeLink(href)) {
      alert('Only http, https, and mailto links are allowed.');
      return;
    }

    const attrs = {
      href,
      title: linkModal.title.trim() || null,
      target: linkModal.target,
      rel: linkModal.target === '_blank' ? 'noopener noreferrer' : null,
    };

    editor.chain().focus().extendMarkRange('link').setLink(attrs).run();
    closeLinkModal();
  }

  function removeLink() {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    closeLinkModal();
  }

  function insertLocalMedia(files: FileList | null, type: 'image' | 'video') {
    if (!editor || !files?.length) return;

    const file = files[0];

    if (type === 'image' && !file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    if (type === 'video' && !file.type.startsWith('video/')) {
      alert('Please select a video file.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    if (!isSafeImageOrVideoUrl(objectUrl)) {
      alert('Invalid media URL.');
      return;
    }

    if (type === 'image') {
      editor
        .chain()
        .focus()
        .setImage({
          src: objectUrl,
          alt: file.name,
          title: file.name,
        })
        .run();
    }

    if (type === 'video') {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'safeVideo',
          attrs: {
            src: objectUrl,
            title: file.name,
          },
        })
        .run();
    }
  }

  function toggleHtmlMode() {
    if (!editor) return;

    if (htmlMode) {
      editor.commands.setContent(htmlValue || '', {
  emitUpdate: false,
});
      onChange(htmlValue || '');
      setHtmlMode(false);
      return;
    }

    const html = editor.getHTML();
    setHtmlValue(html);
    setHtmlMode(true);
  }

  if (!editor) {
    return (
      <div>
        {label && (
          <label className="mb-1 block text-sm font-semibold text-gray-950">
            {label}
          </label>
        )}

        <div className="min-h-[260px] rounded-2xl border border-gray-300 bg-white" />
      </div>
    );
  }

    return (
 <div className="relative">
      {label && (
        <label className="mb-1 block text-sm font-semibold text-gray-950">
          {label}
        </label>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          insertLocalMedia(event.target.files, 'image');
          event.target.value = '';
        }}
      />

      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          insertLocalMedia(event.target.files, 'video');
          event.target.value = '';
        }}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-white px-3 py-2">
          <select
            value={selectedBlock}
            disabled={htmlMode}
            onChange={(event) => {
  const nextValue = event.target.value;

  setSelectedBlockValue(nextValue);

  if (nextValue === 'p') {
    editor.chain().focus().setParagraph().run();
    return;
  }

  const level = Number(nextValue.replace('h', '')) as 1 | 2 | 3 | 4;

  editor.chain().focus().setHeading({ level }).run();
}}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 outline-none hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>

          <span className="mx-1 h-6 w-px bg-gray-200" />

          <ToolbarButton
            title="Bold"
            active={editor.isActive('bold')}
            disabled={htmlMode}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={16} />
          </ToolbarButton>

          <ToolbarButton
            title="Italic"
            active={editor.isActive('italic')}
            disabled={htmlMode}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={16} />
          </ToolbarButton>

          <ToolbarButton
            title="Underline"
            active={editor.isActive('underline')}
            disabled={htmlMode}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon size={16} />
          </ToolbarButton>

          
<label
  title="Text color"
  className={`inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg border px-2 text-sm font-semibold transition ${
    htmlMode
      ? 'cursor-not-allowed border-gray-200 bg-white text-gray-300'
      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
  }`}
>
  <Palette size={16} />

  <input
    type="color"
    disabled={htmlMode}
    className="sr-only"
    onChange={(event) => {
      editor.chain().focus().setColor(event.target.value).run();
    }}
  />
</label>

<label
  title="Background color"
  className={`inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg border px-2 text-sm font-semibold transition ${
    htmlMode
      ? 'cursor-not-allowed border-gray-200 bg-white text-gray-300'
      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
  }`}
>
  <PaintBucket size={16} />

  <input
    type="color"
    disabled={htmlMode}
    className="sr-only"
    onChange={(event) => {
      editor.chain().focus().toggleHighlight({ color: event.target.value }).run();
    }}
  />
</label>
          <span className="mx-1 h-6 w-px bg-gray-200" />

          <div className="relative">
  <button
    type="button"
    title="Text alignment"
    disabled={htmlMode}
    onClick={() => setShowAlignMenu((prev) => !prev)}
    className={`inline-flex h-9 min-w-11 items-center justify-center gap-1 rounded-lg border px-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
      currentAlign !== 'left'
        ? 'border-black bg-black text-white'
        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
    }`}
  >
    {getCurrentAlignIcon()}
    <span className="text-[10px] leading-none">▾</span>
  </button>

  {showAlignMenu && !htmlMode && (
    <div className="absolute left-0 top-10 z-50 flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
      <button
        type="button"
        title="Align left"
        onClick={() => setAlignment('left')}
        className={`flex h-9 w-10 items-center justify-center ${
          currentAlign === 'left'
            ? 'bg-black text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <AlignLeft size={16} />
      </button>

      <button
        type="button"
        title="Align center"
        onClick={() => setAlignment('center')}
        className={`flex h-9 w-10 items-center justify-center ${
          currentAlign === 'center'
            ? 'bg-black text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <AlignCenter size={16} />
      </button>

      <button
        type="button"
        title="Align right"
        onClick={() => setAlignment('right')}
        className={`flex h-9 w-10 items-center justify-center ${
          currentAlign === 'right'
            ? 'bg-black text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <AlignRight size={16} />
      </button>
    </div>
  )}
</div>

          <span className="mx-1 h-6 w-px bg-gray-200" />

          <ToolbarButton
            title="Bullet list"
            active={editor.isActive('bulletList')}
            disabled={htmlMode}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={16} />
          </ToolbarButton>

          <ToolbarButton
            title="Numbered list"
            active={editor.isActive('orderedList')}
            disabled={htmlMode}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={16} />
          </ToolbarButton>

          <span className="mx-1 h-6 w-px bg-gray-200" />

          <ToolbarButton
            title="Insert/edit link"
            active={editor.isActive('link')}
            disabled={htmlMode}
            onClick={openLinkModal}
          >
            <Link size={16} />
          </ToolbarButton>

          

          <ToolbarButton
            title="Insert image"
            active={false}
            disabled={htmlMode}
            onClick={() => imageInputRef.current?.click()}
          >
            <ImageIcon size={16} />
          </ToolbarButton>

          <ToolbarButton
            title="Insert video"
            active={false}
            disabled={htmlMode}
            onClick={() => videoInputRef.current?.click()}
          >
            <PlayCircle size={16} />
          </ToolbarButton>

          <ToolbarButton
            title="Insert table"
            active={editor.isActive('table')}
            disabled={htmlMode}
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <Table2 size={16} />
          </ToolbarButton>

          <span className="mx-1 h-6 w-px bg-gray-200" />

          <ToolbarButton
            title="Undo"
            active={false}
            disabled={htmlMode}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 size={16} />
          </ToolbarButton>

          <ToolbarButton
            title="Redo"
            active={false}
            disabled={htmlMode}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 size={16} />
          </ToolbarButton>

          <button
            type="button"
            onClick={toggleHtmlMode}
            className={`ml-auto inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
              htmlMode
                ? 'border-black bg-black text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Code2 size={16} />
            HTML
          </button>
        </div>

        {htmlMode ? (
          <textarea
            value={htmlValue}
            onChange={(event) => {
              setHtmlValue(event.target.value);
              onChange(event.target.value);
            }}
            style={{ minHeight }}
            className="w-full resize-y bg-white px-4 py-4 font-mono text-sm leading-6 text-gray-950 outline-none"
            placeholder="<h2>Title</h2><p>Description...</p>"
          />
        ) : (
          <div className="relative bg-white">
            {!editor.getText().trim() && (
              <div className="pointer-events-none absolute left-4 top-4 text-sm text-gray-400">
                {placeholder}
              </div>
            )}

            <EditorContent editor={editor} />
          </div>
        )}
      </div>

      {linkModal.open && (
      <div className="absolute left-3 top-[54px] z-50 w-[min(520px,calc(100%-24px))]">
        <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-bold text-gray-950">Insert link</h2>

              <button
                type="button"
                onClick={closeLinkModal}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">
                  Link to
                </span>

                <input
                  value={linkModal.href}
                  onChange={(event) =>
                    setLinkModal((prev) => ({
                      ...prev,
                      href: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-black"
                  placeholder="https://"
                  autoFocus
                />

                <p className="mt-1 text-xs text-gray-500">
                  http://, https://, or mailto: links are allowed.
                </p>
              </label>

              

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">
                  Open this link in
                </span>

                <select
                  value={linkModal.target}
                  onChange={(event) =>
                    setLinkModal((prev) => ({
                      ...prev,
                      target: event.target.value as '_self' | '_blank',
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-black"
                >
                  <option value="_self">the same window</option>
                  <option value="_blank">a new window</option>
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-4">
              <button
                type="button"
                onClick={removeLink}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Remove link
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeLinkModal}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={applyLink}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Insert link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type ToolbarButtonProps = {
  title: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolbarButton({
  title,
  active,
  disabled = false,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-black bg-black text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}