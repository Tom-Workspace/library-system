'use client';
import { FaBook, FaUsers, FaUserTie, FaShoppingCart, FaMoneyBillWave, FaChartLine, FaBoxOpen, FaHandHoldingHeart, FaArrowUp, FaWallet, FaExchangeAlt, FaHistory, FaChartPie } from 'react-icons/fa';
import Link from 'next/link';

export default function DashboardHelper({ data }) {
  const { stats, activities, chartData, categoryData } = data;

  const quickActions = [
    { name: 'بيع كتاب', icon: <FaShoppingCart />, path: '/sales', color: 'bg-emerald-500' },
    { name: 'تسجيل استعارة', icon: <FaHandHoldingHeart />, path: '/borrow', color: 'bg-blue-500' },
    { name: 'إضافة للمخزن', icon: <FaBoxOpen />, path: '/books', color: 'bg-amber-500' },
    { name: 'موظف جديد', icon: <FaUserTie />, path: '/staff', color: 'bg-purple-500' },
  ];

  const revenueValues = chartData.map(d => Number(d.Revenue) || 0);
  const maxRevenue = Math.max(...revenueValues, 100);
  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      
      {/* 1. Hero Financial Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-slate-400 mb-1 font-medium">إجمالي الإيرادات (الكلي)</p>
              <h1 className="text-5xl font-bold mb-2 tracking-tight">${stats.revenue.toLocaleString()}</h1>
              <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
                <FaArrowUp /> 
                <span>مؤشر النمو المالي إيجابي</span>
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <FaWallet className="text-3xl text-emerald-400" />
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-8 mt-8 border-t border-white/10 pt-6">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">متوسط قيمة الفاتورة (AOV)</p>
              <p className="text-2xl font-bold">${Number(stats.avgOrderValue).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">عدد عمليات البيع</p>
              <p className="text-2xl font-bold">{stats.totalSalesCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <FaBoxOpen className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12" />
          <div>
            <p className="text-amber-100 font-medium mb-1">قيمة أصول المخزن (Assets)</p>
            <h2 className="text-4xl font-bold">${Number(stats.inventoryValue).toLocaleString()}</h2>
          </div>
          <div className="relative z-10 mt-6">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/20">
              <div className="flex justify-between text-sm mb-1">
                 <span>عدد الكتب</span>
                 <span className="font-bold">{stats.books}</span>
              </div>
              <div className="flex justify-between text-sm">
                 <span>نسبة التوفر</span>
                 <span className="font-bold">مستقرة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fixed Monthly Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <FaChartLine className="text-blue-500"/> الأداء الشهري (آخر 6 شهور)
              </h3>
            </div>
          </div>
          
          <div className="flex items-end justify-between h-64 gap-3 px-2">
            {chartData.length > 0 ? chartData.map((data, i) => {
              const val = Number(data.Revenue) || 0;
              let heightPercent = (val / maxRevenue) * 100;
              if (val > 0 && heightPercent < 5) heightPercent = 5; 

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                  <div className="relative w-full h-full flex items-end bg-gray-50 rounded-t-lg">
                     {/* Tooltip */}
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-lg pointer-events-none">
                       ${val.toLocaleString()}
                     </div>
                     
                     {/* The Bar */}
                     <div 
                       style={{ height: `${heightPercent}%` }} 
                       className="w-full bg-blue-500 rounded-t-lg transition-all duration-700 ease-out group-hover:bg-blue-600 relative group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                     ></div>
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-500 font-bold font-mono whitespace-nowrap">{data.Month}</span>
                </div>
              );
            }) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">لا توجد بيانات كافية للرسم البياني</div>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <FaChartPie className="text-purple-500"/> التصنيفات الأفضل
          </h3>
          <div className="space-y-5">
            {categoryData.map((cat, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-gray-700">{cat.Category || 'غير مصنف'}</span>
                  <span className="text-gray-600 font-bold">${Number(cat.TotalValue).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                   <div 
                     style={{ width: `${(Number(cat.TotalValue) / Number(stats.revenue)) * 100}%` }}
                     className={`h-full rounded-full transition-all duration-1000 ${i===0 ? 'bg-purple-500' : i===1 ? 'bg-blue-500' : 'bg-gray-400'}`}
                   ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">{cat.SoldCount} عملية بيع</p>
              </div>
            ))}
            {categoryData.length === 0 && <p className="text-center text-gray-400 py-10">لا توجد مبيعات للتصنيف</p>}
          </div>
        </div>

      </div>

      {/* 3. Quick Actions & Live Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><FaBook size={20} /></div>
            <span className="text-gray-500 font-bold">الكتب</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.books}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><FaUsers size={20} /></div>
            <span className="text-gray-500 font-bold">العملاء</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.members}</h3>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-400 text-sm font-bold mb-3 flex items-center gap-2"><FaExchangeAlt /> وصول سريع</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, idx) => (
              <Link key={idx} href={action.path} className={`${action.color} text-white p-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md hover:-translate-y-1`}>
                <span className="text-lg">{action.icon}</span>
                <span className="text-xs font-bold">{action.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Live Activity Feed */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><FaHistory className="text-gray-400"/> السجل الحي للعمليات</h3>
        <div className="space-y-6">
          {activities.length > 0 ? activities.map((act, i) => (
            <div key={i} className="flex gap-4 relative">
              {i !== activities.length - 1 && <div className="absolute top-10 right-[19px] w-0.5 h-full bg-gray-100"></div>}
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm border-2 border-white ${act.Type === 'Sale' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                {act.Type === 'Sale' ? <FaShoppingCart size={14} /> : <FaHandHoldingHeart size={14} />}
              </div>
              
              <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                   <p className="text-sm font-bold text-gray-800">
                     {act.Type === 'Sale' ? 'فاتورة مبيعات' : 'استعارة كتاب'}
                   </p>
                   <span className="text-[10px] text-gray-400 bg-white px-2 py-1 rounded border">{act.Date}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  قام <b>{act.User}</b> بـ {act.Type === 'Sale' ? 'شراء' : 'استعارة'} كتاب: <span className="text-blue-600 font-bold">{act.Item}</span>
                </p>
                {Number(act.Value) > 0 && <div className="mt-2 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded">+${Number(act.Value)} إيرادات</div>}
              </div>
            </div>
          )) : (
            <div className="text-center text-gray-400 py-10">لا توجد أنشطة حديثة</div>
          )}
        </div>
      </div>

    </div>
  );
}