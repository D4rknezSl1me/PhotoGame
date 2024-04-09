const zoom_outer = document.getElementById("zoom_outer");
const zoom = document.getElementById("zoom");
let zoom_bounding_box = undefined;
let zoom_outer_bounding_box = zoom_outer.getBoundingClientRect();
var submitted = false;
var links = []
window.addEventListener("load", function() {
    if (sessionStorage.getItem("manualRefresh") == "true") {
        sessionStorage.clear();
        sessionStorage.setItem("rounds", "1");
        sessionStorage.setItem("pointsTotal", "0");
        roundTitle.textContent = "Round " + sessionStorage.getItem("rounds") + " of 5";
        document.addEventListener('contextmenu', event=>event.preventDefault());
        getLinks();
    } else {
        try {
            sessionStorage.setItem("manualRefresh", "true");
        } catch {
            sessionStorage.clear();
            sessionStorage.setItem("manualRefresh", "true");
        }
        if (sessionStorage.getItem("rounds") == null) {
            sessionStorage.setItem("rounds", "1");
            sessionStorage.setItem("pointsTotal", "0");
        }
        if (sessionStorage.getItem("rounds") < 6) {
            roundTitle.textContent = "Round " + sessionStorage.getItem("rounds") + " of 5";
            document.addEventListener('contextmenu', event=>event.preventDefault());
            getLinks();
        } else {
            roundTitle.textContent = "Game Review";
            return;
        }
        if (sessionStorage.getItem("rounds") == 1 && sessionStorage.getItem("pointsTotal") !== null) {
            sessionStorage.setItem("pointsTotal", "0");
        }
    }
});
window.onresize = ()=>{
    zoom_outer_bounding_box = zoom_outer.getBoundingClientRect();
    constrainImage();
    setTransform();
}
var ogScale;
zoom.onload = ()=>{
    zoom_bounding_box = {
        width: zoom.width,
        height: zoom.height
    };
    const widthZoom = zoom_outer_bounding_box.width / zoom_bounding_box.width;
    const heightZoom = zoom_outer_bounding_box.height / zoom_bounding_box.height;
    if (widthZoom < heightZoom) {
        scale = widthZoom;
    } else {
        scale = heightZoom;
    }
    ogScale = scale;
    constrainImage();
    setTransform();
}
var scale = 1
  , panning = false
  , pointX = 0
  , pointY = 0
  , start = {
    x: 0,
    y: 0
};
function setTransform() {
    zoom.style.transform = "translate(" + pointX + "px, " + pointY + "px) scale(" + scale + ")";
}
zoom.onmousedown = function(e) {
    e.preventDefault();
    start = {
        x: e.clientX - pointX,
        y: e.clientY - pointY
    };
    panning = true;
}
window.onmouseup = function(e) {
    panning = false;
}
zoom.onmousemove = function(e) {
    e.preventDefault();
    if (!panning) {
        return;
    }
    pointX = (e.clientX - start.x);
    pointY = (e.clientY - start.y);
    constrainImage();
    setTransform();
    zoom.style.transition = "none";
}
zoom.onwheel = function(e) {
    e.preventDefault();
    if (panning === true) {
        return;
    }
    var delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
    if (scale <= (ogScale) && delta < 0) {
        scale = ogScale;
        return;
    } else if (scale >= 5 && delta > 0) {
        return;
    }
    var oldScale = scale;
    (delta > 0) ? (scale *= 1.1) : (scale /= 1.1);
    pointX -= e.offsetX * (scale - oldScale);
    pointY -= e.offsetY * (scale - oldScale);
    constrainImage();
    setTransform();
    zoom.style.transition = "all 0.15s linear";
    return;
}
zoom_outer.onwheel = function(e) {
    e.preventDefault();
}
function constrainImage() {
    if (zoom_bounding_box === undefined)
        return;
    if (zoom_outer_bounding_box.width > zoom_bounding_box.width * scale) {
        pointX = zoom_outer_bounding_box.width / 2 - zoom_bounding_box.width / 2 * scale;
    } else {
        if (pointX > 0) {
            pointX = 0;
        }
        const maxX = zoom_outer_bounding_box.width - zoom_bounding_box.width * scale;
        if (pointX < maxX) {
            pointX = maxX;
        }
    }
    if (zoom_outer_bounding_box.height > zoom_bounding_box.height * scale) {
        pointY = zoom_outer_bounding_box.height / 2 - zoom_bounding_box.height / 2 * scale;
    } else {
        if (pointY > 0) {
            pointY = 0;
        }
        const maxY = zoom_outer_bounding_box.height - zoom_bounding_box.height * scale;
        if (pointY < maxY) {
            pointY = maxY;
        }
    }
}
const minmax = document.getElementById("min_max");
var sizeBinary = 0;
function resize() {
    if (sizeBinary == 0) {
        zoom_outer.style.height = "85vh";
        zoom_outer.style.width = "70%";
        zoom_outer_bounding_box = zoom_outer.getBoundingClientRect();
        constrainImage();
        setTransform();
        minmax.src = "https://storage.googleapis.com/www.chronophoto.app/Picture_links/minimize.png";
        sizeBinary = 1;
    } else {
        zoom_outer.style.height = "";
        zoom_outer.style.width = "";
        zoom_outer_bounding_box = zoom_outer.getBoundingClientRect();
        constrainImage();
        setTransform();
        sizeBinary = 0;
        minmax.src = "https://storage.googleapis.com/www.chronophoto.app/Picture_links/maximize.png";
    }
    zoom.src = sessionStorage.getItem("link" + sessionStorage.getItem("rounds"));
}
function filterPips(value) {
    if (value % 10 === 0) {
        return 1;
    }
    if (value % 5 === 0) {
        return 2;
    }
    return 0;
}
var pipsSlider = document.getElementById('slider-pips');
noUiSlider.create(pipsSlider, {
    range: {
        min: 1900,
        max: 2023
    },
    step: 1,
    behaviour: 'snap',
    connect: [false, false],
    start: [1960],
    pips: {
        mode: 'steps',
        density: 0.8196,
        filter: filterPips
    }
});
var pips = pipsSlider.querySelectorAll('.noUi-value');
function clickOnPip() {
    if (submitted == false) {
        var value = Number(this.getAttribute('data-value'));
        pipsSlider.noUiSlider.set(value);
    } else {
        return;
    }
}
for (var i = 0; i < pips.length; i++) {
    pips[i].style.cursor = 'pointer';
    pips[i].addEventListener('click', clickOnPip);
}
var select = document.getElementById('year');
var inputNumber = document.getElementById('year');
pipsSlider.noUiSlider.on('update', function(values, handle) {
    var value = values[handle];
    if (handle) {
        inputNumber.value = value;
    } else {
        select.value = Math.round(value);
    }
});
select.addEventListener('change', function() {
    pipsSlider.noUiSlider.set([this.value, null]);
});
inputNumber.addEventListener('change', function() {
    pipsSlider.noUiSlider.set([null, this.value]);
});
var typing = false;
function constrainInput() {
    typing = true;
    select.maxLength = 4;
    if (select.value.length > select.maxLength)
        select.value = select.value.slice(0, select.maxLength);
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
var pictureDate;
async function getLinks() {
    if (!sessionStorage.getItem("res")) {
        const response = await fetch("https://www.chronophoto.app/badSneakers.txt")
        const res = await response.json();
        sessionStorage.setItem("res", JSON.stringify(res));
    }
    if (sessionStorage.getItem("rounds") === "1") {
        const res = JSON.parse(sessionStorage.getItem("res"));
        const years = Object.keys(res);
        const year_container = [];
        let i = 1;
        while (year_container.length != 5) {
            const year = years[Math.floor(Math.random() * years.length)];
            const year_links = res[year];
            const link = year_links[Math.floor(Math.random() * year_links.length)];
            try {
                const response = await fetch("https://" + link);
                if (!year_container.includes(link)) {
                    year_container.push(link);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = function() {
                        const dataURI = reader.result;
                        try {
                            sessionStorage.setItem("link" + i, dataURI);
                            zoom.src = sessionStorage.getItem("link" + sessionStorage.getItem("rounds"));
                            sessionStorage.setItem("realDate" + i, year * 29.234);
                            pictureDate = sessionStorage.getItem("realDate" + sessionStorage.getItem("rounds"));
                            i++;
                        } catch {
                            try {
                                sessionStorage.setItem("link" + i, "https://" + link);
                                zoom.src = sessionStorage.getItem("link" + sessionStorage.getItem("rounds"));
                                sessionStorage.setItem("realDate" + i, year * 29.234);
                                pictureDate = sessionStorage.getItem("realDate" + sessionStorage.getItem("rounds"));
                                i++;
                            } catch {
                                year_container.length = 0;
                                i = 1;
                                sessionStorage.removeItem("link1");
                                sessionStorage.removeItem("link2");
                                sessionStorage.removeItem("link3");
                                sessionStorage.removeItem("link4");
                                sessionStorage.removeItem("link5");
                            }
                        }
                    }
                }
            } catch {
                console.log(sessionStorage.getItem("link" + i));
            }
        }
    }
    pictureDate = sessionStorage.getItem("realDate" + sessionStorage.getItem("rounds"));
    zoom.src = sessionStorage.getItem("link" + sessionStorage.getItem("rounds"));
}
var guessedDate;
var photoQuestion = document.getElementById('photoQuestion');
var pipsSlider2 = document.getElementById('slider-pips2');
var pointSlider = document.getElementById('slider-round');
var point_imageId = document.getElementById('points_image');
var total = document.getElementById('resultsTotal');
var endRound = document.getElementById('endRound');
var background_image = document.getElementById("game_background_image");
if (sessionStorage.getItem("rounds") == null) {
    sessionStorage.setItem("rounds", "1");
    sessionStorage.setItem("pointsTotal", "0");
}
if (sessionStorage.getItem("rounds") <= 5) {
    roundTitle.textContent = "Round " + sessionStorage.getItem("rounds") + " of 5";
}
document.addEventListener('keydown', function(e) {
    switch (e.key) {
    case "Enter":
        if (typing == true) {
            typing = false;
        } else {
            if (submitted == false && parseInt(sessionStorage.getItem("rounds")) < 6) {
                guessedDate = inputNumber.value;
                submitAnswer();
            } else if (parseInt(sessionStorage.getItem("rounds")) < 6) {
                endRoundFunction(pipsSlider.noUiSlider.get(true));
            }
        }
        break;
    }
});
function checkImage(url) {
    return fetch(url, {
        method: 'HEAD'
    }).then(res=>{
        return res.headers.get('Content-Type').startsWith('image')
    }
    )
}
function submitAnswer() {
    if (pictureDate == null) {
        return;
    }
    pictureDate = Math.round(pictureDate / 29.234);
    var codeRefresh = true;
    submitted = true;
    guessedDate = pipsSlider.noUiSlider.get(true);
    var dif = Math.abs(pictureDate - guessedDate);
    pipsSlider.setAttribute('disabled', true);
    select.disabled = true;
    submit.remove();
    var origins;
    var color = "rgb(" + Math.min(255, 31.875 * dif) + "," + Math.min(255, 255 - ((dif - 5) * 17)) + ", 30)";
    if (pictureDate < guessedDate) {
        noUiSlider.create(pipsSlider2, {
            range: {
                min: 1900,
                max: 2023
            },
            step: 1,
            behaviour: 'snap',
            connect: [false, true, false],
            start: [pictureDate, guessedDate],
            pips: {
                mode: 'steps',
                density: 0.8196,
                filter: filterPips
            }
        });
        origins = pipsSlider2.getElementsByClassName('noUi-handle-upper');
        origins = origins[0];
        originsTrue = pipsSlider2.getElementsByClassName('noUi-handle-lower');
        originsTrue = originsTrue[0];
        originsTrue.style.boxShadow = "";
        originsTrue.style.background = color;
        origins.style.height = "23px";
        origins.style.width = "11px";
        origins.style.right = "-5.8px";
        origins.style.top = "-3.5px";
        if (dif == 0) {
            color = "rgb(65, 250, 70)";
            origins.style.background = color;
            originsTrue.remove();
        }
    } else {
        noUiSlider.create(pipsSlider2, {
            range: {
                min: 1900,
                max: 2023
            },
            step: 1,
            behaviour: 'snap',
            connect: [false, true, false],
            start: [guessedDate, pictureDate],
            pips: {
                mode: 'steps',
                density: 0.8196,
                filter: filterPips
            }
        });
        origins = pipsSlider2.getElementsByClassName('noUi-handle-lower');
        origins = origins[0];
        originsTrue = pipsSlider2.getElementsByClassName('noUi-handle-upper');
        originsTrue = originsTrue[0];
        originsTrue.style.background = color;
        originsTrue.style.boxShadow = "";
        origins.style.background = "black";
        origins.style.height = "23px";
        origins.style.width = "11px";
        origins.style.right = "-5.8px";
        origins.style.top = "-3.5px";
        if (dif == 0) {
            color = "rgb(65, 250, 70)";
            origins.style.background = color;
            originsTrue.remove();
        }
    }
    pipsSlider2.setAttribute('disabled', true);
    connection = document.getElementsByClassName('noUi-connect');
    connection = connection[0];
    connection.style.background = color;
    var results = document.getElementById("results");
    var result
    if (dif <= 20) {
        result = Math.round(Math.pow(20 - dif, 1.55) * 9.62506135768);
    } else {
        result = 0;
    }
    results.textContent += result;
    var dateReveal = document.getElementById("trueDate");
    dateReveal.textContent += "Photo was taken in " + pictureDate;
    dateReveal.style.display = "block";
    noUiSlider.create(pointSlider, {
        range: {
            min: 0,
            max: 1000
        },
        behaviour: 'snap',
        connect: [true, false],
        start: [result],
    });
    pointSlider.setAttribute('disabled', true);
    var connectionPoints = pointSlider.getElementsByClassName('noUi-connect');
    connectionPoints = connectionPoints[0];
    connectionPoints.style.background = color;
    point_imageId.style.display = 'block';
    results.style.display = 'block';
    results.style.color = color;
    var pointsTotal = result;
    pointsTotal += parseInt(sessionStorage.getItem("pointsTotal"), 10);
    sessionStorage.setItem("pointsTotal", pointsTotal.toString());
    total.textContent = "Total: " + pointsTotal;
    if (pointsTotal == null) {
        sessionStorage.setItem("pointsTotal", result);
        total.textContent = "Total Points: " + result;
    }
    total.style.display = 'inline-block';
    var rounds = sessionStorage.getItem("rounds");
    endRound.style.display = 'block';
    endRound.addEventListener('click', function() {
        endRoundFunction(guessedDate);
    });
    if (rounds == 5) {
        endRound.value = "Game Results";
    }
    point_imageId.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "end"
    });
}
;function endRoundFunction(guess) {
    if (sessionStorage.getItem("realDate5") == null) {
        return;
    }
    sessionStorage.setItem("manualRefresh", "false");
    var rounds = sessionStorage.getItem("rounds");
    sessionStorage.setItem("guess" + rounds, guess);
    rounds++;
    sessionStorage.setItem("rounds", rounds.toString());
    if (rounds >= 6) {
        roundTitle.textContent = "Game Review";
        roundTitle.scrollIntoView({
            block: "start",
            inline: "nearest"
        });
        location.reload();
    } else {
        roundTitle.scrollIntoView({
            block: "start",
            inline: "nearest"
        });
        location.reload();
    }
}
function reviewSetTransform(entry) {
    entry.zoom.style.transform = "translate(" + entry.x + "px, " + entry.y + "px) scale(" + entry.scale + ")";
}
function reviewConstrainImage(entry) {
    const bbox = entry.zoom_bounding_box;
    const outer_bbox = entry.zoom_outer_bounding_box;
    if (bbox === undefined)
        return;
    if (outer_bbox.width > bbox.width * entry.scale) {
        entry.x = outer_bbox.width / 2 - bbox.width / 2 * entry.scale;
    } else {
        if (entry.x > 0) {
            entry.x = 0;
        }
        const maxX = outer_bbox.width - bbox.width * entry.scale;
        if (entry.x < maxX) {
            entry.x = maxX;
        }
    }
    if (outer_bbox.height > bbox.height * entry.scale) {
        entry.y = outer_bbox.height / 2 - bbox.height / 2 * entry.scale;
    } else {
        if (entry.y > 0) {
            entry.y = 0;
        }
        const maxY = outer_bbox.height - bbox.height * entry.scale;
        if (entry.y < maxY) {
            entry.y = maxY;
        }
    }
}
function makeGameReviewEntry(round, parent) {
    const round_elem = document.createElement("div");
    round_elem.id = "round" + round;
    round_elem.className = "round";
    round_elem.textContent = "Round " + round;
    const zoom_outer = document.createElement("div");
    zoom_outer.id = "zoom_outer" + round;
    zoom_outer.className = "zoom_outer";
    const zoom = document.createElement("img");
    zoom.id = "zoom" + round;
    zoom.className = "zoom";
    zoom.src = sessionStorage.getItem("link" + round);
    zoom_outer.appendChild(zoom);
    const results = document.createElement("div");
    results.id = "results" + round;
    results.className = "results";
    const date_slider = document.createElement("div");
    date_slider.id = "slider_round" + round;
    date_slider.className = "slider-styled round_slider";
    const true_date = document.createElement("div");
    true_date.id = "trueDate" + round;
    true_date.className = "true_date";
    const slider_pips = document.createElement("div");
    slider_pips.id = "sliderPips" + round;
    slider_pips.className = "slider_pips";
    parent.appendChild(round_elem);
    parent.appendChild(zoom_outer);
    parent.appendChild(results);
    parent.appendChild(date_slider);
    parent.appendChild(true_date);
    parent.appendChild(slider_pips);
    return {
        round_elem: round_elem,
        zoom: zoom,
        zoom_outer: zoom_outer,
        slider_pips: slider_pips,
        results: results,
        true_date: true_date,
        date_slider: date_slider,
        x: 0,
        y: 0,
        ogScale: 1,
        scale: 1,
        zoom_bounding_box: undefined,
        zoom_outer_bounding_box: zoom_outer.getBoundingClientRect(),
        guess: parseInt(sessionStorage.getItem("guess" + round)),
        realDate: Math.round(sessionStorage.getItem("realDate" + round) / 29.234)
    };
}
function setupGameReviewEntry(entry) {
    entry.zoom.onload = ()=>{
        entry.zoom_bounding_box = {
            width: entry.zoom.width,
            height: entry.zoom.height
        };
        const widthZoom = entry.zoom_outer_bounding_box.width / entry.zoom_bounding_box.width;
        const heightZoom = entry.zoom_outer_bounding_box.height / entry.zoom_bounding_box.height;
        if (widthZoom < heightZoom) {
            entry.scale = widthZoom;
        } else {
            entry.scale = heightZoom;
        }
        entry.ogScale = entry.scale;
        reviewConstrainImage(entry);
        reviewSetTransform(entry);
    }
    entry.zoom.onmousedown = function(e) {
        e.preventDefault();
        start = {
            x: e.clientX - entry.x,
            y: e.clientY - entry.y
        };
        panning = true;
    }
    entry.zoom.onmousemove = function(e) {
        e.preventDefault();
        if (!panning)
            return;
        entry.x = e.clientX - start.x;
        entry.y = e.clientY - start.y;
        reviewConstrainImage(entry);
        reviewSetTransform(entry);
        entry.zoom.style.transition = "none";
    }
    entry.zoom_outer.onwheel = e=>e.preventDefault();
    entry.zoom.onwheel = function(e) {
        e.preventDefault();
        if (panning === true)
            return;
        let delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
        if (entry.scale <= (entry.ogScale / 1.1) && delta < 0) {
            entry.scale = entry.ogScale;
            return;
        }
        if (entry.scale >= 5 && delta > 0)
            return;
        const oldScale = entry.scale;
        if (delta > 0) {
            entry.scale *= 1.1
        } else {
            entry.scale /= 1.1
        }
        entry.x -= e.offsetX * (entry.scale - oldScale);
        entry.y -= e.offsetY * (entry.scale - oldScale);
        reviewConstrainImage(entry);
        reviewSetTransform(entry);
        entry.zoom.style.transition = "all 0.15s linear";
    }
}
function setupGameReviewEntryPips(entry) {
    const diff = Math.abs(entry.realDate - entry.guess);
    let color = "rgb(" + Math.min(255, 31.875 * diff) + "," + Math.min(255, 255 - ((diff - 5) * 17)) + ", 30)";
    const originsClass = (entry.realDate < entry.guess) ? 'noUi-handle-upper' : 'noUi-handle-lower';
    const originsTrueClass = (entry.realDate < entry.guess) ? 'noUi-handle-lower' : 'noUi-handle-upper';
    const start = [entry.realDate, entry.guess];
    start.sort();
    noUiSlider.create(entry.slider_pips, {
        range: {
            min: 1900,
            max: 2023
        },
        step: 1,
        behaviour: 'snap',
        connect: [false, true, false],
        start: start,
        pips: {
            mode: 'steps',
            density: 0.8196,
            filter: filterPips
        }
    });
    const originsTrue = entry.slider_pips.getElementsByClassName(originsTrueClass)[0];
    originsTrue.style.boxShadow = "";
    originsTrue.style.background = color;
    const origins = entry.slider_pips.getElementsByClassName(originsClass)[0];
    origins.style.height = "23px";
    origins.style.width = "11px";
    origins.style.right = "-5.8px";
    origins.style.top = "-3.5px";
    entry.slider_pips.setAttribute('disabled', true);
    const connection = entry.slider_pips.getElementsByClassName('noUi-connect')[0];
    connection.style.background = color;
    const result = (diff <= 20) ? Math.round(Math.pow(20 - diff, 1.55) * 9.62506135768) : 0;
    entry.results.textContent += result;
    if (diff == 0) {
        color = "rgb(65, 250, 70)";
        origins.style.background = color;
        originsTrue.remove();
    }
    entry.true_date.textContent += "Photo was taken in " + entry.realDate;
    entry.true_date.style.display = "block";
    noUiSlider.create(entry.date_slider, {
        range: {
            min: 0,
            max: 1000
        },
        behaviour: 'snap',
        connect: [true, false],
        start: [result],
    });
    entry.date_slider.setAttribute('disabled', true);
    const connectionPoints = entry.date_slider.getElementsByClassName('noUi-connect')[0];
    connectionPoints.style.background = color;
    entry.results.style.display = 'block';
    entry.results.style.color = color;
}
const review = document.getElementById("review");
const review_entries = document.getElementById("entries");
const newGame = document.getElementById("newGame");
const pointsFinal = document.getElementById("pointsFinal");
const highScore = document.getElementById("highScore");
if (sessionStorage.getItem("rounds") >= 6 && sessionStorage.getItem("manualRefresh") == "false") {
    review.style.dislpay = "";
    zoom.remove();
    zoom_outer.remove();
    submit.remove();
    pipsSlider.remove();
    pipsSlider2.remove();
    point_imageId.remove();
    total.remove();
    photoQuestion.remove();
    select.remove();
    newGame.style.display = 'block';
    newGame.addEventListener('click', function() {
        sessionStorage.clear();
        roundTitle.textContent = "Round 1 of 5"
        sessionStorage.setItem("rounds", "1");
        sessionStorage.setItem("pointsTotal", "0");
        roundTitle.scrollIntoView({
            block: "start",
            inline: "nearest"
        });
        location.reload();
    });
    roundTitle.textContent = "Game Review"
    roundTitle.style.backgroundColor = "#000000";
    roundTitle.style.margin = "0px auto";
    if ((localStorage.getItem("highScore") == null) || parseInt(localStorage.getItem("highScore")) < parseInt(sessionStorage.getItem("pointsTotal"))) {
        localStorage.setItem("highScore", sessionStorage.getItem("pointsTotal"));
    }
    pointsFinal.textContent = "Final Total: " + sessionStorage.getItem("pointsTotal");
    highScore.textContent = "High Score: " + localStorage.getItem("highScore");
    entries = [];
    for (let round = 1; round <= 5; round++) {
        const entry = makeGameReviewEntry(round, review_entries);
        setupGameReviewEntry(entry);
        setupGameReviewEntryPips(entry);
        entries.push(entry);
    }
    if (sessionStorage.getItem("pointsTotal") == 5000) {
        entries[0].round_elem.textContent = "Touch Grass";
    }
    window.onresize = ()=>{
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            entry.zoom_outer_bounding_box = entry.zoom_outer.getBoundingClientRect();
            reviewConstrainImage(entry);
            reviewSetTransform(entry);
        }
    }
} else {
    review.style.height = "0%";
    review.style.display = "none";
}
