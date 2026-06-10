import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  Upload,
  Type
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_BYTES = 5 * 1024 * 1024;

    if (!ACCEPT.includes(file.type)) {
      toast({ title: 'Only JPG, PNG, WEBP allowed', variant: 'destructive' });
      return null;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: 'Max file size 5 MB', variant: 'destructive' });
      return null;
    }

    try {
      const ext = file.name.split('.').pop();
      const path = `inline-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('featured-images').upload(path, file, { contentType: file.type });

      if (error) {
        toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
        return null;
      }

      const { data } = supabase.storage.from('featured-images').getPublicUrl(path);
      return data.publicUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Upload failed', description: message, variant: 'destructive' });
      return null;
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-primary/80 transition-colors'
        }
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-6 shadow-md border'
        }
      }),
      Placeholder.configure({
        placeholder: 'Compose your news story here… You can type, paste links, and drag-and-drop multiple images.'
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm md:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[450px] p-6 bg-background rounded-b-md border border-t-0 shadow-inner overflow-y-auto'
      },
      handleDrop(view, event, slice, moved) {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const files = Array.from(event.dataTransfer.files);
          const images = files.filter(f => f.type.startsWith('image/'));

          if (images.length > 0) {
            event.preventDefault();
            toast({ title: `Uploading ${images.length} image(s)…`, description: 'Saving files to storage.' });

            images.forEach(async (file) => {
              const url = await uploadImage(file);
              if (url) {
                const { schema } = view.state;
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                const node = schema.nodes.image.create({ src: url });
                const transaction = view.state.tr.insert(coordinates?.pos ?? view.state.selection.anchor, node);
                view.dispatch(transaction);
              }
            });
            return true;
          }
        }
        return false;
      },
      handlePaste(view, event) {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0) {
          const files = Array.from(event.clipboardData.files);
          const images = files.filter(f => f.type.startsWith('image/'));

          if (images.length > 0) {
            event.preventDefault();
            toast({ title: `Uploading ${images.length} pasted image(s)…` });

            images.forEach(async (file) => {
              const url = await uploadImage(file);
              if (url) {
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src: url });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              }
            });
            return true;
          }
        }
        return false;
      }
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast({ title: `Uploading ${files.length} image(s)…` });
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i]);
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="w-full flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageFileChange}
      />
      <TooltipProvider delayDuration={300}>
        <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 border border-border rounded-t-md border-b-0">

          {/* Blocks */}
          <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
            <ToolbarButton
              tooltip="Paragraph"
              onClick={() => editor.chain().focus().setParagraph().run()}
              active={editor.isActive('paragraph')}
            >
              <Type className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              tooltip="Heading 1"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              tooltip="Heading 2"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              tooltip="Heading 3"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Formatting inline */}
          <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
            <ToolbarButton
              tooltip="Bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              tooltip="Italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              tooltip="Underline"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Lists & Quotes */}
          <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
            <ToolbarButton
              tooltip="Bullet List"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              tooltip="Ordered List"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              tooltip="Blockquote"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Links & Media */}
          <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
            <ToolbarButton tooltip="Insert Link" onClick={setLink} active={editor.isActive('link')}>
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              tooltip="Unlink"
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive('link')}
            >
              <Unlink className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton tooltip="Upload Images" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 ml-auto">
            <ToolbarButton
              tooltip="Undo"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              tooltip="Redo"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>

        </div>
      </TooltipProvider>
      <EditorContent editor={editor} />
      <div className="text-[10px] text-muted-foreground mt-1 px-1 flex justify-between">
        <span>Tip: Paste links directly onto selected text. Drag-and-drop multiple images anywhere in the editor.</span>
        <span>HTML Mode enabled</span>
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, tooltip, children }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={active ? 'secondary' : 'ghost'}
          size="sm"
          className={`h-8 w-8 p-0 ${active ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
