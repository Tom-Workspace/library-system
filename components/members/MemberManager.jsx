'use client';
import { useState } from 'react';
import { FaPlus, FaUser, FaSearch, FaPhone, FaTrash, FaEdit, FaIdCard, FaCalendarAlt, FaBarcode, FaWhatsapp } from 'react-icons/fa';
import { MdSimCard } from 'react-icons/md'; 

export default function MemberManager({ initialData }) {
  const [members, setMembers] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', phone: '', date: new Date().toISOString().split('T')[0] });

  const stats = {
    total: members.length,
    newThisMonth: members.filter(m => m.MembershipDate.startsWith(new Date().toISOString().slice(0, 7))).length
  };

  const filteredMembers = members.filter(m => 
    m.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.Phone.includes(searchTerm)
  );

  const getCardGradient = (id) => {
    const gradients = [
      'from-blue-600 to-blue-800',
      'from-emerald-600 to-emerald-800',
      'from-violet-600 to-violet-800',
      'from-rose-600 to-rose-800',
      'from-slate-600 to-slate-800'
    ];
    return gradients[id % gradients.length];
  };

  const refreshData = async () => {
    const res = await fetch('/api/members');
    const data = await res.json();
    setMembers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    await fetch('/api/members', { method: method, body: JSON.stringify(form) });
    setForm({ id: null, name: '', phone: '', date: new Date().toISOString().split('T')[0] });
    setIsOpen(false);
    refreshData();
  };

  const handleEdit = (member) => {
    setForm({ id: member.ID, name: member.Name, phone: member.Phone, date: member.MembershipDate });
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if(!confirm('هل أنت متأكد من إلغاء عضوية هذا العميل؟')) return;
    await fetch('/api/members', { method: 'DELETE', body: JSON.stringify({ id }) });
    refreshData();
  };

  const openNew = () => {
    setForm({ id: null, name: '', phone: '', date: new Date().toISOString().split('T')[0] });
    setIsOpen(true);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaIdCard className="text-green-600" /> قاعدة بيانات العملاء
          </h2>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="bg-gray-100 p-2 rounded-lg font-bold text-xl">{stats.total}</span>
              <span className="text-sm">إجمالي الأعضاء</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <span className="bg-green-50 p-2 rounded-lg font-bold text-xl">+{stats.newThisMonth}</span>
              <span className="text-sm">جديد هذا الشهر</span>
            </div>
          </div>
        </div>

        <button 
          onClick={openNew} 
          className="bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:bg-green-700 transition-all hover:-translate-y-1"
        >
          <FaPlus /> عضوية جديدة
        </button>
      </div>

      {/* 2. Search */}
      <div className="relative max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="بحث سريع (الاسم أو رقم الهاتف)..."
          className="w-full pl-12 pr-6 py-4 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-green-500 outline-none text-lg transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute left-5 top-5 text-gray-400 text-xl" />
      </div>

      {/* 3. Membership Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.ID} className="group relative perspective">
            
            {/* The Card Design */}
            <div className={`relative h-56 rounded-2xl overflow-hidden text-white shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 bg-gradient-to-br ${getCardGradient(member.ID)}`}>
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

              {/* Card Header */}
              <div className="relative z-10 p-5 flex justify-between items-start">
                <div>
                  <h3 className="text-sm opacity-80 uppercase tracking-widest font-bold mb-1">Library Member</h3>
                  <MdSimCard className="text-4xl text-yellow-400 rotate-90" />
                </div>
                <div className="text-right">
                  <FaUser className="text-4xl opacity-20" />
                </div>
              </div>

              {/* Card Body */}
              <div className="relative z-10 px-6 pt-2">
                <h2 className="text-2xl font-bold tracking-wide truncate" title={member.Name}>{member.Name}</h2>
                <p className="font-mono opacity-80 mt-1 flex items-center gap-2">
                  <span className="text-xs">ID:</span> 
                  {String(member.ID).padStart(8, '0')}
                </p>
              </div>

              {/* Card Footer */}
              <div className="absolute bottom-0 w-full bg-black/20 backdrop-blur-sm p-3 flex justify-between items-center px-6">
                <div className="flex items-center gap-2 text-xs font-mono opacity-80">
                  <FaCalendarAlt /> Since: {member.MembershipDate}
                </div>
                <FaBarcode className="text-3xl opacity-60" />
              </div>

            </div>

            {/* Quick Actions (Floating below card) */}
            <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-y-2 group-hover:translate-y-0">
              <a href={`tel:${member.Phone}`} className="bg-white text-green-600 p-3 rounded-full shadow-lg hover:bg-green-50" title="اتصال">
                <FaPhone />
              </a>
              <a href={`https://wa.me/${member.Phone}`} target="_blank" className="bg-white text-green-500 p-3 rounded-full shadow-lg hover:bg-green-50" title="واتساب">
                <FaWhatsapp />
              </a>
              <button onClick={() => handleEdit(member)} className="bg-white text-blue-600 p-3 rounded-full shadow-lg hover:bg-blue-50" title="تعديل">
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(member.ID)} className="bg-white text-red-600 p-3 rounded-full shadow-lg hover:bg-red-50" title="حذف">
                <FaTrash />
              </button>
            </div>
            
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
          <FaIdCard className="text-gray-300 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-500">لا يوجد أعضاء بهذا الاسم</h3>
        </div>
      )}

      {/* 4. Modal Form */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
              {form.id ? 'تعديل بيانات عضو' : 'إصدار عضوية جديدة'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اسم العضو</label>
                <div className="relative">
                   <FaUser className="absolute right-4 top-4 text-gray-400" />
                   <input className="w-full border p-3 pr-10 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                <div className="relative">
                   <FaPhone className="absolute right-4 top-4 text-gray-400" />
                   <input className="w-full border p-3 pr-10 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الاشتراك</label>
                <input type="date" className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>

              <div className="flex gap-3 justify-end pt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">إلغاء</button>
                <button type="submit" className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg">حفظ وطباعة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}