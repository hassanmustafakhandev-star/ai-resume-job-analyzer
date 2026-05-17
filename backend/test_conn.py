import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# Add the current directory to sys.path to find local modules if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables from .env file
load_dotenv()

def test_connection():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    
    if not url or not key:
        print("ERROR: SUPABASE_URL or SUPABASE_ANON_KEY not found in .env file.")
        return

    print(f"Attempting to connect to: {url}")
    
    try:
        supabase = create_client(url, key)
        # Try to fetch from profiles table to verify schema and connection
        response = supabase.table("profiles").select("*").limit(1).execute()
        print("SUCCESS: Connected to Supabase!")
        print("SUCCESS: Database schema is accessible.")
    except Exception as e:
        print("ERROR: Failed to connect to Supabase.")
        print(f"Error Details: {str(e)}")

if __name__ == "__main__":
    test_connection()
