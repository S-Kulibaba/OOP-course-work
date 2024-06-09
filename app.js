class WeatherAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
    }

    async fetchWeather(city) {
        const url = `${this.baseUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Weather data not found.');
        }
        return await response.json();
    }
}

class Weather {
    constructor(data) {
        this.temp = data.main.temp;
        this.minTemp = data.main.temp_min;
        this.maxTemp = data.main.temp_max;
        this.weather = data.weather[0].main;
        this.description = data.weather[0].description;
        this.icon = data.weather[0].icon;
        this.humidity = data.main.humidity;
        this.windSpeed = data.wind.speed;
    }
}

class ImageLoader {
    constructor(apiKey, searchEngineId) {
        this.apiKey = apiKey;
        this.searchEngineId = searchEngineId;
    }

    async fetchImages(query) {
        const imageUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query + " beautiful pictures")}&cx=${this.searchEngineId}&key=${this.apiKey}&searchType=image`;
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error('Could not fetch images.');
        }
        const data = await response.json();
        return data.items ? data.items.slice(0, 3) : [];
    }

    async displayImages(query) {
        try {
            const images = await this.fetchImages(query);
            if (images.length > 0) {
                const imagesHtml = images.map(img => `<div class="slide"><img src="${img.link}" alt="Image related to ${query}" class="city-image"></div>`).join('');
                const sliderHtml = `
                    <div class="slider">
                        <div class="slides">${imagesHtml}</div>
                        <button class="prev">&#10094;</button>
                        <button class="next">&#10095;</button>
                    </div>
                `;
                document.querySelector('.images-container').innerHTML = sliderHtml;
                this.initSlider();
            } else {
                document.querySelector('.images-container').innerHTML = '<p>No images found.</p>';
            }
        } catch (error) {
            document.querySelector('.images-container').innerHTML = `<p>Error loading images: ${error.message}</p>`;
        }
    }

    initSlider() {
        let slideIndex = 0;
        const slides = document.querySelectorAll(".slide");
        const showSlides = (n) => {
            slides.forEach((slide, index) => {
                slide.style.display = "none";
            });
            slides[n].style.display = "block";
        }
        showSlides(slideIndex);

        document.querySelector(".prev").addEventListener("click", () => {
            slideIndex = (slideIndex > 0) ? slideIndex - 1 : slides.length - 1;
            showSlides(slideIndex);
        });

        document.querySelector(".next").addEventListener("click", () => {
            slideIndex = (slideIndex + 1) % slides.length;
            showSlides(slideIndex);
        });
    }
}

class UI {
    constructor() {
        this.cityInput = document.querySelector('.city__name');
        this.weatherResult = document.querySelector('.current-weather');
        this.imageLoader = null;
    }

    init(weatherAPI, imageLoader) {
        this.imageLoader = imageLoader;
        this.cityInput.addEventListener('keypress', event => {
            if (event.key === "Enter") {
                this.loadWeather(weatherAPI);
                document.querySelector('.city').classList.add('moved');
                this.showWeatherAndImages();
            }
        });
    }

    async loadWeather(weatherAPI) {
        try {
            const city = this.cityInput.value.trim();
            const weatherData = await weatherAPI.fetchWeather(city);
            const weather = new Weather(weatherData);
            this.displayWeather(weather, city);
            await this.imageLoader.displayImages(city);
        } catch (error) {
            this.displayError(error);
        }
    }

    showWeatherAndImages() {
        this.cityInput.parentElement.classList.add('moved');
        document.querySelector('.container').classList.add('active');
        document.querySelector('.current-weather').classList.add('active');
        document.querySelector('.weather-additional-info').classList.add('active');
        document.querySelector('.images-container').classList.add('active');
    }    

    displayWeather(weather, city) {
        const weatherIconUrl = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        this.weatherResult.innerHTML = `
            <img src="${weatherIconUrl}" alt="${weather.description}" class="current-weather__icon">
            <div class="current-weather__city-name">${city}</div>
            <div class="current-weather__temperature">${weather.temp}°C</div>
            <div class="current-weather__data-container">
                <div class="current-weather__weather-name">${weather.description}</div>
                <div class="current-weather__max-min-wrapper">
                    <div class="current-weather__max-min">Max: ${weather.maxTemp}°C</div>
                    <div class="current-weather__max-min">Min: ${weather.minTemp}°C</div>
                </div>
            </div>
        `;
    }

    displayError(error) {
        this.weatherResult.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'c4ea7eac14ca4d9d9105709a3663b8ac';
    const googleApiKey = 'AIzaSyB-ZrtjrRHCzrr5JXKNdCRb6T5mYmXeMks';
    const searchEngineId = 'b766b18c79ef54037';
    const weatherAPI = new WeatherAPI(apiKey);
    const imageLoader = new ImageLoader(googleApiKey, searchEngineId);
    const ui = new UI();
    ui.init(weatherAPI, imageLoader);
});
