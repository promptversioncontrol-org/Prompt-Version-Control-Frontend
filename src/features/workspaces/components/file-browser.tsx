'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Folder,
  ChevronRight,
  Home,
  Loader2,
  Search,
  FileCode,
  ArrowUpLeft,
  FileText,
  Image as ImageIcon,
  Package,
  Terminal,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { getUserFiles, type FileBrowserItem } from '../actions/get-user-files';
import { getFileContent } from '../actions/get-file-content';
import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface FileBrowserProps {
  workspaceId: string;
  userId: string;
}

// Helper for file icons
const getFileIcon = (name: string, type: 'file' | 'folder') => {
  if (type === 'folder')
    return <Folder className="h-5 w-5 text-amber-500 fill-amber-500/20" />;
  if (name === 'report.json')
    return <ShieldAlert className="h-5 w-5 text-red-500" />;

  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx':
      return <FileCode className="h-5 w-5 text-blue-400" />;
    case 'json':
      return <Package className="h-5 w-5 text-yellow-400" />;
    case 'png':
    case 'jpg':
    case 'svg':
      return <ImageIcon className="h-5 w-5 text-purple-400" />;
    case 'md':
      return <FileText className="h-5 w-5 text-emerald-400" />;
    default:
      return <FileText className="h-5 w-5 text-zinc-400" />;
  }
};

