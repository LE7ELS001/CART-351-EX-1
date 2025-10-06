import requests
import random
import time
import sys
from rich import print
from rich.progress import track
from pyfiglet import Figlet
from rich.console import Console
from rich.panel import Panel

console = Console()
API_TOKEN = "0fef46e2cdafa6e579599bc56588fdf44a90e448"

# -----------------------
# Function: Fetch API Data
# -----------------------
def get_air_quality(city):
    url = f"https://api.waqi.info/search/?token={API_TOKEN}&keyword={city}"
    response = requests.get(url).json()
    if response["status"] == "ok" and len(response["data"]) > 0:
        result = response["data"][0]
        aqi = result["aqi"]
        try:
            aqi = int(aqi)
        except ValueError:
            aqi = 0
        station = result["station"]["name"]
        return aqi, station
    else:
        return None, None

# -----------------------
# Function: AQI Display
# -----------------------
def show_aqi(aqi):
    # Select emoji for variation
    emojis = {
        "good": ["🌿", "🍃", "🌸", "💧"],
        "moderate": ["🌤️", "🌦️", "🌈", "🍂"],
        "bad": ["😷", "🌫️", "🫠", "🌀"],
        "danger": ["💀", "🔥", "☠️", "🌋"]
    }

    # Render colored bar
    bar_length = min(aqi // 5, 20)  # limit length to 20
    bar = "█" * bar_length

    if aqi < 50:
        color = "green"
        mood = random.choice(emojis["good"])
        label = "AIR GOOD"
    elif aqi < 100:
        color = "yellow"
        mood = random.choice(emojis["moderate"])
        label = "AIR SO-SO"
    elif aqi < 150:
        color = "orange3"
        mood = random.choice(emojis["bad"])
        label = "AIR NOT GOOD"
    else:
        color = "red"
        mood = random.choice(emojis["danger"])
        label = "AIR BAD"

    console.print(Panel.fit(
        f"[{color}]{label}[/] {mood}\n\n[{color}]{bar}[/]  [white]AQI = {aqi}[/]",
        title="[bold cyan]AIR QUALITY RESULT[/bold cyan]",
        border_style=color
    ))

# -----------------------
# Function: Loading Animation
# -----------------------
def loading_animation(text="Fetching data..."):
    for _ in track(range(30), description=f"[cyan]{text}[/cyan]"):
        time.sleep(0.02)

# -----------------------
# Main Program
# -----------------------
def main():
    f = Figlet(font="slant")
    console.print(f"[bold cyan]{f.renderText('AIR QUEST')}[/bold cyan]")
    console.print("[bold white]Welcome to Terminal Air Search Bar![/bold white]\n")
    console.print("[dim]Type a city name to view air quality, or type [q] to quit.[/dim]\n")

    while True:
        city = input("🌆 Please enter a city name: ")
        if city.lower() == "q":
            console.print("Thank you for using us, bye! 👋")
            break

        loading_animation("Connecting to Air Servers...")

        aqi, station = get_air_quality(city)
        if aqi is not None:
            console.print(f"\n📍 [bold cyan]Monitoring Station:[/bold cyan] {station}\n")
            show_aqi(aqi)
        else:
            console.print("[bold red]❌ The city was not found, please try again![/bold red]\n")

        time.sleep(0.5)

if __name__ == "__main__":
    main()
