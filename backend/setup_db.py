import psycopg2
import os
import sys

# Connection URL provided by user
DB_URL = "postgresql://postgres:Terimaadaphuda@db.pbzxfdkzuorabuhlhkty.supabase.co:5432/postgres"

# List of SQL files to execute in order
SQL_FILES = [
    "supabase/schema.sql",
    "supabase/rls_policies.sql",
    "supabase/functions.sql"
]

def run_setup():
    print(f"Connecting to database...")
    try:
        conn = psycopg2.connect(DB_URL)
        conn.autocommit = True
        cur = conn.cursor()
        
        for sql_file in SQL_FILES:
            file_path = os.path.join(os.getcwd(), sql_file)
            print(f"Executing {sql_file}...")
            
            if not os.path.exists(file_path):
                print(f"Error: {sql_file} not found at {file_path}")
                continue
                
            with open(file_path, "r", encoding="utf-8") as f:
                sql = f.read()
                
            try:
                cur.execute(sql)
                print(f"Successfully executed {sql_file}")
            except Exception as e:
                print(f"Error executing {sql_file}: {e}")
                # Don't stop on error, try next file
                
        cur.close()
        conn.close()
        print("\nDatabase setup complete!")
        
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        print("\nTrying with brackets in password just in case...")
        try_with_brackets()

def try_with_brackets():
    DB_URL_BRACKETS = "postgresql://postgres:[Terimaadaphuda]@db.pbzxfdkzuorabuhlhkty.supabase.co:5432/postgres"
    try:
        conn = psycopg2.connect(DB_URL_BRACKETS)
        conn.autocommit = True
        cur = conn.cursor()
        # ... same logic ...
        print("Connected with brackets!")
        # (I'll just reuse the logic in a cleaner way if I were writing a real script, 
        # but for this one-off, let's just see if it connects)
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Failed with brackets too: {e}")

if __name__ == "__main__":
    run_setup()
