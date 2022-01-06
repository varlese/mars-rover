let store = {
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
    let { rovers, roverManifestData, roverPhotos, roverName, date, pages, page, perPage } = state

    const inputDate = dayjs(date).format('YYYY-MM-DD')

    return `
        <header></header>
        <main>
            <h1>Welcome!</h1>
            <p>Please select a rover and date to view rover photos from that period.</p>
            <section id="menu">
                <nav class="tabs">
                    <ul>
                        ${navigation()}
                    </ul>
                </nav>
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
        getRoverPhotos(store, roverName)
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
        console.log(index, offset, (offset + perPage))
        if((offset + perPage) <= index || index < offset){
            console.log(index)
            return ''
        }
        return `<img src="${photo}" />`
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
const renderDot = (page, currentPage, buttonClass) => {
    const dotLabel = page + 1
    let dotClasses = [buttonClass]

    if(currentPage === page){
        dotClasses.push('active')
    }

    dotClasses = dotClasses.join(' ')

    const dotHTML = (`
    <button class="${dotClasses}" data-index=${page}>
        <span class="sr-only">
            ${dotLabel}
        </span>
    </button>
    `)

    return dotHTML
}

const renderNavigation = (pages, page) => {
    let dots = []
    for (var i = 0; i < pages; i++){
        dots.push(renderDot(i, page, 'gallery-dot'))
    }

    const dotsHTML = dots.join('')

    return (`
        <footer id="gallery-pagination">
            <button class="btnPrevious">&larr; <span class="sr-only">Previous</span></button>
            <div>
                <div id="gallery-dots">
                    ${dotsHTML}
                </div>
                <span id="page"></span>
            </div>
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

    updateStore(store, {page})
})

window.addEventListener('keydown', (event) => {
    if(event.code !== 'ArrowLeft' && event.code !== 'ArrowRight'){
        return
    }

    let {page, pages} = store

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

    updateStore(store, {page})
})

// Previous Button
window.addEventListener('click', (event) => {
    if(!event.target.classList.contains('btnPrevious')){
        return
    }

    let {page} = store

    let previousPage = page - 1

    page = previousPage

    if(page < 0){
        return
    }

    updateStore(store, {page})
})

// Next Button
window.addEventListener('click', (event) => {
    if(!event.target.classList.contains('btnNext')){
        return
    }

    let {page} = store

    let nextPage = page + 1

    page = nextPage

    if(page >= pages){
        return
    }

    updateStore(store, {page})
})

// Load images
function showImages(roverPhotos, roverName) {
    const gallery = document.getElementById('image-gallery')
    let { perPage, page, pages } = store

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
        .then(roverManifestData => updateStore(store, {roverManifestData}))

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

            return updateStore(store, {roverPhotos, page, pages})
        })

    return roverPhotos
}