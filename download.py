import urllib.request
import os

os.makedirs('public/icons', exist_ok=True)

icons = {
    'google-calendar.svg': 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg',
    'outlook-classic.svg': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg',
    'outlook-new.svg': 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Microsoft_Office_Outlook_%282024%29.svg',
    'microsoft-365.svg': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg',
    'calendar-other.svg': 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Calendar_icon_2.svg'
}

for filename, url in icons.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(f'public/icons/{filename}', 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print(f"Downloaded {filename}")
    except Exception as e:
        print(f"Failed to download {filename}: {e}")
