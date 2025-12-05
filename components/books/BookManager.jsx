'use client';
import { useState } from 'react';
import { FaPlus, FaBook, FaTrash, FaEdit, FaSearch, FaBarcode, FaFilter, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

export default function BookManager({ initialBooks, authors }) {
  const [books, setBooks] = useState(initialBooks);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, low-stock, out-of-stock
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ id: null, title: '', authorId: '', category: '', isbn: '', price: '', stock: '' });

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.ISBN?.includes(searchTerm) ||
      book.AuthorName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = 
      filterType === 'all' ? true :
      filterType === 'low-stock' ? (book.StockAmount > 0 && book.StockAmount < 5) :
      filterType === 'out-of-stock' ? book.StockAmount === 0 : true;

    return matchesSearch && matchesType;
  });

  // حساب الإحصائيات السريعة
  const stats = {
    total: books.length,
    lowStock: books.filter(b => b.StockAmount > 0 && b.StockAmount < 5).length,
    outOfStock: books.filter(b => b.StockAmount === 0).length
  };

  const refreshData = async () => {
    const res = await fetch('/api/books');
    const data = await res.json();
    setBooks(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    await fetch('/api/books', { method: method, body: JSON.stringify(form) });
    setForm({ id: null, title: '', authorId: '', category: '', isbn: '', price: '', stock: '' });
    setIsOpen(false);
    refreshData();
  };

  const handleEdit = (book) => {
    setForm({
      id: book.ID, title: book.Title, authorId: book.AuthorID, category: book.Category,
      isbn: book.ISBN, price: book.Price, stock: book.StockAmount
    });
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if(!confirm('تأكيد حذف الكتاب نهائياً من قاعدة البيانات؟')) return;
    await fetch('/api/books', { method: 'DELETE', body: JSON.stringify({ id }) });
    refreshData();
  };

  const openNew = () => {
    setForm({ id: null, title: '', authorId: '', category: '', isbn: '', price: '', stock: '' });
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">إدارة المخزن والكتب</h2>
          <p className="text-gray-500 mt-1">
            إجمالي الكتب: <span className="font-bold text-gray-800">{stats.total}</span> | 
            نواقص: <span className="font-bold text-orange-600">{stats.lowStock}</span> | 
            نفذت: <span className="font-bold text-red-600">{stats.outOfStock}</span>
          </p>
        </div>
        
        <button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 font-bold transform hover:-translate-y-1">
          <FaPlus /> إضافة كتاب جديد
        </button>
      </div>

      {/* 2. Advanced Toolbar (Search & Filter) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="بحث شامل (اسم الكتاب، المؤلف، ISBN)..."
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute right-4 top-4 text-gray-400" />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filterType === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            الكل
          </button>
          <button 
            onClick={() => setFilterType('low-stock')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${filterType === 'low-stock' ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500' : 'bg-gray-50 text-gray-600 hover:bg-orange-50'}`}
          >
            <FaExclamationTriangle /> وشك النفاذ
          </button>
          <button 
            onClick={() => setFilterType('out-of-stock')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${filterType === 'out-of-stock' ? 'bg-red-100 text-red-700 ring-2 ring-red-500' : 'bg-gray-50 text-gray-600 hover:bg-red-50'}`}
          >
            <FaBarcode /> نفذت الكمية
          </button>
        </div>
      </div>

      {/* 3. Professional Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBooks.map((book) => {
          const stockStatus = book.StockAmount === 0 ? 'out' : book.StockAmount < 5 ? 'low' : 'good';
          const cardBorder = stockStatus === 'out' ? 'border-red-200' : stockStatus === 'low' ? 'border-orange-200' : 'border-gray-100';

          return (
            <div key={book.ID} className={`bg-white rounded-2xl p-6 border ${cardBorder} shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}>
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4 z-10">
                {stockStatus === 'out' && <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">نفذت الكمية</span>}
                {stockStatus === 'low' && <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">باقي {book.StockAmount} فقط</span>}
                {stockStatus === 'good' && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><FaCheckCircle/> متاح</span>}
              </div>

              {/* Action Buttons (Hover Effect) */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300 z-20">
                <button onClick={() => handleEdit(book)} className="bg-white text-blue-600 p-2 rounded-lg shadow-md hover:bg-blue-50 border border-blue-100" title="تعديل"><FaEdit /></button>
                <button onClick={() => handleDelete(book.ID)} className="bg-white text-red-500 p-2 rounded-lg shadow-md hover:bg-red-50 border border-red-100" title="حذف"><FaTrash /></button>
              </div>

              <div className="flex gap-5">
                {/* Book Cover / Icon */}
                <div className={`w-24 h-32 rounded-xl flex items-center justify-center text-4xl shadow-inner shrink-0 ${stockStatus === 'out' ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600'}`}>
                  <FaBook />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1 truncate" title={book.Title}>{book.Title}</h3>
                    <p className="text-gray-500 text-sm truncate">{book.AuthorName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-gray-500 font-mono">{book.Category || 'عام'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">سعر البيع</p>
                      <p className="font-bold text-xl text-gray-800">${book.Price}</p>
                    </div>
                    {stockStatus === 'good' && (
                       <div className="text-right">
                         <p className="text-xs text-gray-400 mb-0.5">المخزن</p>
                         <p className="font-bold text-gray-600">{book.StockAmount}</p>
                       </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Barcode Footer */}
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-mono">
                <span className="flex items-center gap-1"><FaBarcode /> {book.ISBN || 'NO-ISBN'}</span>
                <span>ID: #{book.ID}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBooks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <FaFilter className="text-gray-300 text-3xl" />
          </div>
          <p className="text-gray-500 font-medium">لا توجد كتب تطابق معايير البحث الحالية</p>
          <button onClick={() => {setSearchTerm(''); setFilterType('all');}} className="mt-4 text-blue-600 hover:underline text-sm">إعادة تعيين الفلاتر</button>
        </div>
      )}

      {/* Modal Form */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl transform transition-all scale-100">
            <h3 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4 flex items-center gap-2">
              {form.id ? <><FaEdit className="text-blue-500"/> تعديل بيانات الكتاب</> : <><FaPlus className="text-blue-500"/> إضافة كتاب جديد للمخزن</>}
            </h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الكتاب</label>
                <input className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">المؤلف</label>
                <select className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required value={form.authorId} onChange={e => setForm({...form, authorId: e.target.value})}>
                  <option value="">اختر المؤلف...</option>
                  {authors.map(a => <option key={a.ID} value={a.ID}>{a.Name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">التصنيف</label>
                <input className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">سعر البيع ($)</label>
                <input type="number" className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الكمية بالمخزن</label>
                <input type="number" className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">ISBN / الباركود الدولي</label>
                <div className="relative">
                  <input className="w-full border p-3 pl-10 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} />
                  <FaBarcode className="absolute left-3 top-4 text-gray-400" />
                </div>
              </div>

              <div className="col-span-2 flex gap-3 justify-end mt-4 pt-4 border-t">
                <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors">إلغاء</button>
                <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">حفظ البيانات</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}