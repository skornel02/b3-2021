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
    { name: "A remény rabjai", releaseYear: 1994, category: "dráma"},
    { name: "Forrest Gump", releaseYear: 1994, category: "vígjáték"},
    { name: "Stephen King: Halálsoron", releaseYear: 1999, category: "thriller"},
    { name: "Szerelmünk lapjai", releaseYear: 2004, category: "romantika"},
    { name: "Életrevalók", releaseYear: 2011, category: "vígjáték"},
    { name: "Terminátor 2. - Az ítélet napja", releaseYear: 1991, category: "akció"},
    { name: "A keresztapa", releaseYear: 1972, category: "dráma"},
    { name: "Vissza a jövőbe", releaseYear: 1985, category: "kaland"},
    { name: "Elrabolva", releaseYear: 2008, category: "akció"},
    { name: "Gran Torino", releaseYear: 2008, category: "dráma"},
    { name: "Hetedik", releaseYear: 1995, category: "krimi"},
    { name: "Kapj el, ha tudsz!", releaseYear: 2002, category: "krimi"},
    { name: "...és megint dühbe jövünk", releaseYear: 1978, category: "vígjáték"},
    { name: "Kincs, ami nincs", releaseYear: 1981, category: "kaland"},
    { name: "Gladiátor", releaseYear: 2000, category: "dráma"},
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
    preferred.innerHTML = "<h2>Kedvelt kategóriák</h2>";
    forbidden.innerHTML = "<h2>Nem kedvelt kategóriák</h2>";
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