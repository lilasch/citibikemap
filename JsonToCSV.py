
import json
import pandas as pd

# Read the JSON file
with open('dataByDayAndHour.json') as f:
    data = json.load(f)

# Convert JSON to DataFrame
df = pd.DataFrame(data)

# Save DataFrame as CSV in the same directory
df.to_csv('dataByDayAndHour.csv', index=False)




