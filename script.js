const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const photo = document.getElementById("photo");
const countdown = document.getElementById("countdown");

const startCamera = document.getElementById("startCamera");
const takePhoto = document.getElementById("takePhoto");
const retakePhoto = document.getElementById("retakePhoto");

const downloadPhoto = document.getElementById("downloadPhoto");
const downloadStrip = document.getElementById("downloadStrip");

const filter = document.getElementById("filter");
const strip = document.getElementById("strip");
const photoCount = document.getElementById("photoCount");

let stream = null;
let photos = [];
let currentPhoto = null;


// FILTERS
function getFilter(value) {
    if (value === "vintage") {
        return "sepia(0.5) contrast(1.1)";
    }

    if (value === "bw") {
        return "grayscale(1)";
    }

    if (value === "sepia") {
        return "sepia(1)";
    }

    if (value === "warm") {
        return "saturate(1.5) sepia(0.25)";
    }

    if (value === "cool") {
        return "hue-rotate(15deg) saturate(0.8)";
    }

    return "none";
}


// CHANGE FILTER
filter.addEventListener("change", function () {
    camera.style.filter = getFilter(filter.value);
});


// OPEN CAMERA
startCamera.addEventListener("click", async function () {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            },
            audio: false
        });

        camera.srcObject = stream;

        camera.style.display = "block";
        photo.style.display = "none";

        camera.style.filter = getFilter(filter.value);

        await camera.play();

    } catch (error) {
        alert("Camera open nahi ho raha. Please camera permission allow karo.");
        console.log(error);
    }
});


// TAKE PHOTO WITH 3 SECOND COUNTDOWN
takePhoto.addEventListener("click", async function () {

    if (!stream || camera.videoWidth === 0) {
        alert("Please open camera first!");
        return;
    }

    if (photos.length >= 4) {
        alert("All 4 photos are completed!");
        return;
    }

    takePhoto.disabled = true;

    countdown.style.display = "block";

    for (let i = 3; i >= 1; i--) {
        countdown.textContent = i;

        await new Promise(function (resolve) {
            setTimeout(resolve, 1000);
        });
    }

    countdown.textContent = "";

    await new Promise(function (resolve) {
        setTimeout(resolve, 300);
    });

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    const context = canvas.getContext("2d");

    context.save();

    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    context.filter = getFilter(filter.value);

    context.drawImage(
        camera,
        0,
        0,
        canvas.width,
        canvas.height
    );

    context.restore();

    currentPhoto = canvas.toDataURL("image/png");

    photos.push(currentPhoto);

    updateStrip();

    countdown.style.display = "none";
    takePhoto.disabled = false;
});


// UPDATE PHOTO STRIP
function updateStrip() {

    const boxes = document.querySelectorAll(".strip-photo");

    boxes.forEach(function (box, index) {

        if (photos[index]) {
            box.innerHTML = "";

            const img = document.createElement("img");

            img.src = photos[index];

            box.appendChild(img);

        } else {
            box.innerHTML = "0" + (index + 1);
        }

    });

    photoCount.textContent = photos.length + " / 4 PHOTOS";
}


// RETAKE LAST PHOTO
retakePhoto.addEventListener("click", function () {

    if (photos.length === 0) {
        alert("No photo to retake!");
        return;
    }

    photos.pop();

    currentPhoto = photos.length > 0
        ? photos[photos.length - 1]
        : null;

    updateStrip();

    camera.style.display = "block";
    photo.style.display = "none";

    countdown.style.display = "none";
});


// DOWNLOAD SINGLE PHOTO
downloadPhoto.addEventListener("click", function () {

    if (!currentPhoto) {
        alert("Please take a photo first!");
        return;
    }

    const link = document.createElement("a");

    link.href = currentPhoto;
    link.download = "Ifraa-Photo.png";

    link.click();
});


// DOWNLOAD PHOTO STRIP
downloadStrip.addEventListener("click", function () {

    if (photos.length !== 4) {
        alert("Please complete all 4 photos first!");
        return;
    }

    const stripCanvas = document.createElement("canvas");

    stripCanvas.width = 600;
    stripCanvas.height = 1900;

    const context = stripCanvas.getContext("2d");

    context.fillStyle = "#f5ead8";
    context.fillRect(0, 0, 600, 1900);

    let loaded = 0;

    photos.forEach(function (photoData, index) {

        const img = new Image();

        img.onload = function () {

            context.drawImage(
                img,
                40,
                40 + index * 450,
                520,
                390
            );

            loaded++;

            if (loaded === 4) {

                context.fillStyle = "#641b2b";
                context.font = "bold 28px Georgia";
                context.textAlign = "center";

                context.fillText(
                    "BY IFRAA STUDIO",
                    300,
                    1850
                );

                const link = document.createElement("a");

                link.download = "Ifraa-Photo-Strip.png";
                link.href = stripCanvas.toDataURL("image/png");

                link.click();
            }
        };

        img.src = photoData;

    });

});