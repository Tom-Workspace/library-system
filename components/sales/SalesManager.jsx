'use client';
import { useState } from 'react';
import { FaShoppingCart, FaMoneyBillWave, FaSearch, FaBarcode, FaPlus, FaMinus, FaPrint, FaBoxOpen, FaReceipt, FaHistory, FaUserTie, FaTable } from 'react-icons/fa';

export default function SalesManager({ books, salesHistory, staff }) {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'history'
  
  // POS States
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState('');
  const [selectedCashier, setSelectedCashier] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // History States
  const [historySearch, setHistorySearch] = useState('');

  // Calculations
  const subTotal = cart.reduce((sum, item) => sum + (item.Price * item.qty), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  // Filtered Books
  const filteredBooks = books.filter(b => 
    b.StockAmount > 0 && 
    (b.Title.toLowerCase().includes(searchTerm.toLowerCase()) || b.ISBN?.includes(searchTerm))
  );

  // Filtered History
  const filteredHistory = salesHistory.filter(sale => 
    sale.BookTitle.toLowerCase().includes(historySearch.toLowerCase()) ||
    sale.CustomerName?.toLowerCase().includes(historySearch.toLowerCase()) ||
    sale.SoldBy?.toLowerCase().includes(historySearch.toLowerCase())
  );

  const getCoverColor = (id) => {
    const colors = ['bg-amber-600', 'bg-blue-600', 'bg-emerald-600', 'bg-rose-600', 'bg-indigo-600', 'bg-slate-700'];
    return colors[id % colors.length];
  };

  const addToCart = (book) => {
    const existing = cart.find(item => item.ID === book.ID);
    if (existing) {
      if (existing.qty >= book.StockAmount) {
        alert('لا توجد نسخ إضافية في المخزن!');
        return;
      }
      setCart(cart.map(item => item.ID === book.ID ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...book, qty: 1 }]);
    }
  };

  const decreaseQty = (bookId) => {
    const existing = cart.find(item => item.ID === bookId);
    if (existing.qty === 1) removeFromCart(bookId);
    else setCart(cart.map(item => item.ID === bookId ? { ...item, qty: item.qty - 1 } : item));
  };

  const removeFromCart = (bookId) => {
    setCart(cart.filter(item => item.ID !== bookId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!selectedCashier) {
      alert('يجب تحديد الموظف (الكاشير) المسؤول عن العملية!');
      return;
    }
    setLoading(true);

    try {
      for (const item of cart) {
        for(let i=0; i<item.qty; i++) {
            await fetch('/api/sales', {
                method: 'POST',
                body: JSON.stringify({
                bookId: item.ID,
                customerName: customer || 'عميل نقدي',
                price: item.Price,
                soldBy: selectedCashier
                })
            });
        }
      }
      setLastOrder({ total: subTotal, items: totalItems, id: Date.now() });
      setCart([]);
      setCustomer('');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      alert('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      
      {/* 1. Top Navigation Bar */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-4 flex gap-2 w-fit mx-auto">
        <button 
          onClick={() => setActiveTab('pos')}
          className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'pos' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <FaShoppingCart /> نقطة البيع (POS)
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'history' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <FaHistory /> سجل المبيعات
        </button>
      </div>

      {/* VIEW 1: POS SYSTEM */}
      {activeTab === 'pos' && (
        <div className="flex flex-col xl:flex-row flex-1 gap-6 overflow-hidden">
          {/* Market Grid */}
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white z-10 flex justify-between items-center gap-4">
               <div className="flex-1 relative">
                 <FaSearch className="absolute right-4 top-4 text-gray-400" />
                 <input 
                   className="w-full pr-12 pl-4 py-3 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                   placeholder="بحث بالاسم أو الباركود..."
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
               </div>
               
               {/* Cashier Selector */}
               <div className="relative w-64">
                 <FaUserTie className="absolute right-4 top-4 text-gray-500 z-10" />
                 <select 
                   className={`w-full pr-10 pl-4 py-3 rounded-2xl border-none ring-1 outline-none appearance-none cursor-pointer font-bold ${selectedCashier ? 'bg-blue-50 ring-blue-200 text-blue-800' : 'bg-red-50 ring-red-200 text-red-800'}`}
                   value={selectedCashier}
                   onChange={e => setSelectedCashier(e.target.value)}
                 >
                   <option value="">اختر الكاشير...</option>
                   {staff.map(s => <option key={s.ID} value={s.Name}>{s.Name}</option>)}
                 </select>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredBooks.map(book => (
                  <button 
                    key={book.ID}
                    onClick={() => addToCart(book)}
                    className="group bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all text-right flex flex-col h-full relative overflow-hidden"
                  >
                    <div className={`h-28 w-full ${getCoverColor(book.ID)} rounded-xl mb-4 shadow-inner flex items-center justify-center text-white/20`}>
                      <FaBarcode size={40} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between w-full">
                      <h3 className="font-bold text-gray-800 line-clamp-2 text-sm mb-1">{book.Title}</h3>
                      <div className="flex justify-between items-end border-t pt-2 border-gray-50 mt-2">
                        <span className="bg-gray-100 text-[10px] font-bold px-2 py-1 rounded">Stock: {book.StockAmount}</span>
                        <span className="font-bold text-blue-600 text-lg">${book.Price}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Receipt */}
          <div className="w-full xl:w-[400px] flex flex-col">
            <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden relative">
              <div className="bg-slate-800 text-white p-6 rounded-b-3xl z-10 shadow-lg">
                 <h3 className="text-lg font-bold flex items-center gap-2"><FaReceipt /> الفاتورة</h3>
                 <p className="text-slate-400 text-xs mt-1">الموظف: {selectedCashier || 'غير محدد'}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map((item) => (
                  <div key={item.ID} className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.Title}</h4>
                      <span className="text-xs text-gray-500">${item.Price}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm">
                      <button onClick={() => decreaseQty(item.ID)} className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-red-100 rounded"><FaMinus size={8} /></button>
                      <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                      <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-blue-100 rounded"><FaPlus size={8} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between text-gray-800 text-xl font-bold mb-4">
                  <span>الإجمالي</span>
                  <span className="text-blue-600">${subTotal.toFixed(2)}</span>
                </div>
                <input 
                  placeholder="اسم العميل..." 
                  className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm mb-3 outline-none"
                  value={customer}
                  onChange={e => setCustomer(e.target.value)}
                />
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || loading || !selectedCashier}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'جاري...' : <><FaMoneyBillWave /> دفع</>}
                </button>
              </div>

              {lastOrder && (
                <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                   <div className="bg-green-100 p-4 rounded-full text-green-600 mb-4"><FaPrint size={32} /></div>
                   <h3 className="text-2xl font-bold text-gray-800">عملية ناجحة</h3>
                   <p className="text-gray-500 text-sm mt-2">الموظف: {selectedCashier}</p>
                   <p className="text-gray-800 font-bold text-xl mt-1">${lastOrder.total}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SALES HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col animate-fadeIn">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
             <h2 className="text-xl font-bold flex items-center gap-2"><FaTable className="text-slate-600"/> سجل العمليات اليومية</h2>
             <div className="relative w-64">
               <input 
                 className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-sm"
                 placeholder="بحث في السجل..."
                 value={historySearch}
                 onChange={e => setHistorySearch(e.target.value)}
               />
               <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-right">
              <thead className="bg-white text-gray-600 sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="p-4 border-b">رقم الفاتورة</th>
                  <th className="p-4 border-b">الكتاب المباع</th>
                  <th className="p-4 border-b">العميل</th>
                  <th className="p-4 border-b">الموظف (Sold By)</th>
                  <th className="p-4 border-b">التاريخ</th>
                  <th className="p-4 border-b">القيمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredHistory.map(sale => (
                  <tr key={sale.ID} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 font-mono text-gray-500">#{String(sale.ID).padStart(6, '0')}</td>
                    <td className="p-4 font-bold text-gray-800">{sale.BookTitle}</td>
                    <td className="p-4">{sale.CustomerName || 'نقدى'}</td>
                    <td className="p-4">
                      {sale.SoldBy ? (
                        <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded w-fit">
                          <FaUserTie size={10} /> {sale.SoldBy}
                        </span>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="p-4 text-gray-500">{sale.SaleDate}</td>
                    <td className="p-4 font-bold text-green-600">${sale.AmountPaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredHistory.length === 0 && <div className="p-10 text-center text-gray-400">لا توجد سجلات</div>}
          </div>
        </div>
      )}
    </div>
  );
}