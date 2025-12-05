// lib/db.js
import path from 'path';

const isWindows = process.platform === "win32";

let executeQuery;

const initDB = async () => {
  if (isWindows) {
    // ----------------------------------------------------
    // Windows Mode (Access)
    // ----------------------------------------------------
    const ADODB = require('node-adodb'); 
    const dbPath = path.resolve('./Library.accdb');
    const connection = ADODB.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${dbPath};Persist Security Info=False;`);

    return async (sql) => {
      try {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          return await connection.query(sql);
        } else {
          return await connection.execute(sql);
        }
      } catch (error) {
        console.error("Access DB Error:", error);
        throw error;
      }
    };

  } else {
    // ----------------------------------------------------
    // Linux Mode (SQLite) - The Fix is Here
    // ----------------------------------------------------
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve('./library_v2.db');
    const db = new sqlite3.Database(dbPath);

    // التعديل: نستخدم Promise عشان نضمن إن الجداول اتعملت قبل ما نرجع
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        // إنشاء الجداول بالترتيب
        db.run(`CREATE TABLE IF NOT EXISTS Authors (ID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Bio TEXT)`);
        
        db.run(`CREATE TABLE IF NOT EXISTS Staff (ID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Role TEXT, Phone TEXT, Salary REAL)`);
        
        db.run(`CREATE TABLE IF NOT EXISTS Books (ID INTEGER PRIMARY KEY AUTOINCREMENT, Title TEXT, AuthorID INTEGER, Category TEXT, ISBN TEXT, Price REAL, StockAmount INTEGER, IsForSale INTEGER DEFAULT 0)`);
        
        db.run(`CREATE TABLE IF NOT EXISTS Members (ID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Phone TEXT, MembershipDate TEXT)`);
        
        db.run(`CREATE TABLE IF NOT EXISTS Borrows (ID INTEGER PRIMARY KEY AUTOINCREMENT, BookID INTEGER, MemberID INTEGER, BorrowDate TEXT, ReturnDate TEXT, Status TEXT, RegisteredBy TEXT)`);
        
        // آخر جدول، لما يخلص بنعمل resolve عشان الكود يكمل
        db.run(`CREATE TABLE IF NOT EXISTS Sales (ID INTEGER PRIMARY KEY AUTOINCREMENT, BookID INTEGER, CustomerName TEXT, SaleDate TEXT, AmountPaid REAL, SoldBy TEXT)`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    // دالة التنفيذ (Executor)
    return (sql) => {
      return new Promise((resolve, reject) => {
        if (!sql) { reject(new Error("Empty SQL")); return; }
        
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        } else {
          db.run(sql, function (err) {
            if (err) reject(err);
            else resolve({ message: "Success", changes: this.changes });
          });
        }
      });
    };
  }
};

let cachedExecutor = null;

const getExecutor = async () => {
  if (!cachedExecutor) {
    cachedExecutor = await initDB();
  }
  return cachedExecutor;
};

export default getExecutor;