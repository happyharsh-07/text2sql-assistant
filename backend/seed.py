import psycopg2
import random
import os
from dotenv import load_dotenv

# Load your secure password from the .env file
load_dotenv()

DB_CONFIG = {
    "dbname": "postgres",
    "user": "postgres",
    "password": os.getenv("DB_PASSWORD"), 
    "host": "localhost",
    "port": "5432"
}

# Lists of dummy data to randomly combine
first_names = ["Harsh", "Tanuja", "Prabhat", "Sneha", "Yash", "Anjali", "Abantika", "Virat", "Shashank", "Pooja", "Harshu", "Anchal", "Aditya", "Riya", "Kabir", "Payal"]
last_names = ["Mishra", "Singh", "Yadav", "Gupta", "Kumar", "Patel", "Reddy", "Jain", "Das", "Bose", "Nair", "Iyer"]
departments = ["Engineering", "Backend", "Frontend", "Marketing", "HR", "Sales", "Finance", "Data Science", "Product"]

print("Starting to generate 500 employees...")

try:
    # Open connection to database
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # Generate and insert 500 random records
    count = 0
    for _ in range(500):
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        dept = random.choice(departments)
        salary = random.randint(40000, 180000) # Random salary between 40k and 180k
        
        # Execute the SQL insert
        cursor.execute(
            "INSERT INTO employees (name, department, salary) VALUES (%s, %s, %s)",
            (name, dept, salary)
        )
        count += 1
        
    # Commit (save) the changes to the database
    conn.commit()
    
    # Close connection
    cursor.close()
    conn.close()
    print(f"✅ Successfully added {count} random employees to the database!")
    
except Exception as e:
    print(f"❌ Error connecting to database: {e}")