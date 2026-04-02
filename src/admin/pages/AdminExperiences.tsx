import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import {
  getExperiences, addExperience, updateExperience, deleteExperience, type Experience,
} from '../../lib/firestore';

const empty: Omit<Experience, 'id'> = { role: '', company: '', period: '', description: '', order: 0 };

export default function AdminExperiences() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState<Omit<Experience, 'id'>>(empty);
  const [showForm, setShowForm] = useState(false);

  const refresh = () => getExperiences().then(setItems);
  useEffect(() => { refresh().finally(() => setLoading(false)); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (e: Experience) => { setEditing(e); setForm({ ...e }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing?.id) { await updateExperience(editing.id, form); toast.success('Updated'); }
      else { await addExperience(form); toast.success('Added'); }
      await refresh(); setShowForm(false);
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await deleteExperience(id); toast.success('Deleted'); await refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Experiences</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-[#111] border border-gray-800 rounded-xl p-5 flex items-start gap-4">
              <div className="flex-1">
                <p className="font-semibold">{item.role}</p>
                <p className="text-gray-400 text-sm mt-0.5">{item.company} · {item.period}</p>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{item.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id!)} className="p-2 text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-600 text-center py-12">No experiences yet.</p>}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Experience' : 'Add Experience'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Role"><input required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></Field>
            <Field label="Company"><input required value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></Field>
            <Field label="Period"><input required value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} placeholder="Jan 2023 – Present" /></Field>
            <Field label="Description"><textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Field>
            <Field label="Order (display position)"><input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: +e.target.value }))} /></Field>
            <ModalActions onCancel={() => setShowForm(false)} />
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

export function Spinner() {
  return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>;
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="[&>input]:w-full [&>input]:bg-[#0a0a0a] [&>input]:border [&>input]:border-gray-800 [&>input]:text-white [&>input]:rounded-lg [&>input]:px-4 [&>input]:py-2.5 [&>input]:text-sm [&>input]:outline-none [&>input]:transition-colors [&>textarea]:w-full [&>textarea]:bg-[#0a0a0a] [&>textarea]:border [&>textarea]:border-gray-800 [&>textarea]:text-white [&>textarea]:rounded-lg [&>textarea]:px-4 [&>textarea]:py-2.5 [&>textarea]:text-sm [&>textarea]:outline-none [&>textarea]:transition-colors [&>textarea]:resize-none">
        {children}
      </div>
    </div>
  );
}

export function ModalActions({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-gray-700 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
      <button type="submit" className="flex-1 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
        <Check className="w-4 h-4" /> Save
      </button>
    </div>
  );
}
