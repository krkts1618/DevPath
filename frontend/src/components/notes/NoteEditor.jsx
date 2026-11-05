import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Save,
  Eye,
  Columns,
  Edit3,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  FileCode,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  Paperclip,
  Trash2,
  X,
  FileText,
  Tag as TagIcon,
  Calendar,
  Layers,
  Check,
} from 'lucide-react';
import Button from '../ui/Button';
import MarkdownViewer from './MarkdownViewer';
import { roadmapService } from '../../services/roadmapService';
import { noteService } from '../../services/noteService';

export default function NoteEditor({ note, onSave, onClose }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [mode, setMode] = useState('split'); // 'edit' | 'split' | 'preview'
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved' | 'error'
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(note?.roadmapId || '');
  const [selectedDayId, setSelectedDayId] = useState(note?.roadmapDayId || '');
  const [selectedTaskId, setSelectedTaskId] = useState(note?.taskId || '');
  const [availableDays, setAvailableDays] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTagNames, setSelectedTagNames] = useState(
    note?.tags ? note.tags.map((t) => t.name) : []
  );
  const [newTagInput, setNewTagInput] = useState('');
  const [attachments, setAttachments] = useState(note?.attachments || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const textareaRef = useRef(null);
  const lastSavedRef = useRef({ title: note?.title || '', content: note?.content || '' });
  const isInitialMount = useRef(true);

  // Load roadmaps and tags
  useEffect(() => {
    async function loadData() {
      try {
        const [rmData, tagData] = await Promise.all([
          roadmapService.getRoadmaps({ status: 'all' }),
          noteService.getTags(),
        ]);
        setRoadmaps(rmData?.roadmaps || rmData || []);
        setTags(tagData || []);
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    }
    loadData();
  }, []);

  // When roadmap changes, load its days/tasks if needed
  useEffect(() => {
    if (!selectedRoadmapId) {
      setAvailableDays([]);
      setAvailableTasks([]);
      return;
    }
    async function loadRoadmapHierarchy() {
      try {
        const rm = await roadmapService.getRoadmapById(selectedRoadmapId);
        const days = [];
        (rm?.modules || []).forEach((m) => {
          (m.days || []).forEach((d) => {
            days.push(d);
          });
        });
        setAvailableDays(days);

        if (selectedDayId) {
          const matchedDay = days.find((d) => d.id === selectedDayId);
          setAvailableTasks(matchedDay?.tasks || []);
        }
      } catch (err) {
        console.error('Failed to load roadmap days:', err);
      }
    }
    loadRoadmapHierarchy();
  }, [selectedRoadmapId, selectedDayId]);

  // Insert helper for Markdown toolbar
  const insertFormatting = (prefix, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setSaveStatus('unsaved');

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 10);
  };

  // Perform saving
  const handleSave = useCallback(
    async (overrideContent = content, overrideTitle = title) => {
      if (!overrideTitle.trim()) return;

      try {
        setSaveStatus('saving');
        const payload = {
          title: overrideTitle.trim(),
          content: overrideContent,
          roadmapId: selectedRoadmapId || null,
          roadmapDayId: selectedDayId || null,
          taskId: selectedTaskId || null,
          tags: selectedTagNames,
        };

        let savedNote;
        if (note?.id) {
          savedNote = await noteService.updateNote(note.id, payload);
        } else {
          savedNote = await noteService.createNote(payload);
        }

        lastSavedRef.current = { title: overrideTitle, content: overrideContent };
        setSaveStatus('saved');
        if (onSave) onSave(savedNote);
      } catch (err) {
        console.error('Error saving note:', err);
        setSaveStatus('error');
      }
    },
    [title, content, selectedRoadmapId, selectedDayId, selectedTaskId, selectedTagNames, note, onSave]
  );

  // Debounced Autosave (1500ms after user stops typing)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (title !== lastSavedRef.current.title || content !== lastSavedRef.current.content) {
      setSaveStatus('unsaved');
      const timer = setTimeout(() => {
        handleSave(content, title);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [title, content, handleSave]);

  // Handle Tag toggle
  const toggleTag = (tagName) => {
    setSaveStatus('unsaved');
    setSelectedTagNames((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  // Handle new Tag creation
  const handleAddCustomTag = (e) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const clean = newTagInput.trim().toLowerCase();
      if (!selectedTagNames.includes(clean)) {
        setSelectedTagNames((prev) => [...prev, clean]);
        setSaveStatus('unsaved');
      }
      setNewTagInput('');
    }
  };

  // Handle Attachment Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !note?.id) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File exceeds 15MB limit.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      const res = await noteService.uploadAttachment(note.id, file);
      setAttachments((prev) => [...prev, res]);
    } catch (err) {
      setUploadError(err.message || 'Attachment upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!note?.id) return;
    try {
      await noteService.deleteAttachment(note.id, attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (err) {
      console.error('Delete attachment error:', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl overflow-hidden shadow-sm">
      {/* Top Header Bar */}
      <div className="px-5 py-3 border-b border-[#E4E7E0] dark:border-[#303945] flex flex-wrap items-center justify-between gap-3 bg-[#F7F7F2] dark:bg-[#222831]">
        <div className="flex-1 min-w-[260px]">
          <input
            type="text"
            placeholder="Note title (e.g. Distributed Consensus in Raft & Paxos)..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaveStatus('unsaved');
            }}
            className="w-full text-lg font-bold bg-transparent text-[#202620] dark:text-[#F3F4F6] border-none outline-none focus:ring-0 placeholder:text-[#858D82] dark:placeholder:text-[#7F8996]"
          />
        </div>

        {/* Status & View Mode */}
        <div className="flex items-center gap-3">
          {/* Save Status Badge */}
          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus === 'saving' && (
              <span className="text-amber-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-[#858D82] dark:text-[#7F8996]">Unsaved changes</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-500 font-medium">Save failed</span>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-1 bg-[#FFFFFF] dark:bg-[#1D232B]">
            <button
              onClick={() => setMode('edit')}
              title="Edit mode"
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                mode === 'edit'
                  ? 'bg-[var(--accent-primary)] text-white dark:bg-[#F3F4F6] dark:text-[#222831]'
                  : 'text-[#858D82] dark:text-[#7F8996] hover:text-[#202620] dark:hover:text-[#F3F4F6]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 inline mr-1" />
              Edit
            </button>
            <button
              onClick={() => setMode('split')}
              title="Split view"
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                mode === 'split'
                  ? 'bg-[var(--accent-primary)] text-white dark:bg-[#F3F4F6] dark:text-[#222831]'
                  : 'text-[#858D82] dark:text-[#7F8996] hover:text-[#202620] dark:hover:text-[#F3F4F6]'
              }`}
            >
              <Columns className="w-3.5 h-3.5 inline mr-1" />
              Split
            </button>
            <button
              onClick={() => setMode('preview')}
              title="Preview mode"
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                mode === 'preview'
                  ? 'bg-[var(--accent-primary)] text-white dark:bg-[#F3F4F6] dark:text-[#222831]'
                  : 'text-[#858D82] dark:text-[#7F8996] hover:text-[#202620] dark:hover:text-[#F3F4F6]'
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" />
              Preview
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={() => handleSave()}
            disabled={saveStatus === 'saving' || !title.trim()}
          >
            Save
          </Button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#858D82] hover:bg-[#EAEAE4] dark:hover:bg-[#303945] transition text-[#202620] dark:text-[#F3F4F6]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Metadata & Associations Selector */}
      <div className="px-5 py-2.5 bg-[#FFFFFF] dark:bg-[#1D232B] border-b border-[#E4E7E0] dark:border-[#303945] flex flex-wrap items-center gap-3 text-xs">
        {/* Roadmap Picker */}
        <div className="flex items-center gap-1.5 text-[#858D82] dark:text-[#7F8996]">
          <Layers className="w-3.5 h-3.5 text-[var(--accent-primary)] dark:text-[#F3F4F6]" />
          <span>Roadmap:</span>
          <select
            value={selectedRoadmapId}
            onChange={(e) => {
              setSelectedRoadmapId(e.target.value);
              setSelectedDayId('');
              setSelectedTaskId('');
              setSaveStatus('unsaved');
            }}
            className="bg-[#F7F7F2] dark:bg-[#222831] border border-[#E4E7E0] dark:border-[#303945] rounded-md px-2 py-1 text-[#202620] dark:text-[#F3F4F6] outline-none"
          >
            <option value="">Standalone / Unlinked</option>
            {roadmaps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>

        {/* Day Picker (Conditional) */}
        {selectedRoadmapId && availableDays.length > 0 && (
          <div className="flex items-center gap-1.5 text-[#858D82] dark:text-[#7F8996]">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)] dark:text-[#F3F4F6]" />
            <span>Day:</span>
            <select
              value={selectedDayId}
              onChange={(e) => {
                setSelectedDayId(e.target.value);
                setSelectedTaskId('');
                setSaveStatus('unsaved');
              }}
              className="bg-[#F7F7F2] dark:bg-[#222831] border border-[#E4E7E0] dark:border-[#303945] rounded-md px-2 py-1 text-[#202620] dark:text-[#F3F4F6] outline-none max-w-[160px] truncate"
            >
              <option value="">Select Day (Optional)</option>
              {availableDays.map((d) => (
                <option key={d.id} value={d.id}>
                  Day {d.dayNumber}: {d.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Task Picker (Conditional) */}
        {selectedDayId && availableTasks.length > 0 && (
          <div className="flex items-center gap-1.5 text-[#858D82] dark:text-[#7F8996]">
            <span>Task:</span>
            <select
              value={selectedTaskId}
              onChange={(e) => {
                setSelectedTaskId(e.target.value);
                setSaveStatus('unsaved');
              }}
              className="bg-[#F7F7F2] dark:bg-[#222831] border border-[#E4E7E0] dark:border-[#303945] rounded-md px-2 py-1 text-[#202620] dark:text-[#F3F4F6] outline-none max-w-[160px] truncate"
            >
              <option value="">Select Task (Optional)</option>
              {availableTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tag Badges */}
        <div className="flex items-center gap-1.5 ml-auto flex-wrap">
          <TagIcon className="w-3.5 h-3.5 text-[#858D82] dark:text-[#7F8996]" />
          {selectedTagNames.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F0EB] text-[var(--accent-primary)] dark:bg-[#303945] dark:text-[#F3F4F6] font-medium"
            >
              #{tag}
              <button
                onClick={() => toggleTag(tag)}
                className="hover:text-red-500 cursor-pointer"
              >
                &times;
              </button>
            </span>
          ))}

          <input
            type="text"
            placeholder="+ Add tag..."
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={handleAddCustomTag}
            className="w-20 bg-transparent text-[#202620] dark:text-[#F3F4F6] border-b border-[#E4E7E0] dark:border-[#303945] outline-none px-1 text-xs"
          />
        </div>
      </div>

      {/* Formatting Toolbar (shown when not pure preview) */}
      {mode !== 'preview' && (
        <div className="px-4 py-1.5 border-b border-[#E4E7E0] dark:border-[#303945] bg-[#F7F7F2] dark:bg-[#222831] flex flex-wrap items-center gap-1 text-[#858D82] dark:text-[#7F8996]">
          <button
            onClick={() => insertFormatting('**', '**', 'bold text')}
            title="Bold (Ctrl+B)"
            className="p-2 rounded-lg hover:bg-[#EAEAE4] dark:hover:bg-[#303945] text-[#202620] dark:text-[#F3F4F6]"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('*', '*', 'italic text')}
            title="Italic (Ctrl+I)"
            className="p-2 rounded-lg hover:bg-[#EAEAE4] dark:hover:bg-[#303945] text-[#202620] dark:text-[#F3F4F6]"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-[#E4E7E0] dark:bg-[#303945] mx-1" />
          <button
            onClick={() => insertFormatting('# ', '', 'Heading 1')}
            title="Heading 1"
            className="p-2 rounded-lg hover:bg-[#EAEAE4] dark:hover:bg-[#303945] text-[#202620] dark:text-[#F3F4F6]"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('## ', '', 'Heading 2')}
            title="Heading 2"
            className="p-2 rounded-lg hover:bg-[#EAEAE4] dark:hover:bg-[#303945] text-[#202620] dark:text-[#F3F4F6]"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-[#E4E7E0] dark:bg-[#303945] mx-1" />
          <button
            onClick={() => insertFormatting('- ', '', 'List item')}
            title="Bullet List"
            className="p-2 rounded-lg hover:bg-[#EAEAE4] dark:hover:bg-[#303945] text-[#202620] dark:text-[#F3F4F6]"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('1. ', '', 'Numbered item')}
            title="Numbered List"
            className="p-2 rounded-lg hover:bg-[#EAEAE4] dark:hover:bg-[#303945] text-[#202620] dark:text-[#F3F4F6]"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('- [ ] ', '', 'Task to complete')}
            title="Checklist"
            className="p-2 rounded-lg hover:bg-[#EAEAE4] dark:hover:bg-[#303945] text-[#202620] dark:text-[#F3F4F6]"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-[#E4E7E0] dark:bg-[#303945] mx-1" />
          <button
            onClick={() => insertFormatting('`', '`', 'code')}
            title="Inline Code"
            className="p-2 rounded-lg hover:bg-[#EAEAE4] dark:hover:bg-[#303945] text-[#202620] dark:text-[#F3F4F6]"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('```javascript\n', '\n```', '// Code snippet here')}
            title="Code Block"
            className="p-2 rounded-lg hover:bg-[#EAEAE4] dark:hover:bg-[#303945] text-[#202620] dark:text-[#F3F4F6]"
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('> ', '', 'Quoted thought')}
            title="Blockquote"
            className="p-2 rounded-lg hover:bg-[#EAEAE4] dark:hover:bg-[#303945] text-[#202620] dark:text-[#F3F4F6]"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              insertFormatting(
                '| Metric | Description |\n| :--- | :--- |\n| Latency | < 50ms |\n',
                '',
                ''
              )
            }
            title="Table Template"
            className="p-2 rounded-lg hover:bg-[#EAEAE4] dark:hover:bg-[#303945] text-[#202620] dark:text-[#F3F4F6]"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('[', '](https://example.com)', 'Link label')}
            title="Hyperlink"
            className="p-2 rounded-lg hover:bg-[#EAEAE4] dark:hover:bg-[#303945] text-[#202620] dark:text-[#F3F4F6]"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          {note?.id && (
            <label className="ml-auto flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded bg-[#E8F0EB] text-[var(--accent-primary)] dark:bg-[#303945] dark:text-[#F3F4F6] hover:opacity-90 text-xs font-medium">
              <Paperclip className="w-3 h-3" />
              <span>Attach File</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          )}
        </div>
      )}

      {/* Editor & Preview Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Raw Markdown Textarea */}
        {(mode === 'edit' || mode === 'split') && (
          <div
            className={`h-full flex flex-col ${
              mode === 'split' ? 'w-1/2 border-r border-[#E4E7E0] dark:border-[#303945]' : 'w-full'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setSaveStatus('unsaved');
              }}
              placeholder="# Write your technical note here in Markdown...
- Use code blocks with ```javascript or ```python
- Attach diagrams or tables
- Reference architecture concepts"
              className="w-full h-full p-5 bg-transparent text-[#202620] dark:text-[#F3F4F6] font-mono text-sm resize-none outline-none focus:ring-0 leading-relaxed placeholder:text-[#858D82] dark:placeholder:text-[#7F8996]"
            />
          </div>
        )}

        {/* Right Side: Rendered Markdown & Code Blocks */}
        {(mode === 'preview' || mode === 'split') && (
          <div
            className={`h-full p-6 overflow-y-auto bg-[#F7F7F2]/40 dark:bg-[#222831]/40 ${
              mode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <MarkdownViewer content={content} />
          </div>
        )}
      </div>

      {/* Attachments Drawer / Footer */}
      {attachments.length > 0 && (
        <div className="px-5 py-2.5 bg-[#F7F7F2] dark:bg-[#222831] border-t border-[#E4E7E0] dark:border-[#303945] flex items-center gap-3 overflow-x-auto text-xs">
          <span className="font-semibold text-[#858D82] dark:text-[#7F8996] flex items-center gap-1">
            <Paperclip className="w-3.5 h-3.5" />
            Attachments ({attachments.length}):
          </span>
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] text-[#202620] dark:text-[#F3F4F6]"
            >
              <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)] dark:text-[#F3F4F6]" />
              <span className="max-w-[140px] truncate">{att.fileName}</span>
              <span className="text-[10px] text-[#858D82] dark:text-[#7F8996]">
                ({Math.round((att.fileSize || 0) / 1024)} KB)
              </span>
              <button
                onClick={() => handleDeleteAttachment(att.id)}
                className="text-red-500 hover:text-red-700 ml-1"
                title="Delete attachment"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {uploadError && <span className="text-red-500 text-xs">{uploadError}</span>}
        </div>
      )}
    </div>
  );
}