// --- NOWOCZESNE STYLE MARKDOWN ---
const MarkdownComponents = {
  // Nagłówki
  h1: (props: React.ComponentPropsWithoutRef<'h1'>) => (
    <h1
      className="text-3xl font-bold text-zinc-100 mb-6 pb-4 border-b border-zinc-800 tracking-tight"
      {...props}
    />
  ),
  h2: (props: React.ComponentPropsWithoutRef<'h2'>) => (
    <h2
      className="text-2xl font-semibold text-zinc-100 mb-4 mt-8 flex items-center gap-2"
      {...props}
    />
  ),
  h3: (props: React.ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="text-lg font-semibold text-zinc-200 mb-3 mt-6" {...props} />
  ),

  // Tekst i akapity
  p: (props: React.ComponentPropsWithoutRef<'p'>) => (
    <p className="text-zinc-400 mb-4 leading-7 text-[15px]" {...props} />
  ),

  // Listy
  ul: (props: React.ComponentPropsWithoutRef<'ul'>) => (
    <ul
      className="list-disc list-outside ml-5 text-zinc-400 mb-4 space-y-2 marker:text-emerald-500"
      {...props}
    />
  ),
  ol: (props: React.ComponentPropsWithoutRef<'ol'>) => (
    <ol
      className="list-decimal list-outside ml-5 text-zinc-400 mb-4 space-y-2 marker:text-zinc-500"
      {...props}
    />
  ),
  li: (props: React.ComponentPropsWithoutRef<'li'>) => (
    <li className="pl-1" {...props} />
  ),

  // Linki
  a: (props: React.ComponentPropsWithoutRef<'a'>) => (
    <a
      className="text-emerald-400 hover:text-emerald-300 hover:underline underline-offset-4 inline-flex items-center gap-0.5 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {props.children}
      <ExternalLink className="h-3 w-3 opacity-50" />
    </a>
  ),

  // Style tekstu
  strong: (props: React.ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold text-zinc-200" {...props} />
  ),
  em: (props: React.ComponentPropsWithoutRef<'em'>) => (
    <em className="text-zinc-300 not-italic" {...props} />
  ), // lekki wyróżnik zamiast standardowej kursywy

  // Blok kodu i kod inline
  code: ({
    node,
    inline,
    className,
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'code'> & {
    node?: unknown;
    inline?: boolean;
  }) => {
    // Silencing unused variables
    void node;
    void className;
    if (inline) {
      return (
        <code
          className="bg-zinc-800/80 text-zinc-300 px-1.5 py-0.5 rounded text-[13px] font-mono border border-zinc-700/50"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <div className="my-6 rounded-lg overflow-hidden border border-zinc-800 bg-[#0e0e10] shadow-md">
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/50 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <span className="ml-2 text-xs text-zinc-500 font-mono">code</span>
          </div>
          <Terminal className="h-3 w-3 text-zinc-600" />
        </div>
        <div className="p-4 overflow-x-auto">
          <code
            className="text-[13px] font-mono text-zinc-300 block leading-6"
            {...props}
          >
            {children}
          </code>
        </div>
      </div>
    );
  },

  // Cytaty
  blockquote: (props: React.ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className="border-l-4 border-emerald-500/30 pl-4 py-1 my-6 bg-emerald-500/5 rounded-r italic text-zinc-400"
      {...props}
    />
  ),

  // Obrazy
  img: (props: React.ComponentPropsWithoutRef<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="rounded-lg border border-zinc-800 my-6 max-w-full h-auto shadow-sm"
      {...props}
      alt={props.alt || 'Markdown image'}
    />
  ),

  // Tabela
  table: (props: React.ComponentPropsWithoutRef<'table'>) => (
    <div className="overflow-x-auto my-8 rounded-lg border border-zinc-800">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  th: (props: React.ComponentPropsWithoutRef<'th'>) => (
    <th
      className="bg-zinc-900 border-b border-zinc-800 p-3 text-zinc-400 font-medium uppercase tracking-wider text-xs"
      {...props}
    />
  ),
  td: (props: React.ComponentPropsWithoutRef<'td'>) => (
    <td
      className="border-b border-zinc-800/50 p-3 text-zinc-300 last:border-0"
      {...props}
    />
  ),
  tr: (props: React.ComponentPropsWithoutRef<'tr'>) => (
    <tr
      className="hover:bg-zinc-900/30 transition-colors even:bg-zinc-900/10"
      {...props}
    />
  ),

  // Linia pozioma
  hr: (props: React.ComponentPropsWithoutRef<'hr'>) => (
    <hr className="my-8 border-zinc-800" {...props} />
  ),
};

export function FileBrowser({ workspaceId, userId }: FileBrowserProps) {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<FileBrowserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Viewer State
  const [viewingFile, setViewingFile] = useState<FileBrowserItem | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  const pathSegments = currentPath.split('/').filter(Boolean);

  const fetchFiles = useCallback(
    async (path: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getUserFiles({
          workspaceId,
          userId,
          prefix: path,
        });
        if (result.success && result.items) {
          const sorted = result.items.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
          });
          setItems(sorted);
        } else {
          setError(result.error || 'Failed to load files');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [workspaceId, userId],
  );

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath, fetchFiles]);

  const handleNavigate = (folderName: string) => {
    setCurrentPath((prev) => `${prev}${folderName}/`);
    setSearch('');
  };

  const handleNavigateUp = () => {
    const newPath = pathSegments.slice(0, -1).join('/');
    setCurrentPath(newPath ? `${newPath}/` : '');
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPath = pathSegments.slice(0, index + 1).join('/');
    setCurrentPath(`${newPath}/`);
  };

  const handleFileClick = async (item: FileBrowserItem) => {
    if (item.type === 'folder') {
      handleNavigate(item.name);
    } else if (item.name === 'report.json') {
      // Navigate to the dedicated report viewer page
      // Using window.location.href or router.push
      // Assuming we are in a client component, better to use next/navigation but window is simpler for now or use router
      // The path should be relative or absolute.
      // Current path structure: /dashboard/workspaces/[slug]/[username]
      // Target: /dashboard/workspaces/[slug]/[username]/report?key=...
      const currentUrl = window.location.pathname;
      const reportUrl = `${currentUrl}/report?key=${encodeURIComponent(item.id)}`;
      window.location.href = reportUrl;
    } else if (item.name.endsWith('.md')) {
      setViewingFile(item);
      setLoadingContent(true);
      setFileContent('');

      const result = await getFileContent(item.id);

      if (result.success && typeof result.content === 'string') {
        setFileContent(result.content);
      } else {
        setFileContent('# Error\nFailed to load content.');
      }
      setLoadingContent(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* --- CSS dla Custom Scrollbar (Wstrzyknięty) --- */}
      <style jsx global>{`
        .custom-markdown-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-markdown-scroll::-webkit-scrollbar-track {
          background: #09090b;
        }
        .custom-markdown-scroll::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 4px;
        }
        .custom-markdown-scroll::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>

      {/* Toolbar - (Bez zmian) */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/60 p-2 pl-3 pr-2 rounded-xl border border-zinc-800 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2 flex-1 overflow-hidden w-full">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800/80 shrink-0"
            onClick={handleNavigateUp}
            disabled={!currentPath}
            title="Go up"
          >
            <ArrowUpLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-2 font-mono text-sm">
            <button
              onClick={() => setCurrentPath('')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded transition-colors hover:bg-zinc-800/50',
                !currentPath
                  ? 'text-white font-medium bg-zinc-800/50'
                  : 'text-zinc-500',
              )}
            >
              <Home className="h-3.5 w-3.5" />
              root
            </button>

            {pathSegments.map((segment, index) => (
              <div key={index} className="flex items-center">
                <ChevronRight className="h-3 w-3 text-zinc-700 mx-0.5 flex-shrink-0" />
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={cn(
                    'px-2 py-1 rounded transition-colors whitespace-nowrap',
                    index === pathSegments.length - 1
                      ? 'text-white font-medium bg-zinc-800/50'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30',
                  )}
                >
                  {segment}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            placeholder="Filter files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 bg-zinc-950/50 border-zinc-800 text-sm focus-visible:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* File List - (Bez zmian) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-sm min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm font-medium">Fetching contents...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 text-red-400">
            <div className="bg-red-500/10 p-3 rounded-full">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFiles(currentPath)}
              className="border-red-900/50 hover:bg-red-950"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-950/50 border-b border-zinc-800">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="w-[50px] pl-4"></TableHead>
                <TableHead className="text-zinc-400 text-xs uppercase tracking-wider font-medium">
                  Name
                </TableHead>
                <TableHead className="text-zinc-400 text-xs uppercase tracking-wider font-medium w-[120px]">
                  Size
                </TableHead>
                <TableHead className="text-zinc-400 text-xs uppercase tracking-wider font-medium text-right pr-4 w-[150px]">
                  Last Modified
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-zinc-500">
                      <div className="bg-zinc-800/50 p-4 rounded-full border border-zinc-700/50">
                        <Folder className="h-8 w-8 opacity-50" />
                      </div>
                      <p className="text-sm">
                        {search ? 'No matches found.' : 'This folder is empty.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className={cn(
                      'border-zinc-800/50 transition-all duration-200 group',
                      item.type === 'folder'
                        ? 'hover:bg-indigo-500/5 cursor-pointer'
                        : item.name === 'report.json'
                          ? 'hover:bg-red-500/10 cursor-pointer'
                          : item.name.endsWith('.md')
                            ? 'hover:bg-emerald-500/5 cursor-pointer'
                            : 'hover:bg-zinc-800/30',
                    )}
                    onClick={() => handleFileClick(item)}
                  >
                    <TableCell className="py-3 pl-4">
                      {getFileIcon(item.name, item.type)}
                    </TableCell>
                    <TableCell className="py-3 font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                      {item.name}
                      {item.type === 'file' && item.name.endsWith('.md') && (
                        <span className="ml-2 text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                          PREVIEW
                        </span>
                      )}
                      {item.type === 'file' && item.name === 'report.json' && (
                        <span className="ml-2 text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 group-hover:bg-red-500/20 group-hover:border-red-500/30 transition-colors">
                          REPORT
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-zinc-500 text-sm font-mono">
                      {item.type === 'folder'
                        ? '-'
                        : item.size
                          ? (item.size / 1024).toFixed(1) + ' KB'
                          : '0 KB'}
                    </TableCell>
                    <TableCell className="py-3 text-zinc-500 text-sm font-mono text-right pr-4">
                      {item.lastModified
                        ? formatDistanceToNow(new Date(item.lastModified), {
                            addSuffix: true,
                          })
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* --- ULEPSZONY MARKDOWN VIEWER --- */}
      <Dialog
        open={!!viewingFile}
        onOpenChange={(open) => !open && setViewingFile(null)}
      >
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 bg-[#09090b] border-zinc-800 shadow-2xl overflow-hidden">
          {/* Header Dialoga */}
          <DialogHeader className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md flex flex-row items-center justify-between space-y-0 z-10">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                <FileText className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex flex-col gap-0.5">
                <DialogTitle className="text-zinc-100 font-semibold tracking-tight">
                  {viewingFile?.name}
                </DialogTitle>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                  <span>
                    {viewingFile?.size
                      ? (viewingFile.size / 1024).toFixed(2) + ' KB'
                      : '0 KB'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                  <span>Markdown Preview</span>
                </div>
              </div>
            </div>

            {/* Opcjonalny przycisk akcji w nagłówku (np. Copy) */}
            <div className="flex items-center gap-2">
              {/* Close handled by default Dialog close button, but we can add more controls here */}
            </div>
          </DialogHeader>

          {/* Obszar treści */}
          <div className="flex-1 overflow-hidden relative bg-[#09090b]">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none"></div>

            {loadingContent ? (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-zinc-500">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <p className="text-sm font-medium animate-pulse">
                  Rendering markdown...
                </p>
              </div>
            ) : (
              <div className="h-full overflow-y-auto custom-markdown-scroll">
                <div className="max-w-4xl mx-auto p-8 md:p-12 pb-20">
                  {/* Wrapper dla samego Markdownu */}
                  <div className="prose prose-invert prose-zinc max-w-none">
                    <ReactMarkdown components={MarkdownComponents}>
                      {fileContent}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
