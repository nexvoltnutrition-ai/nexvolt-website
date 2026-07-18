import React, { useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Quote, Undo, Redo, Code, Minus, Table as TableIcon, Palette } from 'lucide-react'
import { supabase } from '../lib/supabase'

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

          editor.chain().focus().setImage({ src: publicUrl }).run()
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Make sure the storage bucket exists.');
        }
      }
    };
    input.click();
  }, [editor])

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const insertTable = () => {
     editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const buttonClass = (isActive: boolean) => 
    `p-2 rounded hover:bg-gray-100 transition-colors ${isActive ? 'bg-gray-200 text-black' : 'text-gray-600'}`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-xl sticky top-0 z-10">
      <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClass(editor.isActive('bold'))} title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClass(editor.isActive('italic'))} title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={buttonClass(editor.isActive('underline'))} title="Underline">
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={buttonClass(editor.isActive('strike'))} title="Strikethrough">
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-gray-200">
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={buttonClass(editor.isActive('heading', { level: 1 }))} title="Heading 1">
          <Heading1 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={buttonClass(editor.isActive('heading', { level: 3 }))} title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={buttonClass(editor.isActive('heading', { level: 4 }))} title="Heading 4">
          <Heading4 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-gray-200">
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClass(editor.isActive('bulletList'))} title="Bullet List">
          <List className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonClass(editor.isActive('orderedList'))} title="Ordered List">
          <ListOrdered className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={buttonClass(editor.isActive('blockquote'))} title="Quote">
          <Quote className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={buttonClass(editor.isActive('codeBlock'))} title="Code Block">
          <Code className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={buttonClass(false)} title="Horizontal Rule">
          <Minus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-gray-200">
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={buttonClass(editor.isActive({ textAlign: 'left' }))} title="Align Left">
          <AlignLeft className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={buttonClass(editor.isActive({ textAlign: 'center' }))} title="Align Center">
          <AlignCenter className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={buttonClass(editor.isActive({ textAlign: 'right' }))} title="Align Right">
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-gray-200">
        <button type="button" onClick={setLink} className={buttonClass(editor.isActive('link'))} title="Link">
          <LinkIcon className="w-4 h-4" />
        </button>
        <button type="button" onClick={addImage} className={buttonClass(false)} title="Image">
          <ImageIcon className="w-4 h-4" />
        </button>
        <button type="button" onClick={insertTable} className={buttonClass(editor.isActive('table'))} title="Insert Table">
          <TableIcon className="w-4 h-4" />
        </button>
        <div className="relative group">
           <button type="button" className={buttonClass(false)} title="Text Color">
             <Palette className="w-4 h-4" />
           </button>
           <input 
              type="color" 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onInput={(event: any) => editor.chain().focus().setColor(event.target.value).run()}
              value={editor.getAttributes('textStyle').color || '#000000'}
           />
        </div>
      </div>

      <div className="flex items-center gap-1 pl-2">
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-2 rounded text-gray-400 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-50 transition-colors">
          <Undo className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-2 rounded text-gray-400 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-50 transition-colors">
          <Redo className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function TiptapEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 shadow-sm border border-gray-100',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Table.configure({
         resizable: true,
         HTMLAttributes: {
            class: 'min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg my-4',
         }
      }),
      TableRow.configure({
         HTMLAttributes: {
            class: 'bg-white divide-x divide-gray-200',
         }
      }),
      TableHeader.configure({
         HTMLAttributes: {
            class: 'bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
         }
      }),
      TableCell.configure({
         HTMLAttributes: {
            class: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
         }
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: 'Write your story...',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[500px] p-6',
      },
      handleDrop: function(view, event, slice, moved) {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          let file = event.dataTransfer.files[0];
          let filesize = ((file.size/1024)/1024).toFixed(4);
          if (file.type.indexOf("image/") === 0) {
            event.preventDefault();
            
            // Upload the image
            const uploadImage = async () => {
               try {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                  
                  const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(fileName, file);

                  if (uploadError) throw uploadError;

                  const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(fileName);

                  const { schema } = view.state;
                  const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                  if (coordinates) {
                      const node = schema.nodes.image.create({ src: publicUrl });
                      const transaction = view.state.tr.insert(coordinates.pos, node);
                      view.dispatch(transaction);
                  }
               } catch(err) {
                 console.error(err);
               }
            };
            uploadImage();
            return true;
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Intentionally not overriding value on every render to avoid cursor jumps
      // For a real app, you might want to handle initial load more gracefully
      // But keeping it uncontrolled here is safer for tiptap
      if (editor.isEmpty && value) {
         editor.commands.setContent(value);
      }
    }
  }, [value, editor])

  return (
    <div className="border border-gray-200 rounded-xl bg-white flex flex-col focus-within:ring-1 focus-within:ring-[#111111] focus-within:border-[#111111] transition-all overflow-hidden relative">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto max-h-[800px] custom-scrollbar">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
