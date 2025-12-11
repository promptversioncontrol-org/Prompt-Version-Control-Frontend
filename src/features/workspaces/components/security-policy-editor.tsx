'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  ShieldAlert,
  Folder,
  FileText,
  Plus,
  Trash2,
  Save,
  FileCode,
  Info,
  FileUp,
  Search,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { SecurityRule } from '@prisma/client';

interface SecurityPolicyEditorProps {
  workspaceId: string;
  initialRules?: SecurityRule[];
  onSave: (workspaceId: string, rules: SecurityRule[]) => Promise<void>;
}

const DEFAULT_RULES: Partial<SecurityRule>[] = [
  {
    id: '1',
    workspaceId: 'ws_1',
    category: 'Folders',
    pattern: 'node_modules',
    description: 'Dependencies',
  },
  {
    id: '2',
    workspaceId: 'ws_1',
    category: 'Folders',
    pattern: '.git',
    description: 'Version control',
  },
  {
    id: '3',
    workspaceId: 'ws_1',
    category: 'Folders',
    pattern: '.pvc',
    description: 'PVC internal config',
  },
  {
    id: '4',
    workspaceId: 'ws_1',
    category: 'Files',
    pattern: '.env',
    description: 'Environment variables',
  },
  {
    id: '5',
    workspaceId: 'ws_1',
    category: 'Files',
    pattern: 'id_rsa',
    description: 'SSH Private Keys',
  },
  {
    id: '6',
    workspaceId: 'ws_1',
    category: 'Files',
    pattern: '*.pem',
    description: 'Certificates',
  },
];

const CATEGORIES = ['Folders', 'Files'];

