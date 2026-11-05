const fetchBtn = document.getElementById('fetchBtn');
const calcBtn = document.getElementById('calcBtn');
const zoneSelect = document.getElementById('zoneSelect');
const errorMsg = document.getElementById('errorMsg');
const prayerList = document.getElementById('prayerList');
const suggestionResult = document.getElementById('suggestionResult');
const calcResult = document.getElementById('calcResult');

let globalPrayerTimes = null;

// Helper function to convert Unix timestamp to HH:MM format
function formatTimeFromUnix(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 1. Fetch Prayer Times from WaktuSolat App API (v2 endpoint)
fetchBtn.addEventListener('click', async () => {
    const zone = zoneSelect.value;

    if (!zone) {
        errorMsg.textContent = 'Please enter a valid zone code (e.g., WLY01).';
        errorMsg.style.color = 'red';
        return;
    }

    errorMsg.textContent = 'Fetching prayer times...';
    errorMsg.style.color = '#333';
    
    try {
        const response = await fetch(`https://api.waktusolat.app/v2/solat/${zone}`);
        const data = await response.json();

        // Check if prayers array exists in the response
        if (data && data.prayers && data.prayers.length > 0) {
            // Find today's prayer times based on the current date's day of the month
            const today = new Date().getDate();
            const todayPrayer = data.prayers.find(p => p.day === today) || data.prayers[0];

            // Convert Unix timestamps to readable time strings
            globalPrayerTimes = {
                imsak: formatTimeFromUnix(todayPrayer.imsak),
                fajr: formatTimeFromUnix(todayPrayer.fajr),
                syuruk: formatTimeFromUnix(todayPrayer.syuruk),
                dhuha: formatTimeFromUnix(todayPrayer.dhuha),
                dhuhr: formatTimeFromUnix(todayPrayer.dhuhr),
                asr: formatTimeFromUnix(todayPrayer.asr),
                maghrib: formatTimeFromUnix(todayPrayer.maghrib),
                isha: formatTimeFromUnix(todayPrayer.isha)
            };
            
            // Update DOM with prayer times
            prayerList.innerHTML = `
                <li>Subuh (Fajr): ${globalPrayerTimes.fajr}</li>
                <li>Zohor (Dhuhr): ${globalPrayerTimes.dhuhr}</li>
                <li>Asar (Asr): ${globalPrayerTimes.asr}</li>
                <li>Maghrib: ${globalPrayerTimes.maghrib}</li>
                <li>Isyak (Isha): ${globalPrayerTimes.isha}</li>
            `;
            errorMsg.textContent = `Prayer times loaded successfully for Zone ${zone} (${data.month} ${data.year})!`;
            errorMsg.style.color = 'green';
        } else {
            errorMsg.textContent = 'Invalid zone code or no data returned from API.';
            errorMsg.style.color = 'red';
        }
    } catch (error) {
        errorMsg.textContent = 'Network error occurred while fetching API.';
        errorMsg.style.color = 'red';
    }
});

// 2. Suggestion Logic & Calculation with Time Countdown
calcBtn.addEventListener('click', () => {
    if (!globalPrayerTimes) {
        suggestionResult.textContent = 'Suggestion: Please fetch prayer times first!';
        calcResult.textContent = 'Calculation: No data available.';
        return;
    }

    // Get current time in minutes from midnight
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    // Helper function to convert "HH:MM" string to total minutes from midnight
    function timeToMinutes(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }

    // List of prayers to check against current time
    const prayers = [
        { name: 'Subuh (Fajr)', time: globalPrayerTimes.fajr },
        { name: 'Zohor (Dhuhr)', time: globalPrayerTimes.dhuhr },
        { name: 'Asar (Asr)', time: globalPrayerTimes.asr },
        { name: 'Maghrib', time: globalPrayerTimes.maghrib },
        { name: 'Isyak (Isha)', time: globalPrayerTimes.isha }
    ];

    let nextPrayer = null;
    let diffMinutes = 0;

    // Find the next upcoming prayer today
    for (let p of prayers) {
        const prayerMinutes = timeToMinutes(p.time);
        if (prayerMinutes > currentTotalMinutes) {
            nextPrayer = p;
            diffMinutes = prayerMinutes - currentTotalMinutes;
            break;
        }
    }

    // If all prayers for today have passed
    if (!nextPrayer) {
        calcResult.textContent = `Calculation: Current System Time is ${currentTimeStr}. All daily prayers have passed for today.`;
        suggestionResult.textContent = 'Suggestion: Perform Tahajjud or rest for tomorrow Fajr.';
        return;
    }

    // Display meaningful calculation with clear labels and units
    calcResult.textContent = `Calculation: Current Time is ${currentTimeStr} | ${diffMinutes} minutes remaining before ${nextPrayer.name}.`;

    // Suggestion logic using if...else statements based on prayer times
    let suggestion = '';
    const fajr = globalPrayerTimes.fajr;
    const dhuhr = globalPrayerTimes.dhuhr;
    const asr = globalPrayerTimes.asr;
    const maghrib = globalPrayerTimes.maghrib;
    const isha = globalPrayerTimes.isha;

    if (currentTimeStr >= fajr && currentTimeStr < dhuhr) {
        suggestion = 'It is daytime. Recommended activity: Read Quran or perform Dhuha prayer.';
    } else if (currentTimeStr >= dhuhr && currentTimeStr < asr) {
        suggestion = 'It is afternoon. Recommended activity: Rest or prepare for Asr prayer.';
    } else if (currentTimeStr >= asr && currentTimeStr < maghrib) {
        suggestion = 'Late afternoon. Recommended activity: Listen to religious lecture or make Zikr.';
    } else if (currentTimeStr >= maghrib && currentTimeStr < isha) {
        suggestion = 'Evening time. Recommended activity: Read Surah Al-Waqiah after Maghrib.';
    } else {
        suggestion = 'Night time. Recommended activity: Perform Tahajjud prayer or get rest for Fajr.';
    }

    suggestionResult.textContent = `Suggestion: ${suggestion}`;
});