/**
 * @typedef {object} Movie
 * @property {string} name
 * @property {number} releaseYear
 * @property {string} category
 */

/**
 * @type {Movie[]}
 */
const movies = [
    { name: "Legjobb film", releaseYear: 1999, category: "dráma"},
    { name: "Legjobb film2", releaseYear: 2003, category: "akció"},
    { name: "sajt", releaseYear: 2005, category: "történelmi"},
    { name: "sajt2", releaseYear: 1966, category: "musical"},
    { name: "hello", releaseYear: 2042, category: "történelmi"},
];

/**
 * @type {string[]]}
 */
const categories = [...new Set(movies.map(m => m.category))];

/**
 * @type {string[]}
 */
let forbiddenCategories = [];

/**
 * @type {string[]}
 */
let preferredCategories = [];

/**
 * @param {string[]} categories
 */
const renderPickers = (categories) => {
    const preferred = document.getElementById('preferred');
    const forbidden = document.getElementById('forbidden');
    preferred.innerHTML = "";
    forbidden.innerHTML = "";
    categories.forEach(category => {
        preferred.innerHTML += `
        <div>
            <label for="preferred-${category}">${category}</label>
            <input id="preferred-${category}" type="checkbox" oninput="handlePrefer('${category}')"/>
        </div>
        `;
        forbidden.innerHTML += `
        <div>
            <label for="forbidden-${category}">${category}</label>
            <input id="forbidden-${category}" type="checkbox" oninput="handleForbid('${category}')"/>
        </div>
        `;
    })
}

/**
 * @param {Movie[]} movies
 */
const renderMovies = (movies) => {
    const root = document.getElementById('movies');
    root.innerHTML = "";
    const preferredMovies = movies.filter(movie => preferredCategories.includes(movie.category));
    const normalMovies = movies.filter(movie => !preferredCategories.includes(movie.category));
    const addMovie = movie => root.innerHTML += `<li>${movie.name} (${movie.releaseYear} - ${movie.category})</li>\n`;
    preferredMovies.forEach(addMovie);
    normalMovies.forEach(addMovie);
}

renderPickers(categories);

/**
 * @param {string} category
 */
const handlePrefer = (category) => {
    const elem = document.getElementById(`preferred-${category}`);
    if (elem.checked) {
        preferredCategories.push(category);
        document.getElementById(`forbidden-${category}`).disabled = true;
    } else {
        preferredCategories = preferredCategories.filter(cat => cat != category);
        document.getElementById(`forbidden-${category}`).disabled = false;
    }
}

/**
 * @param {string} category
 */
const handleForbid = (category) => {
    const elem = document.getElementById(`forbidden-${category}`);
    if (elem.checked) {
        forbiddenCategories.push(category);
        document.getElementById(`preferred-${category}`).disabled = true;
    } else {
        forbiddenCategories = preferredCategories.filter(cat => cat != category);
        document.getElementById(`preferred-${category}`).disabled = false;
    }
}

const handleRerender = () => {
    /**
     * @type {string | undefined}
     */
    let searchValue = document.getElementById("searchBar").value;
    if (searchValue === undefined) searchValue = '';
    searchValue = searchValue.toLowerCase();
    const acceptedMovies = movies.filter(movie => !forbiddenCategories.includes(movie.category));
    const matchingMovies = acceptedMovies.filter(movie => movie.name.toLowerCase().includes(searchValue));
    renderMovies(matchingMovies);
}