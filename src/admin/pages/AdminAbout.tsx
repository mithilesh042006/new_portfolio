import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { getAbout, setAbout, type About } from '../../lib/firestore';
import { Spinner } from './AdminExperiences';

const defaultAbout: About = {
  name: 'Mithilesh',
  bio: 'I craft high-performance digital experiences at the intersection of design and code — blending immersive animations, elegant interfaces, and cutting-edge web technology.',
  email: 'hello@example.com',
  socials: { github: 'https://github.com/mithilesh042006', linkedin: 'https://www.linkedin.com/in/mithilesh-k-a0295632b/', instagram: '' },
};

export default function AdminAbout() {
  const [form, setForm] = useState<About>(defaultAbout);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAbout().then(data => { if (data) setForm(data); }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setAbout(form);
      toast.success('About section saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const inputCls = 'w-full bg-[#0a0a0a] border border-gray-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gray-500 transition-colors';

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">About</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section label="Name">
          <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </Section>

        <Section label="Bio">
          <textarea className={inputCls} rows={5} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} style={{ resize: 'none' }} />
        </Section>

        <Section label="Contact Email">
          <input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </Section>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Social Links</p>
          <div className="grid grid-cols-1 gap-3">
            {(['github', 'linkedin', 'instagram'] as const).map(key => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-gray-500 text-sm w-24 capitalize">{key}</span>
                <input
                  className={`${inputCls} flex-1`}
                  value={form.socials[key]}
                  onChange={e => setForm(f => ({ ...f, socials: { ...f.socials, [key]: e.target.value } }))}
                  placeholder={`https://${key}.com/…`}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
