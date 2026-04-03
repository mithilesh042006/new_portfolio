import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Check, Star, StarOff, Upload, Sparkles, FileText, Loader2 } from 'lucide-react';
import {
  getProjects, addProject, updateProject, deleteProject, type Project,
} from '../../lib/firestore';
import { uploadImage } from '../../lib/cloudinary';

const empty: Omit<Project, 'id'> = {
  title: '', description: '', tech: [], imageUrl: '', liveUrl: '',
  githubUrl: '', featured: false, year: new Date().getFullYear(),
  category: '', order: 0,
};

const AI_PROMPT = `You are a portfolio content assistant. Analyze the following project documentation and extract structured project details for a developer portfolio.

Return ONLY a valid JSON object with these fields:
{
  "title": "Project name",
  "description": "A compelling 2-3 sentence portfolio description",
  "tech": ["Technology1", "Technology2"],
  "category": "Web App | Mobile App | API | Tool | Library | Other",
  "liveUrl": "URL if mentioned, otherwise empty string",
  "githubUrl": "GitHub URL if mentioned, otherwise empty string",
  "year": 2025
}

Rules:
- Use ONLY information found in the document. Never invent technologies or details.
- Write the description in professional, portfolio-friendly language.
- For the tech array, list specific technologies (React, Node.js, Firebase, etc.), not vague terms.
- If a field cannot be determined, use an empty string or empty array.
- Return ONLY the JSON object, no markdown fences, no explanation.

DOCUMENT CONTENT:
`;

