CART 351 — Exercise 5  
### Patterns + MongoDB  
**By Tianshun Wu & Junming He**

---
## Project Overview
This project connects a Flask server to a MongoDB Atlas database.  
All queries follow the exact field names and structure from the instructor’s insert script so the project works with any dataset using the same schema.

We have **six queries**, but the assignment requires us to focus on the last four visual queries (THREE → SIX). Each visualization has a specific intention and uses dynamic layouts so that the patterns “emerge” from the dataset instead of being hard-coded.

---

# How Each Query Works
Below are the details of how queries THREE, FOUR, FIVE, and SIX work, including how we retrieve the data and how we turn it into visuals.

---

# ### Query THREE  
### **After-Mood = Positive**  
We filter the database for entries where **after_mood** is in a positive list:

```
["happy", "neutral", "calm", "serene", "well"]
```

All matching entries are grouped into these five mood categories.

The visualization uses small animated clusters of points.  
Each mood group has its own cluster, and the number of dots reflects how many entries fall into that category.  
Dots have slight motion, making each mood feel like a “living cloud.”

---

# ### Query FOUR  
### **Entries Sorted by Event Name (Timeline Stripes)**  
Entries are grouped by **event_name**.

Each group is drawn as a horizontal dotted stripe:  
- One dot = one entry  
- Longer stripes = more data for that event  

Event names are labeled to the left, and stripes flow horizontally.  
The intention is to show event frequency through visual rhythm and texture.

---

# ### Query FIVE  
### **Monday & Tuesday — Event Affect Strength (Dynamic Bars)**  
We filter for entries where **day == "Monday" or "Tuesday"**.

Each entry’s **event_affect_strength** turns into a dynamic bar:  
- Bar height = affect strength  
- Bars animate upward on load  
- Bars use alternating colors for visual variation  

This highlights how emotionally strong different Monday/Tuesday events are.

---

# ### Query SIX  
### ** Weather **  
Filters entries where both moods are negative:

```
start_mood in ["sad", "angry", "anxious", "moody"]
AND
after_mood in ["sad", "angry", "anxious", "moody"]
```

Grouped by **weather**:

```
stormy, raining, sunny, cloudy, clear, snowing, grey, fog
```

Visualization resembles vertical bamboo tubes:  
- Each tube is a column of dots  
- Dots drift with a subtle “rolling” animation  
- Tube height ≈ number of entries in that weather  

This design expresses emotional heaviness under different weather types.

---

# How to Run
```
pip install flask pymongo python-dotenv
python server.py
```

Then open:

```
http://127.0.0.1:5000/
```
---

# Completed
This project meets the assignment requirements and works with any valid dataset/instructor `.env`.
