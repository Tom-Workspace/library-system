'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaBook, FaUsers, FaUserTie, FaPenNib, FaShoppingCart, FaBookReader } from 'react-icons/fa';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'الرئيسية', icon: <FaHome />, path: '/' },
    { name: 'الكتب', icon: <FaBook />, path: '/books' },
    { name: 'المؤلفين', icon: <FaPenNib />, path: '/authors' },
    { name: 'الموظفين', icon: <FaUserTie />, path: '/staff' },
    { name: 'العملاء', icon: <FaUsers />, path: '/members' },
    { name: 'الاستعارة', icon: <FaBookReader />, path: '/borrow' },
    { name: 'المبيعات', icon: <FaShoppingCart />, path: '/sales' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen fixed right-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-center">نظام المكتبة</h1>
      </div>
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}