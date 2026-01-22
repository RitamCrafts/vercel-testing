console.log("JS active!");
import { popup } from "../utils/ErrorHandle.js";
import { countryMap } from "../public/assets/countrymap.js";
//TIME TO GET ALL ID
const searchBoxE = document.getElementById("search-box");
const searchButtonE = document.getElementById("search-button");
const cityNameDisplayE = document.getElementById("city-name-display");
const countryNameDisplayE = document.getElementById("country-name-display");
const locationDisplayE = document.getElementById("location-display");
const weatherIconE = document.getElementById("weather-icon");
const currentStatusE = document.getElementById("current-status");
const currentTempE = document.getElementById("current-temp");
const unitE = document.getElementById("unit");
//-----------------------OTHER VARIABLES/CONSTS-----------------------------
const openWeather_apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

searchButtonE.addEventListener("click", Search);
searchBoxE.addEventListener("keypress", (e) => {
  if (e.key == "Enter") {
    Search();
  }
});

async function Search() {
  try {
    console.log("Searching region - " + searchBoxE.value);
    const locationData = await locationAPICall(
      searchBoxE.value.trim().toLowerCase(),
    );
    if (locationData === null) {
      popup("Place not found, try nearby location");
    }
    const weatherData = await weatherAPICall(
      locationData.lat,
      locationData.lon,
    );
    if (weatherData === null) {
      popup(
        "Place was not found, please try nearby places or there is an API error.",
      );
      // return;
    }
    updateDisplay(locationData, weatherData);
    return 0;
  } catch (error) {
    console.log(error);
    popup(error.message || "Something went wrong");
  }
}

async function locationAPICall(cityName) {
  try {
    let res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${openWeather_apiKey}`,
    );
    let data = await res.json();
    if (!data[0]) {
      const locationData = { locFound: false };
      console.log("LocationAPI data not Recieved");
      throw new Error("LocationAPI data not Recieved");
    }

    //country map generated from AI

    const locationData = {
      city: data[0].name,
      countryCode: data[0].country,
      country: countryMap[data[0].country],
      state: data[0].state,
      lat: data[0].lat,
      lon: data[0].lon,
    };
    console.log(locationData);
    return locationData;
  } catch (error) {
    popup(error.message || "Something went wrong");
  }
}

async function weatherAPICall(lat, lon) {
  try {
    console.log("\nweather api call");
    let res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeather_apiKey}&units=metric`,
    );
    let data = await res.json();
    console.log(data);
    if (data.length === 0) {
      console.log("WeatherAPI data not Recieved");
      return null;
    }
    let checkDayNight = "day";
    if (data.weather[0].icon.endsWith("n")) {
      checkDayNight = "night";
    } else {
      checkDayNight = "day";
    }
    const weatherData = {
      temp: Math.round(data.main.temp),
      weatherStatus: data.weather[0].main,
      checkDayNight: checkDayNight,
      weatherIcon: data.weather[0].icon,
    };
    console.log(weatherData);
    return weatherData;
  } catch (error) {
    popup(error.message || "Something went wrong");
  }
}

function updateDisplay(locData, wethData) {
  let lat = Math.abs(Math.round(locData.lat * 10) / 10);
  let lon = Math.abs(Math.round(locData.lon * 10) / 10);
  let ns = locData.lat < 0 ? "S" : "N";
  let ew = locData.lon < 0 ? "W" : "E";
  cityNameDisplayE.textContent = locData.city;
  countryNameDisplayE.textContent = locData.country;
  locationDisplayE.textContent = `Lat:${lat}° ${ns} | Lon:${lon}° ${ew}`;
  currentStatusE.textContent = wethData.weatherStatus;
  currentTempE.textContent = wethData.temp + "°";
  unitE.textContent = "C";
  currentTempE.style.marginLeft = "1rem";
  weatherIconE.src = `../public/assets/${wethData.weatherIcon}.png`;
}