export function SecurityPolicyEditor({
  workspaceId,
  initialRules = [],
  onSave,
}: SecurityPolicyEditorProps) {
  const [rules, setRules] = useState<SecurityRule[]>(
    initialRules.length > 0 ? initialRules : DEFAULT_RULES,
  );
  const [newPattern, setNewPattern] = useState('');
  const [newCategory, setNewCategory] = useState('Files');
  const [newDescription, setNewDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Filter Rules (tylko do wyświetlania listy)
  const filteredRules = useMemo(() => {
    if (!searchQuery) return rules;
    const lowerQuery = searchQuery.toLowerCase();
    return rules.filter(
      (r) =>
        r.pattern.toLowerCase().includes(lowerQuery) ||
        (r.description && r.description.toLowerCase().includes(lowerQuery)),
    );
  }, [rules, searchQuery]);

  // 2. Group filtered rules (do wyświetlania)
  const groupedRules = useMemo(() => {
    const groups: Record<string, SecurityRule[]> = {
      Folders: [],
      Files: [],
    };

    filteredRules.forEach((rule) => {
      let cat = rule.category || 'Files';
      // Ensure we only map to valid categories
      if (!CATEGORIES.includes(cat)) cat = 'Files';

      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(rule);
    });

    return groups;
  }, [filteredRules]);

  // 3. Preview Content (ZAWSZE ZE WSZYSTKICH REGUŁ, niezależnie od filtra)
  const filePreview = useMemo(() => {
    let content = '';
    const allGroups: Record<string, SecurityRule[]> = {
      Folders: [],
      Files: [],
    };

    rules.forEach((rule) => {
      let cat = rule.category || 'Files';
      if (!CATEGORIES.includes(cat)) cat = 'Files';

      if (!allGroups[cat]) allGroups[cat] = [];
      allGroups[cat].push(rule);
    });

    Object.entries(allGroups).forEach(([category, items]) => {
      if (items.length > 0) {
        content += `# -- ${category} --\n`;
        items.forEach((item) => {
          content += `${item.pattern}${item.description ? ` # ${item.description}` : ''}\n`;
        });
        content += '\n';
      }
    });
    return content.trim();
  }, [rules]);

  const handleAddRule = () => {
    if (!newPattern.trim()) return;

    const newRule: SecurityRule = {
      id: crypto.randomUUID(),
      workspaceId,
      pattern: newPattern.trim(),
      category: newCategory,
      description: newDescription.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setRules([...rules, newRule]);
    setNewPattern('');
    setNewDescription('');
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(workspaceId, rules);
    setIsSaving(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const newRules: SecurityRule[] = [];
      let currentCategory = 'Files';

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const categoryMatch = trimmed.match(/^# -- (.+) --$/);
        if (categoryMatch) {
          const cat = categoryMatch[1];
          if (CATEGORIES.includes(cat)) {
            currentCategory = cat;
          }
          return;
        }

        if (trimmed.startsWith('#')) return;

        const [patternPart, ...descParts] = trimmed.split('#');
        const pattern = patternPart.trim();
        const description = descParts.join('#').trim() || null;

        if (pattern) {
          newRules.push({
            id: crypto.randomUUID(),
            workspaceId,
            pattern,
            category: currentCategory,
            description,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as SecurityRule);
        }
      });

      setRules(newRules);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* LEFT COLUMN: EDITOR */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-end shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="text-emerald-500" /> Security Policy Rules
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Define file patterns that should be flagged as sensitive.
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            {isSaving ? (
              'Syncing...'
            ) : (
              <>
                <Save size={16} className="mr-2" /> Save Policy
              </>
            )}
          </Button>
        </div>

        {/* Add Form & Search Bar Container */}
        <div className="flex flex-col gap-4 shrink-0">
          {/* Add Rule Form */}
          <Card className="bg-zinc-900/50 border-zinc-800 p-3 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <FileCode size={64} />
            </div>

            <div className="grid grid-cols-12 gap-2 items-end relative z-10">
              <div className="col-span-12 md:col-span-4">
                <Input
                  placeholder="Pattern (e.g. *.env)"
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  className="bg-black/40 border-zinc-700 font-mono text-emerald-400 h-10 text-sm focus:border-emerald-500/50"
                />
              </div>
              <div className="col-span-6 md:col-span-2">
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="bg-black/40 border-zinc-700 text-zinc-300 h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-6 md:col-span-4">
                <Input
                  placeholder="Description (Optional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-black/40 border-zinc-700 text-zinc-400 h-10 text-sm"
                />
              </div>

              {/* 🔥 FIXED ACTION BUTTONS 🔥 */}
              <div className="col-span-12 md:col-span-2 flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleAddRule}
                        className="flex-1 h-10 bg-zinc-100 text-zinc-900 hover:bg-white border border-transparent font-bold shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all"
                      >
                        <Plus size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                      <p>Add Rule</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-10 px-3 border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
                      >
                        <FileUp size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                      <p>Import from .txt</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <input
                  type="file"
                  accept=".txt"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </Card>

          {/* SEARCH BAR */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={16}
            />
            <Input
              placeholder="Filter rules by pattern or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-900/30 border-zinc-800 text-zinc-200 focus:border-emerald-500/30 transition-all h-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Rules List (Natural Height) */}
        <div className="space-y-6">
          {Object.keys(groupedRules).length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-zinc-600">
              <Search size={24} className="mb-2 opacity-50" />
              <p className="text-sm">No rules match your filter.</p>
            </div>
          )}

          {Object.entries(groupedRules).map(
            ([category, items]) =>
              items.length > 0 && (
                <div key={category} className="mb-6">
                  {/* Sticky Category Header */}
                  <div className="sticky top-0 z-10 flex items-center gap-2 py-2 bg-[#09090b]/95 backdrop-blur-sm mb-2 border-b border-zinc-800/50 rounded-t-md">
                    <Badge
                      variant="outline"
                      className="bg-zinc-900 text-zinc-400 border-zinc-700 uppercase text-[10px] tracking-widest"
                    >
                      {category}
                    </Badge>
                    <span className="text-[10px] text-zinc-600 font-mono">
                      {items.length} items
                    </span>
                  </div>

                  {/* GRID LAYOUT */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    <AnimatePresence initial={false}>
                      {items.map((rule) => (
                        <motion.div
                          key={rule.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="group flex items-center justify-between p-2.5 rounded-md bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-500 shrink-0">
                              {rule.pattern.includes('.') ? (
                                <FileText size={14} />
                              ) : (
                                <Folder size={14} />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span
                                className="font-mono text-sm text-zinc-300 font-medium truncate"
                                title={rule.pattern}
                              >
                                {rule.pattern}
                              </span>
                              {rule.description && (
                                <span
                                  className="text-[10px] text-zinc-500 truncate max-w-[180px]"
                                  title={rule.description}
                                >
                                  {rule.description}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ),
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: PREVIEW (Sticky) */}
      <div className="lg:col-span-1 hidden lg:block">
        <div className="sticky top-6 flex flex-col gap-4">
          <div className="flex items-center justify-between shrink-0">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <FileCode size={14} /> Live Config Preview
            </span>
            <Badge
              variant="outline"
              className="text-[10px] border-zinc-700 text-zinc-400 bg-zinc-900/50"
            >
              Read Only
            </Badge>
          </div>

          <div className="bg-[#09090b] rounded-xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col group">
            {/* Fake Terminal Header */}
            <div className="bg-zinc-900/80 border-b border-zinc-800 px-3 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <span className="text-[10px] text-zinc-500 ml-2 font-mono">
                  pvc.rules
                </span>
              </div>
              <span className="text-[9px] text-zinc-600 font-mono">UTF-8</span>
            </div>

            {/* File Content */}
            <div className="p-4 overflow-auto scrollbar-thin scrollbar-thumb-zinc-800 max-h-[600px]">
              <pre className="text-[10px] font-mono leading-relaxed text-zinc-400 whitespace-pre-wrap font-medium">
                {filePreview || (
                  <span className="text-zinc-700 italic">
                    # No rules configured...
                  </span>
                )}
              </pre>
            </div>

            {/* Footer Info */}
            <div className="border-t border-zinc-800 p-3 bg-zinc-900/30 shrink-0">
              <div className="flex gap-2 text-[10px] text-zinc-500">
                <Info size={12} className="shrink-0 mt-0.5 text-emerald-500" />
                <p className="leading-tight">
                  Total rules:{' '}
                  <span className="text-zinc-300 font-bold">
                    {rules.length}
                  </span>
                  . <br />
                  CLI agents will pull this config automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
