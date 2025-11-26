# CART 351 - Exercise 1
# Authors: Wu Tianshun & He Junming
# -----------------------------------------

import requests

# (1) API key 
token = ""

# --------------------------
# PART 1: Search request
# --------------------------

url = "https://api.waqi.info/search/"
response = requests.get(url, params={"token": token, "keyword": "montreal"})
results = response.json()

# Q1: Type of results
print("Type of results:", type(results))  
# Output: <class 'dict'>

# Q2: Keys of results
print("Keys of results:", results.keys())  
# Output: dict_keys(['status', 'data'])

# Q3: Access 'data' field
responseData = results["data"]
print("Type of responseData:", type(responseData))  
# Output: <class 'list'>

# Q4: Type and keys of one item
print("Type of item:", type(responseData[0]))  
# Output: <class 'dict'>
print("Keys of item:", responseData[0].keys())  
# Output: dict_keys(['uid', 'aqi', 'time', 'station'])

# Q5: Print station names
print("---- Station Names ----")
for item in responseData:
    print("Station:", item["station"]["name"])
# Output: 
# Station: Montreal
# Station: Ontario, Montreal, Canada
# Station: Échangeur Décarie, Montreal, Canada
# Station: Caserne 17, Montreal, Canada
# Station: Saint-Michel, Montreal, Canada
# Station: Hochelaga-Maisonneuve, Montreal, Canada
# Station: Molson, Montreal, Canada
# Station: Jardin Botanique, Montreal, Canada
# Station: Parc Pilon, Montreal, Canada
# Station: Maisonneuve, Montreal, Canada
# Station: Drummond, Montreal, Canada
# Station: St-Dominique, Montreal, Canada
# Station: Roberval, York, Montreal, Canada
# Station: Verdun, Montreal, Canada
# Station: Duncan, Montreal, Canada
# Station: Anjou, Montreal, Canada
# Station: Dorval, Montreal, Canada
# Station: Chénier, Montreal, Canada
# Station: Saint-Jean-Baptiste, Montreal, Canada
# Station: Aéroport de Montréal, Montreal, Canada
# Station: Sainte-Anne-de-Bellevue, Montreal, Canada

# Q6: Print station geolocations
print("---- Station Geolocations ----")
for item in responseData:
    lat, lon = item["station"]["geo"]
    print(f"lat: {lat}, long: {lon}")
# Output:
# lat: 45.5086699, long: -73.5539925
# lat: 45.52055, long: -73.563222
# lat: 45.502648, long: -73.663913
# lat: 45.593325, long: -73.637328
# lat: 45.563697, long: -73.610447
# lat: 45.539928, long: -73.540388
# lat: 45.542767, long: -73.572039
# lat: 45.56221, long: -73.571785
# lat: 45.594576, long: -73.641535
# lat: 45.501531, long: -73.574311
# lat: 45.497859, long: -73.573035
# lat: 45.512189, long: -73.566842
# lat: 45.464611, long: -73.582583
# lat: 45.472854, long: -73.57296
# lat: 45.4660102, long: -73.6336838
# lat: 45.602846, long: -73.558874
# lat: 45.439119, long: -73.7333
# lat: 45.60176, long: -73.541992
# lat: 45.641026, long: -73.499682
# lat: 45.468297, long: -73.741185
# lat: 45.426509, long: -73.928944

# Q7: Print AQI and UID
print("---- AQI and UID ----")
for item in responseData:
    print(f"Station: {item['station']['name']}")
    print(f"  AQI: {item['aqi']}")
    print(f"  UID: {item['uid']}")
    print("-----------------------")
