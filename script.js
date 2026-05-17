// resize vh for mobile
mobileResize();

function mobileResize() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', () => {
    mobileResize();
});

let longitude;
let latitude;
let sunriseTime;
let sunsetTime;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        getSunTime();
    },
    (error) => {
        console.error(error);
        window.alert("Error loading location");
    }
  );
} else {
  console.log("Geolocation not supported.");
}

async function getSunTime() {
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=dd8e5c27e898595d7b1aa18f4ecf0123`;
    console.log(url);

    try {
        let res = await fetch(url);
        let data = await res.json();

        sunriseTime = new Date(data.sys.sunrise * 1000);
        sunsetTime = new Date(data.sys.sunset* 1000);
        console.log(sunriseTime, sunsetTime);
        
        setClock(sunriseTime, sunsetTime);
    
    } catch (error) {
        console.error(error);
        // window.alert("Error loading data");
    }
}

// some of the worst code I've ever written tbh

function setClock(sunrise, sunset) {
    console.log(sunrise, sunset);
    let sunriseSeconds = (sunrise.getHours()*3600) + (sunrise.getMinutes()*60) + sunrise.getSeconds();
    let sunsetSeconds = (sunset.getHours()*3600) + (sunset.getMinutes()*60) + sunset.getSeconds();
    // console.log(sunriseSeconds, sunsetSeconds);

    let sunriseRatio = sunriseSeconds / 86400;
    let sunsetRatio = sunsetSeconds / 86400;

    // console.log(sunriseRatio, sunsetRatio);

    let sunriseAngle = sunriseRatio * 360;
    let sunsetAngle = sunsetRatio * 360;

    document.body.style.setProperty('--sunrise-angle', sunriseAngle + "deg");
    document.body.style.setProperty('--sunset-angle', sunsetAngle + "deg");

    let midnightAngle = sunriseAngle - (0.5*((360 - sunsetAngle) + sunriseAngle));
    // console.log(midnightAngle);

    function placeAllMarkers() {
        let midnightMarker = document.querySelector("#midnight");
        placeMarker(midnightMarker, midnightAngle);

        let sunriseMarker = document.querySelector("#sunrise");
        placeMarker(sunriseMarker, sunriseAngle);

        let noonMarker = document.querySelector("#noon");
        placeMarker(noonMarker, 180 + midnightAngle);

        let sunsetMarker = document.querySelector("#sunset");
        placeMarker(sunsetMarker, sunsetAngle);
    }

    placeAllMarkers();
    window.addEventListener('resize', placeAllMarkers);

    setInterval(setHand, 1000);

    function setHand() {

        let hand = document.querySelector(".hand");
        let handAngle;
        let now = new Date();
        let nowSeconds = (now.getHours()*3600) + (now.getMinutes()*60) + now.getSeconds();
        let nowAngle = (nowSeconds / 86400) * 360;
        console.log(nowAngle, sunriseAngle, sunsetAngle);

        hand.style.setProperty('--rotation', midnightAngle);

        let quadrant1 = sunriseAngle - midnightAngle;
        let quadrant2 = 180 - sunriseAngle + midnightAngle;
        console.log(quadrant2);

        if (nowAngle >= 0 && nowAngle <= 90) {
            hand.style.setProperty('--rotation', midnightAngle + ((nowAngle / 90) * quadrant1));
            // console.log("quadrant1");
        } else if (nowAngle > 90 && nowAngle <= 180) {
            // console.log("quadrant2");
            hand.style.setProperty('--rotation', sunriseAngle + (((nowAngle - 90)/90) * quadrant2));
        } else if (nowAngle > 180 && nowAngle <= 270) {
            hand.style.setProperty('--rotation', 180 + midnightAngle + ((nowAngle - 180)/90 * quadrant2));
        } else if (nowAngle > 270 && nowAngle <= 360) {
            let quadrant4Angle = sunsetAngle + ((nowAngle - 270)/90 * quadrant1);
            console.log(quadrant4Angle);
            if (quadrant4Angle > 360) {
                quadrant4Angle = quadrant4Angle - 360;
                hand.style.setProperty('--rotation', quadrant4Angle);
            } else {
                hand.style.setProperty('--rotation', quadrant4Angle);
            }
        }
    }

    setHand();
}


function placeMarker(marker, angle) {
    let radius = Math.min(window.innerWidth, window.innerHeight) / 2 * 0.9;
    let angleRad = (angle - 90) * (Math.PI / 180);
    
    let x = window.innerWidth / 2 + Math.cos(angleRad) * radius;
    let y = window.innerHeight / 2 + Math.sin(angleRad) * radius;
    marker.style.left = `${x}px`;
    marker.style.top = `${y}px`;
}
