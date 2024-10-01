import json
import time
from datetime import datetime
import requests  # use requests instead of js

# Constants
API_URL = "https://biggamesapi.io/api/clan"
BATTLE_TYPE = "CatchingBattle"
UPDATE_INTERVAL_SECONDS = 110
WAIT_FOR_ZERO_SECONDS = True
ZERO_POINTS_THRESHOLD = 2
ZERO_POINTS_URL = "https://www.youtube.com/watch?v=i77QVCt0D4U"

# Data structure
data = {
    "labels": {
        "start": "Start",
        "time": "Time",
        "huges": "Huges"
    },
    "users": [
        dict(name="Ash", id=1524977286, clan="fr3e", last_points=0, current_points=0, total_points_earned=0, consecutive_zeros=0),
        dict(name="Rocks", id=1328450348, clan="RFIL", last_points=0, current_points=0, total_points_earned=0, consecutive_zeros=0),
    ]
}

# Global variables
huge_suffix_count = 0
interval_count = 0

def alignment_spaces(name: str, total_space: int = 8) -> str:
    return ' ' * (total_space - len(name))

def alignment_spaces_for_points(current_points_str: str, max_points_length: int) -> str:
    return ' ' * (max_points_length - len(current_points_str))

def fetch_user_points(user):
    response = requests.get(f"{API_URL}/{user['clan']}")
    return response.json()

def update_user_points(user, user_points):
    user["total_points_earned"] += user_points - user["last_points"]
    user["last_points"] = user["current_points"]
    user["current_points"] = user_points

def print_user_data(user, current_points_str, points_difference, max_points_length):
    spaces_name = alignment_spaces(user.get('name', 'Unknown'))
    spaces_points = alignment_spaces_for_points(current_points_str, max_points_length)
    
    output = f"{user['name']}{spaces_name}: {current_points_str}{spaces_points}"
    if points_difference:
        output += f" ({points_difference})"
    print(output)

def fetch_and_display_user_data():
    global huge_suffix_count
    alert = ""

    max_points_length = max(len(f"{user['current_points']:,}") for user in data['users'])

    for user in data['users']:
        data_from_api = fetch_user_points(user)

        time.sleep(0.05)

        if "data" in data_from_api and BATTLE_TYPE in data_from_api["data"]["Battles"]:
            battle_data = data_from_api["data"]["Battles"][BATTLE_TYPE]
            user_points = next((item["Points"] for item in battle_data["PointContributions"] if item["UserID"] == user["id"]), None)

            if user_points is None:
                print(f"User {user['name']} not found in battle {BATTLE_TYPE} for clan {user['clan']}")
                continue

            if user["last_points"] == 0:
                user["last_points"] = user_points
                user["current_points"] = user_points
                
                current_points_str = f"{user_points:,}"
                print_user_data(user, current_points_str, "", max_points_length)
                continue
            
            update_user_points(user, user_points)

            if user["current_points"] - user["last_points"] == 0:
                user["consecutive_zeros"] += 1
            else:
                user["consecutive_zeros"] = 0

            if user["consecutive_zeros"] >= ZERO_POINTS_THRESHOLD:
                alert = f"\n{user['name']} has {ZERO_POINTS_THRESHOLD} consecutive 0-point increases!\nOpening URL...\n"
                # Since this is now a standard Python script, you can't open a URL directly like in js
                print(f"Opening URL: {ZERO_POINTS_URL}")  # This is just a print statement now
                user["consecutive_zeros"] = 0
                time.sleep(60)

            points_difference = user["current_points"] - user["last_points"]
            if abs(points_difference) > 250:
                huge_suffix = " Huge!?"
                huge_suffix_count += 1
            else:
                huge_suffix = ""

            current_points_str = f"{user['current_points']:,}"
            
            points_difference_str = f"{points_difference:+d}{huge_suffix}" if points_difference != 0 else ""
            
            print_user_data(user, current_points_str, points_difference_str, max_points_length)

        else:
            print(f"Battle {BATTLE_TYPE} not found!")

    spaces_huges = alignment_spaces(data['labels']['huges'])
    print(f"{data['labels']['huges']}{spaces_huges}: {huge_suffix_count}")

    if alert:
        print(alert)

def main():
    global interval_count
    
    print("\nFetching initial user data...\n")
    fetch_and_display_user_data()

    timestamp = datetime.now().strftime("%a %m/%d %I:%M:%S %p")
    print(f"\n{data['labels']['start']}{alignment_spaces(data['labels']['start'])}: {timestamp}")

    try:
        while True:
            if WAIT_FOR_ZERO_SECONDS:
                while datetime.now().second != 0:
                    time.sleep(1)
            
            timestamp = datetime.now().strftime("%a %m/%d %I:%M:%S %p")
            print(f"\n{data['labels']['time']}{alignment_spaces(data['labels']['time'])}: {timestamp}")
            
            fetch_and_display_user_data()
            interval_count += 1
            time.sleep(UPDATE_INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("\n\nStopping points tracking.\n")
        for user in data['users']:
            spaces = alignment_spaces(user['name'])
            print(f"{user['name']}{spaces}: {user['total_points_earned']:,} points gained")

        spaces_huges = alignment_spaces(data['labels']['huges'])
        print(f"{data['labels']['huges']}{spaces_huges}: {huge_suffix_count}")
        
        print(f"\nThe script ran for {interval_count} intervals.\n")

if __name__ == "__main__":
    main()
