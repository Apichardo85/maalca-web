'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
  getText?: (es: string, en: string) => string;
}

/**
 * Editor de texto enriquecido mínimo (negrita, itálica, subrayado, encabezados,
 * lista, justificado) para las descripciones que el dueño escribe en Diseño y que
 * se renderizan tal cual (con formato) en la página pública del negocio.
 * El HTML que sale de acá SIEMPRE debe pasar por sanitizeRichText (src/lib/sanitize-html.ts)
 * antes de renderizarse en cualquier página pública — este componente no sanea nada,
 * solo genera el HTML del lado del dashboard.
 */
export function RichTextEditor({ value, onChange, onBlur, placeholder, maxLength, getText = (es) => es }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right'] }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose-sm max-w-none min-h-[96px] rounded-b-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
      },
    },
    onUpdate: ({ editor }: { editor: Editor }) => {
      const html = editor.isEmpty ? '' : editor.getHTML();
      if (maxLength && editor.getText().length > maxLength) return;
      onChange(html);
    },
    onBlur: () => onBlur?.(),
  });

  // Keep the editor in sync if `value` changes from outside (e.g. switching between
  // description/descriptionEn shares no state, but a parent reset/undo could still
  // change it under us) — avoids fighting the user's cursor on every keystroke by
  // only syncing when the incoming value actually differs from the editor's own HTML.
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if (value !== current) editor.commands.setContent(value || '', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `rounded px-2 py-1 text-xs font-medium transition ${
      active
        ? 'bg-[#C8102E] text-white'
        : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-700'
    }`;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-within:border-gray-400 dark:focus-within:border-neutral-500">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/40 px-1.5 py-1">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title={getText('Negrita', 'Bold')}>
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title={getText('Itálica', 'Italic')}>
          <em>I</em>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline'))} title={getText('Subrayado', 'Underline')}>
          <span className="underline">U</span>
        </button>
        <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-neutral-700" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title={getText('Título', 'Heading')}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))} title={getText('Subtítulo', 'Subheading')}>
          H3
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title={getText('Lista', 'List')}>
          •≡
        </button>
        <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-neutral-700" />
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btn(editor.isActive({ textAlign: 'left' }))} title={getText('Alinear izquierda', 'Align left')}>
          ≡←
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btn(editor.isActive({ textAlign: 'center' }))} title={getText('Centrar', 'Center')}>
          ≡○
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btn(editor.isActive({ textAlign: 'right' }))} title={getText('Alinear derecha', 'Align right')}>
          →≡
        </button>
      </div>
      <EditorContent editor={editor} />
      {maxLength && (
        <div className="border-t border-gray-100 dark:border-neutral-800 px-3 py-1 text-right text-[11px] text-gray-400 dark:text-neutral-500">
          {editor.getText().length}/{maxLength}
        </div>
      )}
    </div>
  );
}
