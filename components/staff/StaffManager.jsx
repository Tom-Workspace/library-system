'use client';
import { useState } from 'react';
import { FaPlus, FaUserTie, FaTrash, FaEdit, FaSearch, FaPhone, FaMoneyBillWave, FaBriefcase, FaUsers } from 'react-icons/fa';

export default function StaffManager({ initialData }) {
  const [staff, setStaff] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', role: '', phone: '', salary: '' });

  const stats = {
    count: staff.length,
    totalPayroll: staff.reduce((sum, member) => sum + Number(member.Salary), 0),
    avgSalary: staff.length > 0 ? Math.round(staff.reduce((sum, member) => sum + Number(member.Salary), 0) / staff.length) : 0
  };

  // 2. الفلترة والبحث
  const filteredStaff = staff.filter(member => 
    member.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.Phone.includes(searchTerm) ||
    member.Role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const refreshData = async () => {
    const res = await fetch('/api/staff');
    const data = await res.json();
    setStaff(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    await fetch('/api/staff', { method: method, body: JSON.stringify(form) });
    setForm({ id: null, name: '', role: '', phone: '', salary: '' });
    setIsOpen(false);
    refreshData();
  };

  const handleEdit = (member) => {
    setForm({ id: member.ID, name: member.Name, role: member.Role, phone: member.Phone, salary: member.Salary });
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if(!confirm('تحذير: هل أنت متأكد من فصل هذا الموظف وحذف بياناته؟')) return;
    await fetch('/api/staff', { method: 'DELETE', body: JSON.stringify({ id }) });
    refreshData();
  };

  const openNew = () => {
    setForm({ id: null, name: '', role: '', phone: '', salary: '' });
    setIsOpen(true);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. HR Dashboard Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
            <FaUsers size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">إجمالي الموظفين</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.count}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-xl text-green-600">
            <FaMoneyBillWave size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">الرواتب الشهرية</p>
            <h3 className="text-3xl font-bold text-gray-800">${stats.totalPayroll.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <FaBriefcase size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">متوسط الرواتب</p>
            <h3 className="text-3xl font-bold text-gray-800">${stats.avgSalary.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* 2. Toolbar & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           فريق العمل
        </h2>
        
        <div className="flex-1 w-full md:max-w-xl flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="بحث عن موظف (الاسم، الوظيفة، الهاتف)..."
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute right-4 top-4 text-gray-400" />
          </div>
          <button 
            onClick={openNew} 
            className="bg-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:bg-purple-700 transition-all hover:-translate-y-0.5"
          >
            <FaPlus /> توظيف
          </button>
        </div>
      </div>

      {/* 3. Professional Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStaff.map((member) => (
          <div key={member.ID} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-200 shadow-sm hover:shadow-xl transition-all duration-300 group relative">
            
            {/* Action Buttons (Hidden) */}
            <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => handleEdit(member)} className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors" title="تعديل"><FaEdit /></button>
               <button onClick={() => handleDelete(member.ID)} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition-colors" title="فصل"><FaTrash /></button>
            </div>

            {/* Profile Header */}
            <div className="flex flex-col items-center text-center mb-4">
              <div className={`${getAvatarColor(member.Name)} w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-md border-4 border-white`}>
                {member.Name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{member.Name}</h3>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold mt-2 border border-purple-100">
                {member.Role}
              </span>
            </div>

            {/* Contact & Info */}
            <div className="space-y-3 pt-4 border-t border-gray-50">
              <a href={`tel:${member.Phone}`} className="flex items-center justify-center gap-2 text-gray-500 hover:text-purple-600 transition-colors bg-gray-50 py-2 rounded-lg group-hover:bg-purple-50">
                <FaPhone className="text-sm" /> 
                <span className="text-sm font-medium font-mono">{member.Phone}</span>
              </a>
              
              <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                  <FaMoneyBillWave /> الراتب
                </span>
                <span className="text-green-700 font-bold font-mono">${member.Salary}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
            <FaUserTie className="text-gray-300 text-4xl" />
          </div>
          <p className="text-gray-500 font-medium">لا يوجد موظفين بهذا الاسم</p>
        </div>
      )}

      {/* 4. Modal Form (Professional) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
              {form.id ? 'تعديل بيانات موظف' : 'تسجيل تعيين جديد'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الثلاثي</label>
                <input className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">المسمى الوظيفي</label>
                  <input className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" required value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="مثال: أمين مكتبة" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                  <input className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الراتب الشهري ($)</label>
                <div className="relative">
                   <FaMoneyBillWave className="absolute right-4 top-4 text-green-500" />
                   <input type="number" className="w-full border p-3 pr-10 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-green-700" required value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8 pt-4 border-t">
                <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">إلغاء</button>
                <button type="submit" className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg transition-all">حفظ البيانات</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}