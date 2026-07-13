from services.csv_parser import parse_and_validate_csv
import glob
import os

# Find the most recent csv in uploads
csv_files = glob.glob('uploads/*.csv')
if not csv_files:
    print("No CSVs found")
else:
    latest_file = max(csv_files, key=os.path.getctime)
    print("Testing with file:", latest_file)
    is_valid, msg, records = parse_and_validate_csv(latest_file)
    print("Valid:", is_valid)
    print("Message:", msg)
    if records:
        print("Records sample:", records[0])
