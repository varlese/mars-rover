let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    roverManifestData: '',
    roverPhotos: null,
    roverName: null,
    date: dayjs('2020-10-12').format('YYYY-MM-DD'),
}

store.roverName = store.rovers[0]

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// create content
const App = (state) => {
    let { rovers, roverManifestData, roverPhotos, roverName, date } = state

    const inputDate = dayjs(date).format('YYYY-MM-DD')

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <input type="date" id="date" value="${inputDate}" />
                <button id="change-date">Update</button>
                <nav>
                    <ul>
                    ${navigation()}
                    </ul>
                </nav>
            </section>
            <section>
                ${roverManifest(roverManifestData, roverName)}
            </section>
            <section>
                ${renderPhotos(roverPhotos, roverName)}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

window.addEventListener('click', (event) => {
    if( !event.target.classList.contains('rover-link') ){
        return
    }

    event.preventDefault()

    const roverName = event.target.hash.replace(/^#+/,"");

    const date = document.getElementById('date').value

    updateStore(store, {roverName:roverName, roverManifestData: null, roverPhotos: null, date: date})
})

window.addEventListener('click', (event) => {
    if(event.target != document.getElementById('change-date')){
        return
    }

    event.preventDefault()

    const date = document.getElementById('date').value

    updateStore(store, {roverPhotos: null, date: date})
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Method to dynamically add tabs to DOM
const navigation = () => {
    let {rovers} = store

    return rovers.map(name => {
        return `<li><a href="#${name}" class="rover-link">${name}</a></li>`
    }).join('')
}

// Method to render rover manifest data
const roverManifest = (roverManifestData, roverName) => {
    if (!roverManifestData) {
        getRoverManifest(store, roverName)
        return 'Loading...'
    }

    return (`
        <p>This is the ${roverManifestData.name}. It was launched on ${roverManifestData.launch_date} and landed on Mars on
        ${roverManifestData.landing_date}. It's current status is ${roverManifestData.status}.</p>
    `)
}

// Method to render rover photos
const renderPhotos = (roverPhotos, roverName) => {
    if(roverPhotos && 'undefined' !== typeof roverPhotos.error){
        return `<p>${roverPhotos.error}</p>`
    }

    if(!roverPhotos) {
        getRoverPhotos(store, roverName)
        return 'Loading...'
    }

    return roverPhotos.map( photo => {
        return(`
            <img src=${photo} width="200px"/>
        `)
    }).join('')
}

// ------------------------------------------------------  API CALLS

// API call for rover manifest data
const getRoverManifest = (state, roverName) => {
    let {roverManifestData} = state

    fetch(`http://localhost:3000/rovers/${roverName}`)
        .then(res => res.json())
        .then(roverManifestData => updateStore(store, {roverManifestData}))

    return roverManifestData
}

// API call to get photos per rover
const getRoverPhotos = (state, roverName) => {
    let {roverPhotos, date} = state

    const url = `http://localhost:3000/mars-photos/${roverName}/${date}`

    fetch(url)
        .then(res => res.json())
        .then(roverPhotos => updateStore(store, {roverPhotos}))

    return roverPhotos
}
