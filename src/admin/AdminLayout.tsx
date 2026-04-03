import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';
import {
  FolderOpen, Briefcase, GraduationCap, MessageSquare, User, LogOut, LayoutDashboard, Image, Wrench, Inbox,
} from 'lucide-react';

const navItems = [
  { to: '/admin/projects',      label: 'Projects',       icon: FolderOpen },
  { to: '/admin/experiences',   label: 'Experiences',    icon: Briefcase },
  { to: '/admin/qualifications',label: 'Qualifications', icon: GraduationCap },
  { to: '/admin/testimonials',  label: 'Testimonials',   icon: MessageSquare },
  { to: '/admin/gallery',       label: 'Gallery',        icon: Image },
  { to: '/admin/skills',        label: 'Skills',         icon: Wrench },
  { to: '/admin/messages',      label: 'Messages',       icon: Inbox },
  { to: '/admin/about',         label: 'About',          icon: User },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-900 flex flex-col fixed h-full">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-gray-900">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-sm tracking-wide">Portfolio Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-900">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/10 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
