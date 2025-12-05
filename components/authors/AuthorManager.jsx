'use client';
import { useState } from 'react';
import { FaPlus, FaPenNib, FaTrash, FaEdit, FaSearch, FaFeatherAlt, FaQuoteRight, FaBookOpen, FaTimes, FaBook, FaBarcode } from 'react-icons/fa';

export default function AuthorManager({ initialData }) {
  const [authors, setAuthors] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for Edit/Add Modal
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', bio: '' });

  // States for "View Books" Modal
  const [isBooksModalOpen, setIsBooksModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorBooks, setAuthorBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  // Stats
  const stats = {
    count: authors.length,
    withBio: authors.filter(a => a.Bio && a.Bio.length > 10).length
  };

  const filteredAuthors = authors.filter(author => 
    author.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (author.Bio && author.Bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getAvatarColor = (name) => {
    const colors = ['bg-indigo-600', 'bg-rose-600', 'bg-teal-600', 'bg-amber-600', 'bg-slate-600', 'bg-cyan-700'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getBookCoverColor = (id) => {
    const colors = ['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-orange-100 text-orange-600'];
    return colors[id % colors.length];
  };

  const refreshData = async () => {
    const res = await fetch('/api/authors');
    const data = await res.json();
    setAuthors(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    await fetch('/api/authors', { method: method, body: JSON.stringify(form) });
    setForm({ id: null, name: '', bio: '' });
    setIsOpen(false);
    refreshData();
  };

  const handleEdit = (author) => {
    setForm({ id: author.ID, name: author.Name, bio: author.Bio });
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if(!confirm('تحذير: حذف المؤلف سيؤدي لمشاكل في الكتب المرتبطة به. هل أنت متأكد؟')) return;
    await fetch('/api/authors', { method: 'DELETE', body: JSON.stringify({ id }) });
    refreshData();
  };

  const openNew = () => {
    setForm({ id: null, name: '', bio: '' });
    setIsOpen(true);
  };

  const handleViewBooks = async (author) => {
    setSelectedAuthor(author);
    setIsBooksModalOpen(true);
    setLoadingBooks(true);

    try {

      const res = await fetch('/api/books');
      const allBooks = await res.json();
      const myBooks = allBooks.filter(b => b.AuthorID === author.ID);
      setAuthorBooks(myBooks);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء جلب الكتب');
    } finally {
      setLoadingBooks(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header & Stats  */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <FaFeatherAlt className="absolute left-10 top-1/2 -translate-y-1/2 text-white opacity-5 text-9xl transform -rotate-12" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3"><FaPenNib className="text-amber-400" /> نخبة المؤلفين</h2>
            <p className="text-slate-400 mt-2 text-lg">إدارة بيانات الكتاب والمبدعين في المكتبة</p>
          </div>
          <div className="flex gap-8 text-center">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <h3 className="text-4xl font-bold text-amber-400">{stats.count}</h3>
              <p className="text-xs text-slate-300 mt-1">مؤلف مسجل</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <input type="text" placeholder="ابحث عن مؤلف..." className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <FaSearch className="absolute right-4 top-4 text-gray-400" />
        </div>
        <button onClick={openNew} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"><FaPlus /> تسجيل مؤلف</button>
      </div>

      {/* Author Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuthors.map((author) => (
          <div key={author.ID} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col">
            <div className="p-6 flex items-center gap-4 border-b border-gray-50 relative">
               <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleEdit(author)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"><FaEdit /></button>
                 <button onClick={() => handleDelete(author.ID)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><FaTrash /></button>
               </div>
               <div className={`${getAvatarColor(author.Name)} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
                 {author.Name.charAt(0)}
               </div>
               <div>
                 <h3 className="text-xl font-bold text-gray-800">{author.Name}</h3>
                 <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full border">ID: {author.ID}</span>
               </div>
            </div>

            <div className="p-6 bg-gray-50/50 flex-1 relative">
              <FaQuoteRight className="text-gray-200 text-4xl absolute top-4 left-4 -z-0" />
              <div className="relative z-10">
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {author.Bio || <span className="text-gray-400 italic">لا توجد سيرة ذاتية مسجلة.</span>}
                </p>
              </div>
            </div>

            {/* زرار عرض الكتب (شغال الآن) */}
            <div className="px-6 py-3 bg-white border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
               <button 
                 onClick={() => handleViewBooks(author)}
                 className="flex items-center gap-1 hover:text-indigo-600 cursor-pointer transition-colors font-bold"
               >
                 <FaBookOpen /> عرض الأعمال الأدبية
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* 1. Modal: Add/Edit Author */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4 flex items-center gap-2">
              <FaPenNib className="text-indigo-600"/> {form.id ? 'تعديل بيانات المؤلف' : 'تسجيل مؤلف جديد'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input className="w-full border p-4 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="اسم المؤلف" />
              <textarea className="w-full border p-4 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-40 resize-none" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="السيرة الذاتية..." />
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">إلغاء</button>
                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: View Books */}
      {isBooksModalOpen && selectedAuthor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[80vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-3xl">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaBookOpen className="text-indigo-600" /> كتب المؤلف: {selectedAuthor.Name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">قائمة بجميع الأعمال المسجلة في المكتبة</p>
              </div>
              <button onClick={() => setIsBooksModalOpen(false)} className="bg-gray-200 hover:bg-red-100 hover:text-red-600 p-2 rounded-full transition-colors">
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto bg-gray-50/30 flex-1">
              {loadingBooks ? (
                <div className="text-center py-10 text-gray-400">جاري تحميل الكتب...</div>
              ) : authorBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <FaBook className="text-gray-300 text-5xl mb-3" />
                  <p className="text-gray-500 font-bold">لا توجد كتب مسجلة لهذا المؤلف</p>
                  <p className="text-gray-400 text-sm mt-1">قم بإضافة كتب من قسم "المخزن والكتب"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {authorBooks.map(book => (
                    <div key={book.ID} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 hover:border-indigo-200 transition-colors">
                      <div className={`w-16 h-20 rounded-lg flex items-center justify-center text-2xl shadow-inner ${getBookCoverColor(book.ID)}`}>
                        <FaBook />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 line-clamp-1">{book.Title}</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-mono mt-1 mb-2">
                          <FaBarcode /> {book.ISBN || 'N/A'}
                        </div>
                        <div className="flex justify-between items-end">
                          <span className={`text-xs px-2 py-1 rounded font-bold ${book.StockAmount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {book.StockAmount > 0 ? `متاح (${book.StockAmount})` : 'نفذت الكمية'}
                          </span>
                          <span className="font-bold text-indigo-600">${book.Price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-white rounded-b-3xl text-center text-sm text-gray-400">
              إجمالي الأعمال: {authorBooks.length} كتاب
            </div>
          </div>
        </div>
      )}

    </div>
  );
}