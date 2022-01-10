let {setState, getState, getStateAsMap} = (() => {
    let store = Immutable.Map({
        user: { name: "Student" },
        apod: '',
        rovers: ['Curiosity', 'Opportunity', 'Spirit'],
        roverManifestData: '',
        roverPhotos: null,
        roverName: null,
        date: dayjs('2020-10-12').format('YYYY-MM-DD'),
        perPage: 8,
        page: 0,
        pages: null,
    })

    const getStateAsMap = () => {
        return store
    }

    const getState = () => {
        return getStateAsMap().toObject()
    }

    const setState = (newState) => {
        store = store.merge(newState)
    }

    setState({roverName: getState().rovers[0]})

    return {
        setState: setState,
        getState: getState,
        getStateAsMap: getStateAsMap,
    }
})()

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (newState) => {
    setState(newState)
    render(root, getState())
}

const render = async (root) => {
    root.innerHTML = App()
}

// create content
const App = () => {
    let { rovers, roverManifestData, roverPhotos, roverName, date, pages, page, perPage } = getState()

    const inputDate = dayjs(date).format('YYYY-MM-DD')

    return `
        <main>
            <h1>Welcome!</h1>
            <p>Please select a rover and date to view rover photos from that period.</p>
            <section id="menu">
                <nav class="tabs">
                    <ul>
                        ${navigation()}
                    </ul>
                </nav>
                <div class="hamburger">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </div>
                <div class="date-selector">
                    <input type="date" id="date" value="${inputDate}" />
                    <button id="change-date">Update</button>
                </div>
            </section>
            <section>
                ${roverManifest(roverManifestData, roverName)}
            </section>
            <section>
                ${renderPhotos(roverPhotos, roverName, pages, page, perPage)}
            </section>
        </main>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root)
})

window.addEventListener('click', (event) => {
    if( !event.target.classList.contains('rover-link') ){
        return
    }

    event.preventDefault()

    const roverName = event.target.hash.replace(/^#+/,"");

    const date = document.getElementById('date').value

    updateStore({roverName:roverName, roverManifestData: null, roverPhotos: null, date: date})
})

window.addEventListener('click', (event) => {
    if(event.target != document.getElementById('change-date')){
        return
    }

    event.preventDefault()

    const date = document.getElementById('date').value

    updateStore({roverPhotos: null, date: date})
})

// ------------------------------------------------------  COMPONENTS

// Method to dynamically add tabs to DOM
const navigation = () => {
    let {rovers} = getState()

    return rovers.map(name => {
        return `<li><a href="#${name}" class="rover-link">${name}</a></li>`
    }).join('')
}

// Method to render rover manifest data
const roverManifest = (roverManifestData, roverName) => {
    if (!roverManifestData) {
        getRoverManifest(getState(), roverName)
        return (`
        <div class="spinner">
            <div class="bounce1"></div>
            <div class="bounce2"></div>
            <div class="bounce3"></div>
        </div>
        `)
    }

    return (`
        <p>This is the ${roverManifestData.name}. It was launched on ${roverManifestData.launch_date} and landed on Mars on
        ${roverManifestData.landing_date}. It's current status is ${roverManifestData.status}.</p>
    `)
}

// Method to render rover photos
// @todo fix photo rendering so empty string isn't returned first
const renderPhotos = (roverPhotos, roverName, pages, page, perPage) => {
    if(roverPhotos && 'undefined' !== typeof roverPhotos.error){
        return `<p>${roverPhotos.error}</p>`
    }

    if(!roverPhotos) {
        getRoverPhotos(getState(), roverName)
        return (`
            <div class="spinner">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
            </div>
        `)
    }

    const offset = perPage * page

    const imageHTML = roverPhotos.map((photo, index) => {

        if((offset + perPage) <= index || index < offset){
            return ''
        }
        return (`
        <div class="gallery-item">
                <img src="${photo}" />
        </div>
        `)
    }).join('')

    return (`
    <div class="gallery">
        <main id="image-gallery" class="images">
        ${imageHTML}
        </main>
        ${renderNavigation(pages, page)}
    </div>
    `)
}

// Set up gallery pagination/navigation
const renderNavigation = () => {
    return (`
        <footer id="gallery-pagination">
            <button class="btnPrevious">&larr; <span class="sr-only">Previous</span></button>
            <button class="btnNext"><span class="sr-only">Next </span>&rarr;</button>
        </footer>
    `)
}

// Add event listeners for navigation
window.addEventListener('click', (event) => {
    if(!event.target.classList.contains('gallery-dot')){
        return
    }

    const page = parseInt(event.target.getAttribute('data-index'), 10)

    updateStore({page})
})

window.addEventListener('keydown', (event) => {
    if(event.code !== 'ArrowLeft' && event.code !== 'ArrowRight'){
        return
    }

    let {page, pages} = getState()

    let nextPage

    if(event.code === 'ArrowLeft'){
        nextPage = page - 1
    } else if(event.code === 'ArrowRight'){
        nextPage = page + 1
    }

    page = nextPage

    if(page < 0 || page >= pages){
        return
    }

    updateStore({page})
})

// Previous Button
window.addEventListener('click', (event) => {
    if(!event.target.classList.contains('btnPrevious')){
        return
    }

    let {page, pages} = getState()

    let previousPage = page - 1

    page = previousPage

    if(page < 0){
        return
    }

    updateStore({page})
})

// Next Button
window.addEventListener('click', (event) => {
    if(!event.target.classList.contains('btnNext')){
        return
    }

    let {page, pages} = getState()

    let nextPage = page + 1

    page = nextPage

    if(page >= pages){
        return
    }

    updateStore({page})
})

// Load images
function showImages(roverPhotos, roverName) {
    const gallery = document.getElementById('image-gallery')
    let { perPage, page, pages } = getState()

    if(gallery){
        while(gallery.firstChild){
            gallery.removeChild(gallery.firstChild)
        }

        var offset = (page - 1) * perPage;
        var dots = document.querySelectorAll('.gallery-dot');

        for (var i = 0; i < dots.length; i++){
            dots[i].classList.remove('active');
        }

        dots[page - 1].classList.add('active');
    }

    for (var i = offset; i < offset + perPage; i++) {
        if ( images[i] ) {
            var template = document.createElement('div');
            var title = document.createElement('p');
            var titleText = document.createTextNode(images[i].title);
            var img = document.createElement('img');

            template.classList.add('template')
            img.setAttribute("src", images[i].source);
            img.setAttribute('alt', images[i].title);

            title.appendChild(titleText);
            template.appendChild(img);
            template.appendChild(title);
            gallery.appendChild(template);
        }
    }

    const animateItemIn = (i) => {
        var item = galleryItems[i];
        return () => item.classList.add('animate');
    }

    // Animate images
    var galleryItems = document.querySelectorAll('.template')
    for (var i = 0; i < galleryItems.length; i++) {
        var onAnimateItemIn = animateItemIn(i);
        setTimeout(onAnimateItemIn, i * 100);
    }

    // Update page indicator
    const pageIndicator = document.getElementById('page')

    pageIndicator.textContent = "Page " + page + " of " + pages;

    gallerySetUp()
}

// ------------------------------------------------------  API CALLS

// API call for rover manifest data
const getRoverManifest = (state, roverName) => {
    let {roverManifestData} = state

    fetch(`http://localhost:3000/rovers/${roverName}`)
        .then(res => res.json())
        .then(roverManifestData => updateStore({roverManifestData}))

    return roverManifestData
}

// API call to get photos per rover
const getRoverPhotos = (state, roverName) => {
    let {roverPhotos, date, perPage } = state

    const url = `http://localhost:3000/mars-photos/${roverName}/${date}`

    fetch(url)
        .then(res => res.json())
        .then(roverPhotos => {
            const page = 0
            const pages = Math.ceil(roverPhotos.length / perPage)

            return updateStore({roverPhotos, page, pages})
        })

    return roverPhotos
}