async function generateProjectDetails(fileContent: string): Promise<Partial<Omit<Project, 'id'>>> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: AI_PROMPT + fileContent },
      ],
      max_tokens: 800,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API error ${res.status}`);
  }

  const data = await res.json();
  let raw = data.choices?.[0]?.message?.content ?? '';

  // Strip markdown fences if model wraps the JSON
  raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  const parsed = JSON.parse(raw);
  return {
    title: parsed.title ?? '',
    description: parsed.description ?? '',
    tech: Array.isArray(parsed.tech) ? parsed.tech : [],
    category: parsed.category ?? '',
    liveUrl: parsed.liveUrl ?? '',
    githubUrl: parsed.githubUrl ?? '',
    year: typeof parsed.year === 'number' ? parsed.year : new Date().getFullYear(),
  };
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Omit<Project, 'id'>>(empty);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [techInput, setTechInput] = useState('');

  // AI generation state
  const [generating, setGenerating] = useState(false);
  const [docFileName, setDocFileName] = useState('');
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProjects().then(data => { setProjects(data); setLoading(false); });
  }, []);

  const refresh = () => getProjects().then(setProjects);

  const openAdd = () => { setEditing(null); setForm(empty); setTechInput(''); setDocFileName(''); setShowForm(true); };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({ ...p });
    setTechInput(p.tech.join(', '));
    setDocFileName('');
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'portfolio/projects');
      setForm(f => ({ ...f, imageUrl: url }));
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── AI Document Upload & Generation ──
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['md', 'txt'].includes(ext ?? '')) {
      toast.error('Only .md and .txt files are supported');
      return;
    }

    // Validate file size (1MB limit)
    if (file.size > 1024 * 1024) {
      toast.error('File too large. Maximum size is 1MB.');
      return;
    }

    setDocFileName(file.name);
    setGenerating(true);

    try {
      // Read file content
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      if (!content.trim()) {
        toast.error('Document is empty');
        setGenerating(false);
        return;
      }

      // Call AI
      const result = await generateProjectDetails(content);

      // Auto-fill the form
      setForm(f => ({
        ...f,
        title: result.title || f.title,
        description: result.description || f.description,
        tech: result.tech?.length ? result.tech : f.tech,
        category: result.category || f.category,
        liveUrl: result.liveUrl || f.liveUrl,
        githubUrl: result.githubUrl || f.githubUrl,
        year: result.year || f.year,
      }));
      setTechInput((result.tech ?? []).join(', '));
      toast.success('AI generated project details! Review and save.');
    } catch (err: any) {
      console.error('AI generation failed:', err);
      toast.error(err.message ?? 'AI generation failed');
    } finally {
      setGenerating(false);
      // Reset file input so same file can be re-uploaded
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, tech: techInput.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editing?.id) {
        await updateProject(editing.id, data);
        toast.success('Project updated');
      } else {
        await addProject(data);
        toast.success('Project added');
      }
      await refresh();
      setShowForm(false);
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await deleteProject(id);
    toast.success('Deleted');
    await refresh();
  };

  const toggleFeatured = async (p: Project) => {
    await updateProject(p.id!, { featured: !p.featured });
    await refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid gap-4">
          {projects.map(p => (
            <div key={p.id} className="bg-[#111] border border-gray-800 rounded-xl p-5 flex items-center gap-4">
              {p.imageUrl && (
                <img src={p.imageUrl} alt={p.title} className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white truncate">{p.title}</h3>
                  {p.featured && <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full">Featured</span>}
                </div>
                <p className="text-gray-500 text-sm mt-0.5 truncate">{p.description}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {p.tech.slice(0, 4).map(t => (
                    <span key={t} className="text-xs bg-gray-900 text-gray-400 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleFeatured(p)} className="p-2 text-gray-500 hover:text-yellow-400 transition-colors" title="Toggle featured">
                  {p.featured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(p)} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id!)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="text-gray-600 text-center py-12">No projects yet. Add one!</p>}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Project' : 'Add Project'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            {/* ── AI Auto-Fill Section ── */}
            <div className="mb-6 p-4 rounded-xl border border-dashed border-purple-500/40 bg-purple-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">Generate with AI</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Upload a project doc (.md or .txt) to auto-fill all fields using AI.
              </p>

              <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm cursor-pointer transition-all duration-300 ${
                generating
                  ? 'bg-purple-900/20 border-purple-500/50 text-purple-300'
                  : 'bg-[#0a0a0a] border-gray-700 text-gray-300 hover:border-purple-500/50 hover:bg-purple-900/10'
              }`}>
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Analyzing <span className="font-mono text-purple-200">{docFileName}</span>…</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>{docFileName || 'Upload Document'}</span>
                    <Sparkles className="w-3 h-3 ml-auto text-purple-500" />
                  </>
                )}
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".md,.txt"
                  className="hidden"
                  onChange={handleDocUpload}
                  disabled={generating}
                />
              </label>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Title"><input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></Field>
              <Field label="Description"><textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Field>
              <Field label="Technologies (comma-separated)"><input value={techInput} onChange={e => setTechInput(e.target.value)} placeholder="React, TypeScript, Firebase" /></Field>
              <Field label="Category"><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></Field>
              <Field label="Year"><input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: +e.target.value }))} /></Field>
              <Field label="Live URL"><input value={form.liveUrl} onChange={e => setForm(f => ({ ...f, liveUrl: e.target.value }))} /></Field>
              <Field label="GitHub URL"><input value={form.githubUrl} onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))} /></Field>

              {/* Image Upload */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Project Image</label>
                {form.imageUrl && <img src={form.imageUrl} alt="preview" className="w-full h-32 object-cover rounded-lg mb-2" />}
                <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300 cursor-pointer hover:border-gray-500 transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading…' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="rounded" />
                Featured project
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-gray-700 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="[&>input]:w-full [&>input]:bg-[#0a0a0a] [&>input]:border [&>input]:border-gray-800 [&>input]:text-white [&>input]:rounded-lg [&>input]:px-4 [&>input]:py-2.5 [&>input]:text-sm [&>input]:outline-none [&>input]:transition-colors [&>textarea]:w-full [&>textarea]:bg-[#0a0a0a] [&>textarea]:border [&>textarea]:border-gray-800 [&>textarea]:text-white [&>textarea]:rounded-lg [&>textarea]:px-4 [&>textarea]:py-2.5 [&>textarea]:text-sm [&>textarea]:outline-none [&>textarea]:transition-colors [&>textarea]:resize-none">
        {children}
      </div>
    </div>
  );
}