# Output:
# Station: Montreal
#   AQI: 24
#   UID: 5922
# -----------------------
# Station: Ontario, Montreal, Canada
#   AQI: 27
#   UID: 8628
# -----------------------
# Station: Échangeur Décarie, Montreal, Canada
#   AQI: 27
#   UID: 8595
# -----------------------
# Station: Caserne 17, Montreal, Canada
#   AQI: 27
#   UID: 5461
# -----------------------
# Station: Saint-Michel, Montreal, Canada
#   AQI: 27
#   UID: 8696
# -----------------------
# Station: Hochelaga-Maisonneuve, Montreal, Canada
#   AQI: 24
#   UID: 5463
# -----------------------
# Station: Molson, Montreal, Canada
#   AQI: 24
#   UID: 5467
# -----------------------
# Station: Jardin Botanique, Montreal, Canada
#   AQI: 24
#   UID: 8695
# -----------------------
# Station: Parc Pilon, Montreal, Canada
#   AQI: 22
#   UID: 8596
# -----------------------
# Station: Maisonneuve, Montreal, Canada
#   AQI: 22
#   UID: 5465
# -----------------------
# Station: Drummond, Montreal, Canada
#   AQI: 21
#   UID: 8626
# -----------------------
# Station: St-Dominique, Montreal, Canada
#   AQI: 20
#   UID: 10138
# -----------------------
# Station: Roberval, York, Montreal, Canada
#   AQI: 13
#   UID: 10716
# -----------------------
# Station: Verdun, Montreal, Canada
#   AQI: 12
#   UID: 8594
# -----------------------
# Station: Duncan, Montreal, Canada
#   AQI: -
#   UID: 5462
# -----------------------
# Station: Anjou, Montreal, Canada
#   AQI: 21
#   UID: 8625
# -----------------------
# Station: Dorval, Montreal, Canada
#   AQI: -
#   UID: 8627
# -----------------------
# Station: Chénier, Montreal, Canada
#   AQI: 24
#   UID: 5460
#   UID: 8627
# -----------------------
# Station: Chénier, Montreal, Canada
#   AQI: 24
#   UID: 5460
# -----------------------
# Station: Saint-Jean-Baptiste, Montreal, Canada
# -----------------------
# Station: Chénier, Montreal, Canada
#   AQI: 24
#   UID: 5460
# -----------------------
# Station: Saint-Jean-Baptiste, Montreal, Canada
#   AQI: 24
#   UID: 5460
# -----------------------
# Station: Saint-Jean-Baptiste, Montreal, Canada
#   UID: 5460
# -----------------------
# Station: Saint-Jean-Baptiste, Montreal, Canada
#   AQI: 23
#   UID: 5459
# -----------------------
# Station: Saint-Jean-Baptiste, Montreal, Canada
#   AQI: 23
#   UID: 5459
# -----------------------
#   AQI: 23
#   UID: 5459
# -----------------------
# Station: Aéroport de Montréal, Montreal, Canada
#   UID: 5459
# -----------------------
# Station: Aéroport de Montréal, Montreal, Canada
#   AQI: 24
# -----------------------
# Station: Aéroport de Montréal, Montreal, Canada
#   AQI: 24
#   UID: 5466
# Station: Aéroport de Montréal, Montreal, Canada
#   AQI: 24
#   UID: 5466
# -----------------------
# Station: Sainte-Anne-de-Bellevue, Montreal, Canada
#   AQI: 24
#   UID: 5466
# -----------------------
# Station: Sainte-Anne-de-Bellevue, Montreal, Canada
#   AQI: 21
#   UID: 5468
# -----------------------
#   UID: 5466
# -----------------------
# Station: Sainte-Anne-de-Bellevue, Montreal, Canada
#   AQI: 21
#   UID: 5468
# -----------------------
# -----------------------
# Station: Sainte-Anne-de-Bellevue, Montreal, Canada
#   AQI: 21
#   UID: 5468
# -----------------------

# PART 2: Feed request
# --------------------------

# (8) Use UID 5468 (Sainte-Anne-de-Bellevue station)
url_feed = "https://api.waqi.info/feed/@5468"
response_feed = requests.get(url_feed, params={"token": token})
results_feed = response_feed.json()

response_data_feed = results_feed["data"]
print("Type of response_data_feed:", type(response_data_feed))  
# Output: <class 'dict'>

for key, value in response_data_feed.items():
    print(f"{key}: {value}")
