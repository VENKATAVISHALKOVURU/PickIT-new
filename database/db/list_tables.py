import sqlite3
import os

db_path = r'c:\Users\LEELA\Downloads\Attached-Assets\Attached-Assets\database\db\local.db'

if not os.path.exists(db_path):
    print(f"Error: Database file not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall() if row[0] != 'sqlite_sequence']
    
    for table in tables:
        print(f"\nStructure of table: {table}")
        cursor.execute(f"PRAGMA table_info({table})")
        columns = cursor.fetchall()
        print(f"{'ID':<3} | {'Name':<15} | {'Type':<10} | {'NotNull':<7} | {'PK':<3}")
        print("-" * 50)
        for col in columns:
            print(f"{col[0]:<3} | {col[1]:<15} | {col[2]:<10} | {col[3]:<7} | {col[5]:<3}")
        
    conn.close()
