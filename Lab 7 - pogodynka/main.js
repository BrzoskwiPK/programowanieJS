const API_KEY = '336e8cb75553469d6b02fff737c24274'
const CORDS_BASE_URL = 'http://api.openweathermap.org/geo/1.0/direct?q=LOCATION&appid=API_KEY'
const WEATHER_BASE_URL =
  'https://api.openweathermap.org/data/2.5/weather?lat=LATITUDE&lon=LONGITUDE&appid=API_KEY'
const HISTORICAL_API_URL =
  'https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=LATITUDE&lon=LONGITUDE&appid=API_KEY'
const WEATHER_IMAGE_BASE_URL = 'https://openweathermap.org/img/wn/ID@2x.png'
const MAX_LOCATIONS = 10
const fiveMinutesInMs = 5 * 60 * 1000
let temperatureChart

// converts API url
const getApiUrl = (url, lat, lon) =>
  url.replace('LATITUDE', lat).replace('LONGITUDE', lon).replace('API_KEY', API_KEY)

// helper function that fetches data
const fetchData = async url => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error during fetching data: ', error)
    throw error
  }
}

// helper function for converting temperature from kelvins to celsius with a rounding to 0.1
const convertKelvinsToCelsius = kelvins => (kelvins - 273).toFixed(1)

// helper function to delete all child nodes of a node
const removeAllChildNodes = parent => {
  while (parent.firstChild) parent.removeChild(parent.firstChild)
}

// gets item from local storage and returns it (or an empty array if it doesn't exist)
const getLocations = () => {
  const locations = localStorage.getItem('locations')

  return locations ? JSON.parse(locations) : []
}

// fetches API to get weather information for current location
const fetchWeatherInfo = async (lat, lon, index) => {
  if (!lat || !lon) return

  let locations = getLocations()

  try {
    const url = getApiUrl(WEATHER_BASE_URL, lat, lon)
    const data = await fetchData(url)

    locations[index] = data
    localStorage.setItem('locations', JSON.stringify(locations))

    renderLocation(data, index)
  } catch (error) {
    console.error('Error during fetching weather info: ', error)
  }
}

// fetches API to get location cords
const fetchLocationCords = async (location, index) => {
  try {
    const data = await fetchData(
      CORDS_BASE_URL.replace(
        'LOCATION',
        typeof location === 'string' ? location : location.name
      ).replace('API_KEY', API_KEY)
    )

    if (!data[0]) {
      alert('There is no such place!')
    } else {
      const { lat, lon } = data[0]
      await fetchHistoricalWeatherData(lat, lon, index)
      await fetchWeatherInfo(lat, lon, index)
    }
  } catch (error) {
    console.error('Error during fetching location cords: ', error)
  }
}

// creates HTML for current location and displays it on the screen
const renderLocation = (location, index) => {
  const { icon, description } = location.weather[0]
  const { temp, feels_like, temp_min, temp_max, pressure, humidity } = location.main
  const speed = location.wind.speed
  const country = location.sys.country
  const cityName = location.name

  const weatherCard = document.getElementById(`weather__card${index + 1}`)

  weatherCard?.classList.add('visible')

  weatherCard.innerHTML = `
      <h2>${cityName}, ${country}</h2>
      <img src='${WEATHER_IMAGE_BASE_URL.replace('ID', icon)}' alt='weather condition' />
      <p><strong>Weather:</strong> ${description}</p>
      <p><strong>Temperature:</strong> ${convertKelvinsToCelsius(temp)}°C</p>
      <p><strong>Feels Like:</strong> ${convertKelvinsToCelsius(feels_like)}°C</p>
      <p><strong>Min Temperature</strong>: ${convertKelvinsToCelsius(temp_min)}°C</p>
      <p><strong>Max Temperature:</strong> ${convertKelvinsToCelsius(temp_max)}°C</p>
      <p><strong>Pressure:</strong> ${pressure} hPa</p>
      <p><strong>Humidity:</strong> ${humidity}%</p>
      <p><strong>Wind Speed:</strong> ${speed} m/s</p>
      <button id="delete__button" onclick="deleteLocation(${index})">Delete</button>
      <button id="preview__button" onclick="drawChart(${index})">Show chart</button>
  `
}

