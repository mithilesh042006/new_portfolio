import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Check, GripVertical } from 'lucide-react';
import {
  getSkills, addSkill, updateSkill, deleteSkill, type Skill,
} from '../../lib/firestore';

const empty: Omit<Skill, 'id'> = {
  name: '', iconUrl: '', category: '', order: 0,
};

// Popular skill icon CDN helper
const ICON_CDN = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';
const ICON_SUGGESTIONS: Record<string, string> = {
  'React': `${ICON_CDN}/react/react-original.svg`,
  'TypeScript': `${ICON_CDN}/typescript/typescript-original.svg`,
  'JavaScript': `${ICON_CDN}/javascript/javascript-original.svg`,
  'Python': `${ICON_CDN}/python/python-original.svg`,
  'Node.js': `${ICON_CDN}/nodejs/nodejs-original.svg`,
  'Next.js': `${ICON_CDN}/nextjs/nextjs-original.svg`,
  'Firebase': `${ICON_CDN}/firebase/firebase-original.svg`,
  'Tailwind CSS': `${ICON_CDN}/tailwindcss/tailwindcss-original.svg`,
  'HTML5': `${ICON_CDN}/html5/html5-original.svg`,
  'CSS3': `${ICON_CDN}/css3/css3-original.svg`,
  'Git': `${ICON_CDN}/git/git-original.svg`,
  'GitHub': `${ICON_CDN}/github/github-original.svg`,
  'Docker': `${ICON_CDN}/docker/docker-original.svg`,
  'MongoDB': `${ICON_CDN}/mongodb/mongodb-original.svg`,
  'PostgreSQL': `${ICON_CDN}/postgresql/postgresql-original.svg`,
  'MySQL': `${ICON_CDN}/mysql/mysql-original.svg`,
  'Java': `${ICON_CDN}/java/java-original.svg`,
  'C++': `${ICON_CDN}/cplusplus/cplusplus-original.svg`,
  'C': `${ICON_CDN}/c/c-original.svg`,
  'Figma': `${ICON_CDN}/figma/figma-original.svg`,
  'Flutter': `${ICON_CDN}/flutter/flutter-original.svg`,
  'Dart': `${ICON_CDN}/dart/dart-original.svg`,
  'Kotlin': `${ICON_CDN}/kotlin/kotlin-original.svg`,
  'Swift': `${ICON_CDN}/swift/swift-original.svg`,
  'Go': `${ICON_CDN}/go/go-original.svg`,
  'Rust': `${ICON_CDN}/rust/rust-original.svg`,
  'Redux': `${ICON_CDN}/redux/redux-original.svg`,
  'Express': `${ICON_CDN}/express/express-original.svg`,
  'Vue.js': `${ICON_CDN}/vuejs/vuejs-original.svg`,
  'Angular': `${ICON_CDN}/angular/angular-original.svg`,
  'Django': `${ICON_CDN}/django/django-plain.svg`,
  'Flask': `${ICON_CDN}/flask/flask-original.svg`,
  'AWS': `${ICON_CDN}/amazonwebservices/amazonwebservices-plain-wordmark.svg`,
  'Linux': `${ICON_CDN}/linux/linux-original.svg`,
  'VS Code': `${ICON_CDN}/vscode/vscode-original.svg`,
  'Photoshop': `${ICON_CDN}/photoshop/photoshop-original.svg`,
  'Three.js': `${ICON_CDN}/threejs/threejs-original.svg`,
  'Vite': `${ICON_CDN}/vitejs/vitejs-original.svg`,
};

const CATEGORY_PRESETS = ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Design', 'Languages', 'Tools', 'Other'];

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<Omit<Skill, 'id'>>(empty);
  const [showForm, setShowForm] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nameFilter, setNameFilter] = useState('');

  useEffect(() => {
    getSkills().then(data => {
      setSkills(data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setLoading(false);
    });
  }, []);

  const refresh = () => getSkills().then(data =>
    setSkills(data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ ...empty, order: skills.length });
    setShowForm(true);
    setShowSuggestions(false);
    setNameFilter('');
  };

  const openEdit = (s: Skill) => {
    setEditing(s);
    setForm({ ...s });
    setShowForm(true);
    setShowSuggestions(false);
    setNameFilter('');
  };

  const pickSuggestion = (name: string, url: string) => {
    setForm(f => ({ ...f, name, iconUrl: url }));
    setShowSuggestions(false);
    setNameFilter('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing?.id) {
        await updateSkill(editing.id, form);
        toast.success('Skill updated');
      } else {
        await addSkill(form);
        toast.success('Skill added');
      }
      await refresh();
      setShowForm(false);
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    await deleteSkill(id);
    toast.success('Deleted');
    await refresh();
  };

  // Group for display
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    const cat = s.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const filteredSuggestions = Object.entries(ICON_SUGGESTIONS).filter(
    ([name]) => name.toLowerCase().includes(nameFilter.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Skills</h1>
          <p className="text-gray-500 text-sm mt-1">Manage skills shown on the portfolio</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>
      ) : skills.length === 0 ? (
        <p className="text-gray-600 text-center py-12">No skills yet. Add one!</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, catSkills]) => (
            <div key={category}>
              <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-semibold">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {catSkills.map(s => (
                  <div key={s.id} className="bg-[#111] border border-gray-800 rounded-xl p-4 flex items-center gap-3 group hover:border-gray-600 transition-colors">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      {s.iconUrl ? (
                        <img src={s.iconUrl} alt={s.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <GripVertical className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-white flex-1 truncate">{s.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(s.id!)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Skill' : 'Add Skill'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            {/* Quick Pick from library */}
            {!editing && (
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  {showSuggestions ? '✕ Close icon library' : '✦ Pick from icon library'}
                </button>

                {showSuggestions && (
                  <div className="mt-3 p-3 bg-[#0a0a0a] border border-gray-800 rounded-xl">
                    <input
                      type="text"
                      placeholder="Search icons..."
                      value={nameFilter}
                      onChange={e => setNameFilter(e.target.value)}
                      className="w-full bg-transparent border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none mb-3 placeholder-gray-600"
                    />
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                      {filteredSuggestions.map(([name, url]) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => pickSuggestion(name, url)}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                          title={name}
                        >
                          <img src={url} alt={name} className="w-6 h-6 object-contain" />
                          <span className="text-[10px] text-gray-500 truncate w-full text-center">{name}</span>
                        </button>
                      ))}
                      {filteredSuggestions.length === 0 && (
                        <p className="col-span-4 text-xs text-gray-600 text-center py-4">No matches. Enter a custom URL below.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Skill Name</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none"
                  placeholder="e.g. React"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Icon URL</label>
                <div className="flex items-center gap-3">
                  {form.iconUrl && (
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-700">
                      <img src={form.iconUrl} alt="preview" className="w-6 h-6 object-contain" />
                    </div>
                  )}
                  <input
                    required
                    value={form.iconUrl}
                    onChange={e => setForm(f => ({ ...f, iconUrl: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none"
                    placeholder="https://cdn.jsdelivr.net/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none appearance-none"
                >
                  <option value="">Select category</option>
                  {CATEGORY_PRESETS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Order</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: +e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none"
                />
              </div>

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
