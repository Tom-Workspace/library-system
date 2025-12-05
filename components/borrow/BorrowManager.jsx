'use client';
import { useState } from 'react';
import { FaBookReader, FaUndo, FaSearch, FaCalendarCheck, FaClock, FaExclamationTriangle, FaCheckCircle, FaExchangeAlt, FaUserClock, FaHistory, FaUserTie } from 'react-icons/fa';

export default function BorrowManager({ books, members, activeLoans, staff }) {
  const [activeTab, setActiveTab] = useState('new');
  const [loans, setLoans] = useState(activeLoans);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(''); // الموظف المسؤول
  const [loading, setLoading] = useState(false);

  const isOverdue = (borrowDate) => {
    const borrow = new Date(borrowDate);
    const today = new Date();
    const diffTime = Math.abs(today - borrow);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 14;
  };

  const stats = {
    active: loans.filter(l => l.Status === 'Active').length,
    overdue: loans.filter(l => l.Status === 'Active' && isOverdue(l.BorrowDate)).length,
    returnedToday: loans.filter(l => l.Status === 'Returned' && l.ReturnDate === new Date().toISOString().split('T')[0]).length
  };

  const filteredLoans = loans.filter(loan => 
    (loan.BookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     loan.MemberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     loan.RegisteredBy?.toLowerCase().includes(searchTerm.toLowerCase())) && // بحث باسم الموظف كمان
    (activeTab === 'history' ? loan.Status === 'Returned' : loan.Status === 'Active')
  );

  const handleBorrow = async (e) => {
    e.preventDefault();
    if(!selectedStaff) { alert('يجب اختيار الموظف المسؤول!'); return; }

    setLoading(true);
    await fetch('/api/borrow', {
      method: 'POST',
      body: JSON.stringify({
        bookId: selectedBook,
        memberId: selectedMember,
        registeredBy: selectedStaff, // بنبعت الاسم
        date: new Date().toISOString().split('T')[0]
      })
    });
    window.location.reload();
  };

  const handleReturn = async (loanId, bookId) => {
    if(!confirm('تأكيد استلام الكتاب وإعادته للمخزن؟')) return;
    await fetch('/api/borrow', {
      method: 'PUT',
      body: JSON.stringify({
        id: loanId,
        bookId: bookId,
        returnDate: new Date().toISOString().split('T')[0]
      })
    });
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards (زي ما هي) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <FaBookReader className="absolute right-[-20px] bottom-[-20px] text-9xl opacity-10" />
          <div className="relative z-10">
            <h3 className="text-blue-100 font-medium mb-1">استعارات جارية</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{stats.active}</span>
              <span className="text-sm opacity-80">كتاب بالخارج</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <FaExclamationTriangle className="absolute right-[-20px] bottom-[-20px] text-9xl opacity-10" />
          <div className="relative z-10">
            <h3 className="text-rose-100 font-medium mb-1">متأخرات (Overdue)</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{stats.overdue}</span>
              <span className="text-sm opacity-80">تجاوز 14 يوم</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <FaCheckCircle className="absolute right-[-20px] bottom-[-20px] text-9xl opacity-10" />
          <div className="relative z-10">
            <h3 className="text-emerald-100 font-medium mb-1">تم الإرجاع اليوم</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{stats.returnedToday}</span>
              <span className="text-sm opacity-80">عملية ناجحة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex gap-2 w-full md:w-fit mx-auto">
        <button onClick={() => setActiveTab('new')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'new' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><FaExchangeAlt /> تسجيل خروج</button>
        <button onClick={() => setActiveTab('active')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'active' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><FaUserClock /> استعارات نشطة</button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><FaHistory /> الأرشيف</button>
      </div>

      {/* Content Area */}
      {activeTab === 'new' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden max-w-4xl mx-auto flex flex-col md:flex-row animate-fadeIn">
          {/* Left Side */}
          <div className="hidden md:flex w-1/3 bg-slate-900 text-white p-8 flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-10"></div>
            <div className="relative z-10">
               <h3 className="text-2xl font-bold mb-2">تعليمات الإعارة</h3>
               <ul className="text-sm space-y-4 text-slate-300 list-disc list-inside">
                 <li>تأكد من هوية الطالب/العضو.</li>
                 <li>يجب تحديد <b>الموظف المسؤول</b>.</li>
                 <li>الحد الأقصى 3 كتب للعضو.</li>
               </ul>
            </div>
            <div className="relative z-10 opacity-50"><FaBookReader className="text-9xl" /></div>
          </div>

          {/* Right Side: Form */}
          <div className="flex-1 p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2 border-b pb-4">
              <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><FaExchangeAlt /></span>
              تسجيل خروج كتاب
            </h2>
            
            <form onSubmit={handleBorrow} className="space-y-6">
              {/* اختيار الموظف (جديد) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الموظف المسؤول (أمين المكتبة)</label>
                <div className="relative">
                   <FaUserTie className="absolute left-4 top-4 text-gray-400" />
                   <select 
                     className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-purple-100 bg-purple-50 focus:bg-white focus:border-purple-500 outline-none transition-all font-bold text-purple-800"
                     required
                     value={selectedStaff}
                     onChange={e => setSelectedStaff(e.target.value)}
                   >
                     <option value="">اختر اسمك من القائمة...</option>
                     {staff.map(s => <option key={s.ID} value={s.Name}>{s.Name}</option>)}
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اسم العضو / الطالب</label>
                <select className="w-full p-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition-all" required value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
                  <option value="">اختر العضو...</option>
                  {members.map(m => <option key={m.ID} value={m.ID}>{m.Name} (ID: {m.ID})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الكتاب المطلوب</label>
                <select className="w-full p-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition-all" required value={selectedBook} onChange={e => setSelectedBook(e.target.value)}>
                  <option value="">اختر الكتاب...</option>
                  {books.filter(b => b.StockAmount > 0).map(b => <option key={b.ID} value={b.ID}>{b.Title} (متاح: {b.StockAmount})</option>)}
                </select>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all flex justify-center items-center gap-2">
                {loading ? 'جاري التسجيل...' : 'تأكيد العملية'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History & Active Lists */}
      {activeTab !== 'new' && (
        <div className="animate-fadeIn">
          <div className="mb-6 relative max-w-md mx-auto">
            <input type="text" placeholder="بحث في الاستعارات..." className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredLoans.map(loan => {
              const overdue = loan.Status === 'Active' && isOverdue(loan.BorrowDate);
              
              return (
                <div key={loan.ID} className={`bg-white rounded-2xl border-l-8 shadow-sm hover:shadow-md transition-all p-5 flex flex-col sm:flex-row gap-4 justify-between items-center ${loan.Status === 'Returned' ? 'border-l-emerald-500' : overdue ? 'border-l-rose-500 bg-rose-50/30' : 'border-l-blue-500'}`}>
                  
                  <div className="flex-1 text-center sm:text-right">
                    <h4 className="font-bold text-lg text-gray-800 mb-1">{loan.BookTitle}</h4>
                    <p className="text-gray-500 text-sm flex items-center justify-center sm:justify-start gap-2 mb-2">
                       <FaUserClock className="text-gray-400" /> {loan.MemberName}
                    </p>
                    {/* عرض اسم الموظف */}
                    <p className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block mb-2 font-bold">
                       مسجل بواسطة: {loan.RegisteredBy || 'غير محدد'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start text-xs font-mono">
                      <span className="bg-gray-100 px-2 py-1 rounded border">Out: {loan.BorrowDate}</span>
                      {loan.ReturnDate && <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200">In: {loan.ReturnDate}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 min-w-[120px]">
                    {loan.Status === 'Active' ? (
                       overdue ? (
                         <div className="text-rose-600 flex flex-col items-center animate-pulse"><FaExclamationTriangle size={24} /><span className="text-xs font-bold mt-1">متأخر جداً</span></div>
                       ) : (
                         <div className="text-blue-600 flex flex-col items-center"><FaClock size={24} /><span className="text-xs font-bold mt-1">جاري</span></div>
                       )
                    ) : (
                      <div className="text-emerald-600 flex flex-col items-center"><FaCheckCircle size={24} /><span className="text-xs font-bold mt-1">تم الإرجاع</span></div>
                    )}

                    {loan.Status === 'Active' && (
                      <button onClick={() => handleReturn(loan.ID, loan.BookID)} className={`mt-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-md flex items-center gap-2 ${overdue ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        <FaUndo /> استرجاع
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {filteredLoans.length === 0 && <div className="text-center py-16 text-gray-400">لا توجد سجلات تطابق البحث</div>}
        </div>
      )}
    </div>
  );
}