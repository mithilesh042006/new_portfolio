import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  getQualifications, addQualification, updateQualification, deleteQualification, type Qualification,
} from '../../lib/firestore';
import { Modal, Field, ModalActions, Spinner } from './AdminExperiences';

const empty: Omit<Qualification, 'id'> = { title: '', institution: '', year: '', description: '', iconName: 'GraduationCap', order: 0 };

export default function AdminQualifications() {
  const [items, setItems] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Qualification | null>(null);
  const [form, setForm] = useState<Omit<Qualification, 'id'>>(empty);
  const [showForm, setShowForm] = useState(false);

  const refresh = () => getQualifications().then(setItems);
  useEffect(() => { refresh().finally(() => setLoading(false)); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (q: Qualification) => { setEditing(q); setForm({ ...q }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing?.id) { await updateQualification(editing.id, form); toast.success('Updated'); }
      else { await addQualification(form); toast.success('Added'); }
      await refresh(); setShowForm(false);
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await deleteQualification(id); toast.success('Deleted'); await refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Qualifications</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
          <Plus className="w-4 h-4" /> Add Qualification
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-[#111] border border-gray-800 rounded-xl p-5 flex items-start gap-4">
              <div className="flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-gray-400 text-sm mt-0.5">{item.institution} · {item.year}</p>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{item.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id!)} className="p-2 text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-600 text-center py-12">No qualifications yet.</p>}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Qualification' : 'Add Qualification'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Title"><input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></Field>
            <Field label="Institution"><input required value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} /></Field>
            <Field label="Year"><input required value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2022 – 2024" /></Field>
            <Field label="Description"><textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Field>
            <Field label="Icon Name (Lucide)"><input value={form.iconName} onChange={e => setForm(f => ({ ...f, iconName: e.target.value }))} placeholder="GraduationCap" /></Field>
            <Field label="Order"><input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: +e.target.value }))} /></Field>
            <ModalActions onCancel={() => setShowForm(false)} />
          </form>
        </Modal>
      )}
    </div>
  );
}
