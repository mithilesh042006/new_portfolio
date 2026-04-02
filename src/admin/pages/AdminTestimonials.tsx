import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  getTestimonials, addTestimonial, updateTestimonial, deleteTestimonial, type Testimonial,
} from '../../lib/firestore';
import { Modal, Field, ModalActions, Spinner } from './AdminExperiences';

const empty: Omit<Testimonial, 'id'> = { quote: '', author: '', role: '' };

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<Omit<Testimonial, 'id'>>(empty);
  const [showForm, setShowForm] = useState(false);

  const refresh = () => getTestimonials().then(setItems);
  useEffect(() => { refresh().finally(() => setLoading(false)); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setForm({ ...t }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing?.id) { await updateTestimonial(editing.id, form); toast.success('Updated'); }
      else { await addTestimonial(form); toast.success('Added'); }
      await refresh(); setShowForm(false);
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await deleteTestimonial(id); toast.success('Deleted'); await refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-[#111] border border-gray-800 rounded-xl p-5 flex items-start gap-4">
              <div className="flex-1">
                <p className="text-gray-300 italic">"{item.quote}"</p>
                <p className="text-white font-semibold mt-3">{item.author}</p>
                <p className="text-gray-500 text-sm">{item.role}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id!)} className="p-2 text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-600 text-center py-12">No testimonials yet.</p>}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Testimonial' : 'Add Testimonial'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Quote"><textarea required rows={4} value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} /></Field>
            <Field label="Author Name"><input required value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} /></Field>
            <Field label="Role / Company"><input required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></Field>
            <ModalActions onCancel={() => setShowForm(false)} />
          </form>
        </Modal>
      )}
    </div>
  );
}