# aqi: 21
# idx: 5468
# attributions: [{'url': 'http://ville.montreal.qc.ca/portal/page?_pageid=7237,74495616&_dad=portal&_schema=PORTAL', 'name': "Ville de Montreal - Réseau de surveillance de la qualité de l'air", 'logo': 'Canada-Montreal.png'}, {'url': 'https://waqi.info/', 'name': 'World Air 
# Quality Index Project'}]
# city: {'geo': [45.426509, -73.928944], 'name': 'Sainte-Anne-de-Bellevue, Montreal, Canada', 'url': 'https://aqicn.org/city/canada/montreal/sainte-anne-de-bellevue', 'location': ''}
# dominentpol: pm25
# iaqi: {'co': {'v': 6.4}, 'h': {'v': 78.8}, 'no2': {'v': 3.7}, 'o3': {'v': 18}, 'p': {'v': 1012.9}, 'pm25': {'v': 21}, 'so2': {'v': 5.1}, 't': {'v': 19.2}, 'w': {'v': 1.6}, 'wg': {'v': 2.6}}
# time: {'s': '2025-09-22 15:00:00', 'tz': '-04:00', 'v': 1758553200, 'iso': '2025-09-22T15:00:00-04:00'}
# forecast: {'daily': {'pm10': [{'avg': 6, 'day': '2025-09-20', 'max': 6, 'min': 5}, {'avg': 11, 'day': '2025-09-21', 'max': 17, 'min': 6}, {'avg': 11, 'day': '2025-09-22', 'max': 13, 'min': 9}, {'avg': 12, 'day': '2025-09-23', 'max': 15, 'min': 9}, {'avg': 9, 'day': '2025-09-24', 'max': 17, 'min': 7}, {'avg': 6, 'day': '2025-09-25', 'max': 9, 'min': 4}, {'avg': 6, 'day': '2025-09-26', 'max': 9, 'min': 3}, {'avg': 11, 'day': '2025-09-27', 'max': 12, 'min': 8}], 'pm25': [{'avg': 13, 'day': '2025-09-20', 'max': 13, 'min': 12}, {'avg': 36, 'day': '2025-09-21', 'max': 53, 'min': 13}, {'avg': 34, 'day': '2025-09-22', 'max': 45, 'min': 28}, {'avg': 46, 'day': '2025-09-23', 'max': 53, 'min': 38}, {'avg': 30, 'day': '2025-09-24', 'max': 54, 'min': 22}, {'avg': 22, 'day': '2025-09-25', 'max': 28, 'min': 12}, {'avg': 21, 'day': '2025-09-26', 'max': 34, 'min': 9}, {'avg': 42, 'day': '2025-09-27', 'max': 47, 'min': 29}], 'uvi': [{'avg': 0, 'day': '2025-09-21', 'max': 0, 'min': 0}, {'avg': 0, 'day': '2025-09-22', 'max': 4, 'min': 0}, {'avg': 0, 'day': '2025-09-23', 'max': 2, 'min': 0}, {'avg': 1, 'day': '2025-09-24', 'max': 5, 'min': 0}, {'avg': 0, 'day': '2025-09-25', 'max': 2, 'min': 0}, {'avg': 0, 'day': '2025-09-26', 'max': 3, 'min': 0}]}}
# debug: {'sync': '2025-09-23T05:44:21+09:00'}

# Extract AQI and dominentpol
aqi = response_data_feed["aqi"]
dominentpol = response_data_feed["dominentpol"]
print("-----------------")
print("AQI:", aqi)  
# Output: AQI: 21
print("Dominant Pollutant:", dominentpol)  
# Output: Dominant Pollutant: pm25

# Note: dominentpol = the pollutant most affecting AQI

# Access iaqi dictionary
iaqi = response_data_feed["iaqi"]
print("---- IAQI ----")
print(iaqi.keys())
# Output: dict_keys(['co', 'h', 'no2', 'o3', 'p', 'pm25', 'so2', 't', 'w', 'wg'])

# Access dominant pollutant value dynamically
if dominentpol in iaqi:
    dom_value = iaqi[dominentpol]["v"]
    print(f"Dominant pollutant {dominentpol} value: {dom_value}")
# Output: Dominant pollutant pm25 value: 21

# """
# Final theoretical answer:
# To access the dominant pollutant value from different cities:
# 1. Use the /search endpoint with the city name to get a list of stations.
# 2. Collect the 'uid' of each station.
# 3. For each uid, query the /feed/@uid endpoint with the token.
# 4. From the feed results, extract 'dominentpol' (dominant pollutant).
# 5. Use that key to get the actual value from the 'iaqi' dictionary.
# """