// handles submit event
const handleSubmit = async e => {
  e.preventDefault()
  const currentLocation = document.querySelector('#location').value
  const locations = getLocations()

  if (currentLocation.length && locations.length < MAX_LOCATIONS)
    await fetchLocationCords(currentLocation, locations.length)

  document.querySelector('#location').value = null
  removeAllChildNodes(document.getElementById('city-suggestions'))
}

// helper function that handles removing node from HTML document
const deleteNode = node => {
  if (!node) return

  removeAllChildNodes(node)
  node?.classList.remove('visible')
}

// deletes location from the storage and rerenders HTML document
const deleteLocation = index => {
  const locations = getLocations()
  locations.splice(index, 1)
  localStorage.setItem('locations', JSON.stringify(locations))

  const weatherCard = document.getElementById(`weather__card${index + 1}`)
  const followingWeatherCard = document.getElementById(`weather__card${index + 2}`)

  deleteNode(weatherCard)
  deleteNode(followingWeatherCard)

  renderAllLocations(locations)
}

// checks if API data should be re-fetched
const shouldRefreshData = () => {
  const lastRefreshTime = localStorage.getItem('lastRefreshTime')
  const currentTime = new Date().getTime()

  return !lastRefreshTime || currentTime - parseInt(lastRefreshTime) > fiveMinutesInMs
}

// fetches data about all locations from the storage
const fetchAllLocations = async () => {
  const locations = getLocations()

  if (shouldRefreshData()) {
    for (let i = 0; i < locations.length; i++) await fetchLocationCords(locations[i], i)

    localStorage.setItem('lastRefreshTime', new Date().getTime().toString())
  } else {
    for (let i = 0; i < locations.length; i++) renderLocation(locations[i], i)
  }
}

// renders all locations' data in HTML document
const renderAllLocations = locations => locations.map((location, i) => renderLocation(location, i))

// re-fetches weather data every 5 minutes
setInterval(fetchAllLocations, fiveMinutesInMs)

// fetches API to get similiar locations to current input value
const fetchCitySuggestions = async inputValue => {
  const suggestionsUrl = `http://geodb-free-service.wirefreethought.com/v1/geo/cities?namePrefix=${inputValue}&limit=5&offset=0`

  try {
    const response = await fetch(suggestionsUrl)
    const data = await response.json()

    return data.data.map(city => city.name)
  } catch (error) {
    console.error('Error during fetching city suggestions: ', error)
    return []
  }
}

// handles input change and renders datalist with city suggestions
const handleInputChange = async e => {
  const inputValue = e.target.value
  const suggestions = await fetchCitySuggestions(inputValue)

  const datalist = document.getElementById('city-suggestions')
  removeAllChildNodes(datalist)

  suggestions.forEach(suggestion => {
    const option = document.createElement('option')
    option.value = suggestion
    datalist.appendChild(option)
  })
}

// fetches historical weather data API to get chunk of today's weather
const fetchHistoricalWeatherData = async (lat, lon, index) => {
  try {
    const url = getApiUrl(HISTORICAL_API_URL, lat, lon)
    const data = await fetchData(url)
    const { list } = data
    const currentHistoricalData = JSON.parse(localStorage.getItem('historicalWeatherData')) || []
    currentHistoricalData[index] = list.slice(-24)
    localStorage.setItem('historicalWeatherData', JSON.stringify(currentHistoricalData))
  } catch (error) {
    console.error('Error during fetching location cords: ', error)
  }
}

const drawChart = index => {
  const temperatureData = JSON.parse(localStorage.getItem('historicalWeatherData'))[index]
  const labels = temperatureData.map(entry => entry.dt_txt).map(entry => entry.slice(-8))
  const temperatures = temperatureData
    .map(entry => entry.main.temp)
    .map(entry => convertKelvinsToCelsius(entry))

  const ctx = document.getElementById('temperatureChart').getContext('2d')

  if (temperatureChart) {
    temperatureChart.destroy()
  }

  temperatureChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          backgroundColor: 'rgba(124, 125, 126, 0.8)',
          borderColor: 'rgba(46, 25, 12, 1)',
          data: temperatures,
          borderWidth: 3,
        },
      ],
    },
  })
}

const initializeApp = async () => {
  fetchAllLocations()
}

document.querySelector('#submit__button').addEventListener('click', e => handleSubmit(e))
document.querySelector('#location').addEventListener('input', handleInputChange)

initializeApp()
