import getExecutor from '@/lib/db';
import DashboardHelper from '@/components/DashboardHelper';

async function getDashboardData() {
  const executeQuery = await getExecutor();
  
  const counts = await executeQuery(`
    SELECT 
      (SELECT COUNT(*) FROM Books) as booksCount,
      (SELECT COUNT(*) FROM Members) as membersCount,
      (SELECT COUNT(*) FROM Staff) as staffCount,
      (SELECT COUNT(*) FROM Borrows WHERE Status = 'Active') as activeLoans
  `);

  const finances = await executeQuery(`
    SELECT 
      (SELECT SUM(AmountPaid) FROM Sales) as totalRevenue,
      (SELECT SUM(Price * StockAmount) FROM Books) as inventoryValue,
      (SELECT COUNT(*) FROM Sales) as totalSalesCount
  `);

  const monthlyRevenue = await executeQuery(`
    SELECT substr(SaleDate, 1, 7) as Month, SUM(AmountPaid) as Revenue
    FROM Sales
    GROUP BY Month
    ORDER BY Month DESC
    LIMIT 6
  `);

  const categoryStats = await executeQuery(`
    SELECT Books.Category, COUNT(Sales.ID) as SoldCount, SUM(Sales.AmountPaid) as TotalValue
    FROM Sales
    JOIN Books ON Sales.BookID = Books.ID
    GROUP BY Books.Category
    ORDER BY TotalValue DESC
    LIMIT 4
  `);

  const recentActivities = await executeQuery(`
    SELECT 'Sale' as Type, CustomerName as User, BookTitle as Item, SaleDate as Date, AmountPaid as Value 
    FROM (
        SELECT Sales.CustomerName, Books.Title as BookTitle, Sales.SaleDate, Sales.AmountPaid 
        FROM Sales JOIN Books ON Sales.BookID = Books.ID ORDER BY Sales.ID DESC LIMIT 4
    )
    UNION ALL
    SELECT 'Borrow' as Type, MemberName as User, BookTitle as Item, BorrowDate as Date, 0 as Value 
    FROM (
        SELECT Members.Name as MemberName, Books.Title as BookTitle, Borrows.BorrowDate 
        FROM Borrows JOIN Books ON Borrows.BookID = Books.ID JOIN Members ON Borrows.MemberID = Members.ID 
        WHERE Status = 'Active' ORDER BY Borrows.ID DESC LIMIT 4
    )
  `);

  return {
    stats: {
      books: counts[0]?.booksCount || 0,
      members: counts[0]?.membersCount || 0,
      staff: counts[0]?.staffCount || 0,
      activeLoans: counts[0]?.activeLoans || 0,
      
      revenue: finances[0]?.totalRevenue || 0,
      inventoryValue: finances[0]?.inventoryValue || 0,
      totalSalesCount: finances[0]?.totalSalesCount || 0,
      
      avgOrderValue: finances[0]?.totalSalesCount > 0 ? (finances[0]?.totalRevenue / finances[0]?.totalSalesCount) : 0,
    },
    chartData: monthlyRevenue.reverse(),
    categoryData: categoryStats,
    activities: recentActivities
  };
}

export default async function Home() {
  const data = await getDashboardData();
  return <DashboardHelper data={data} />;
}