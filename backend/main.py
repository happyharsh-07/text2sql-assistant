from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# Allow our React frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserInput(BaseModel):
    question: str


# 1. Database Connection Settings
DB_CONFIG = {
    "dbname": "postgres",
    "user": "postgres",
    "password": os.getenv("DB_PASSWORD"), 
    "host": "localhost",
    "port": "5432"
}

# 2. Tell the AI what our database looks like
DATABASE_SCHEMA = """
Table: employees
Columns: id (integer), name (string), department (string), salary (integer)
"""

@app.get("/")
def read_root():
    return {"message": "Hello Bruh, Full-Stack AI Backend is live!"}

@app.post("/ask-database")
def ask_database(user_input: UserInput):
    # Step A: Ask AI to generate SQL based on our specific schema
    ollama_url = "http://localhost:11434/api/generate"
    prompt = f"Given this database schema:\n{DATABASE_SCHEMA}\nWrite a PostgreSQL query to answer this question: '{user_input.question}'. Return ONLY the raw SQL code, no markdown, no explanations."
    
    payload = {
        "model": "qwen2.5:1.5b",
        "prompt": prompt,
        "stream": False
    }
    
    response = requests.post(ollama_url, json=payload)
    raw_ai_response = response.json()["response"].strip()
    
    # Cleaning the markdown formatting out of the string
    sql_query = raw_ai_response.replace("```sql", "").replace("```", "").strip()
    # Step B: Connect to PostgreSQL and execute the AI's query
    try:
        # Open connection
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Run the query
        cursor.execute(sql_query)
        results = cursor.fetchall() # Grab all the matching rows
        
        # Close connection
        cursor.close()
        conn.close()
        
        # Return both what the AI thought, and the actual data!
        return {
            "ai_generated_sql": sql_query,
            "database_results": results
        }
        
    except Exception as e:
        return {"error": str(e), "failed_sql": sql_query}