'use client';
import { FaBook, FaUsers, FaUserTie, FaDollarSign } from 'react-icons/fa';

export default function DashboardStats({ stats }) {
  const cards = [
    { title: 'إجمالي الكتب', value: stats.books, icon: <FaBook />, color: 'bg-blue-500' },
    { title: 'العملاء', value: stats.members, icon: <FaUsers />, color: 'bg-green-500' },
    { title: 'الموظفين', value: stats.staff, icon: <FaUserTie />, color: 'bg-purple-500' },
    { title: 'المبيعات', value: stats.sales, icon: <FaDollarSign />, color: 'bg-orange-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{card.title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
          </div>
          <div className={`${card.color} text-white p-3 rounded-lg shadow-md`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}