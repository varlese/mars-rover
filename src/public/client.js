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
            <div class="lds-spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        `)
    }

    return (`
        <p>This is the ${roverManifestData.name}. It was launched on ${roverManifestData.launch_date} and landed on Mars on
        ${roverManifestData.landing_date}. It's current status is ${roverManifestData.status}.</p>
    `)
}

// Method to render rover photos
const renderPhotos = (roverPhotos, roverName, pages, page, perPage) => {
    if(roverPhotos && 'undefined' !== typeof roverPhotos.error){
        return `<p>${roverPhotos.error}</p>`
    }

    if(!roverPhotos) {
        getRoverPhotos(store, roverName)
        return (`
            <div class="lds-spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        `)
    }

    const offset = perPage * page

    const imageHTML = roverPhotos.map((photo, index) => {
        console.log(index, offset, (offset + perPage))
        if((offset + perPage) >= index){
            return ''
        }

        return `<img src="${photo}" />`
    }).join('')

    const paginationHTML = ''

    return (`
    <div class="gallery">
        <main id="image-gallery" class="images">
        ${imageHTML}
        </main>
        <footer id="gallery-pagination">
            <button id="btnPrevious">&larr; <span class="sr-only">Previous</span></button>
            <div>
                <div id="gallery-dots">
                    ${renderDots(pages, page)}
                </div>
                <span id="page"></span>
            </div>
            <button id="btnNext"><span class="sr-only">Next </span>&rarr;</button>
        </footer>
    </div>
    `)
}

const renderDots = (pages, page) => {
    let dots = []
    for (var i = 0; i < pages; i++){
        const dotLabel = i + 1
        let dotClasses = ['gallery-dot']

        if(i === page){
            dotClasses.push('active')
        }

        dotClasses = dotClasses.join(' ')

        const dotHTML = (`
            <button class="${dotClasses}" data-index=${i}>
                <span class="sr-only">
                    ${dotLabel}
                </span>
            </button>
        `)
        dots.push(dotHTML)
    }

    return dots.join('')
}

// Set up image gallery
const gallerySetUp = () => {
    var previous = document.getElementById('btnPrevious')
    var next = document.getElementById('btnNext')
    const gallery = document.getElementById('image-gallery')
    var pageIndicator = document.getElementById('page')
    var galleryDots = document.getElementById('gallery-dots')
    let { pages } = store

    var images= [];
    for (var i = 0; i < 36; i++) {
        images.push({
            title: "Image " + (i + 1),
            source: `${renderPhotos(roverPhotos, roverName)}`
        });
    }

    pages = Math.ceil(images.length / perPage)
}

//
window.addEventListener('click', (event) => {
    if( !event.target.classList.contains('gallery-dot') ){
        return
    }

    const page = parseInt(event.target.getAttribute('data-index'), 10)

    updateStore(store, {page})
})

// Previous Button
window.addEventListener('click', () => {
    return

    let { roverPhotos, roverName } = store

    if (page === 1) {
        page = 1;
    } else {
        page--;
        showImages(roverPhotos, roverName);
    }
})

// Next Button
window.addEventListener('click', () => {
    return

    let { roverPhotos, roverName } = store

    if (page < pages) {
        page++;
        showImages(roverPhotos, roverName);
    }
})

// Jump to page
function goToPage(index) {
    let { roverPhotos, roverName } = store

    index = parseInt(index);
    page =  index + 1;

    showImages(roverPhotos, roverName);
}

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
