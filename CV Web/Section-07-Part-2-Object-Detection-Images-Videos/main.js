



function computeColorForLabels(className) {
    if (className == 'person') {
        color = [85, 45, 255, 255];
    } else {
        color = [255, 111, 111, 125];
    }
    return color;
}

function drawBoundingBox(predictions, inputImage) {
    predictions.forEach(prediction => {
        const bbox = prediction.bbox;
        const x = bbox[0];
        const y = bbox[1];
        const width = bbox[2];
        const height = bbox[3];
        const className = prediction.class;
        const confScore = (prediction.score * 100).toFixed(1);
        console.log(x, y, width, height, className, confScore);

        let point1 = new cv.Point(x, y);
        let point2 = new cv.Point((x + width), (y + height));
        cv.rectangle(inputImage, point1, point2, computeColorForLabels(className), 4);

        const text = className + "-" + confScore + "%";
        const canvas = document.createElement("canvas");
        const context = canvas.getContext('2d');
        context.font = "22px Arial";
        const textWidth = context.measureText(text).width;
        cv.rectangle(inputImage, new cv.Point(x, (y - 20)), new cv.Point(x + textWidth + context.lineWidth, y), computeColorForLabels(className), -1);
        cv.putText(inputImage, text, new cv.Point(x, (y - 5)), cv.FONT_HERSHEY_TRIPLEX, 0.50, new cv.Scalar(255, 255, 255, 255), 0.50)
    });
}

function drawBoundingBoxVideo(predictions, src, inputVideoWidth, inputVideoHeight, outputVideoWidth, outputVideoHeight) {
    predictions.forEach(prediction => {
        const bbox = prediction.bbox;
        const x = bbox[0];
        const y = bbox[1];
        const width = bbox[2];
        const height = bbox[3];
        const className = prediction.class;
        const confScore = (prediction.score * 100).toFixed(1);

        const scaleX = outputVideoWidth / inputVideoWidth;
        const scaleY = outputVideoHeight / inputVideoHeight;
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaleWidth = width * scaleX;
        const scaleHeight = height * scaleY;
        console.log('Scaled Values: ', scaledX, scaledY, scaleWidth, scaleHeight);

        let point1 = new cv.Point(scaledX, scaledY);
        let point2 = new cv.Point((scaledX + scaleWidth), (scaledY + scaleHeight));
        cv.rectangle(src, point1, point2, computeColorForLabels(className), 4);

        const text = className + '-' + confScore + "%";
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = "22px Arial";
        const textWidth = context.measureText(text).width;

        // Fix the cv.rectangle to draw the background for the text
        cv.rectangle(src, new cv.Point(scaledX, scaledY - 20), new cv.Point(scaledX + textWidth + 10, scaledY), computeColorForLabels(className), cv.FILLED);

        // Correct usage of cv.putText
        cv.putText(src, text, new cv.Point(scaledX, scaledY - 5), cv.FONT_HERSHEY_TRIPLEX, 0.50, new cv.Scalar(255, 255, 255, 255), 1);
    });
}

function handleInputMedia(event, mediaElement) {
    const file = event.target.files[0];
    const canvas = document.getElementById('main-canvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    // context.clearRect(0, 0, canvas.width, canvas.height);

    if (mediaElement.tagName.toLowerCase() === "img") {
        const reader = new FileReader();
        reader.onload = function (e) {
            mediaElement.src = e.target.result;

            // Ensure the image is fully loaded before rendering to canvas
            mediaElement.onloaded = function() {
                const imgMain = cv.imread(mediaElement); // Read the image
                cv.imshow('main-canvas', imgMain); // Show on canvas
                imgMain.delete();  // Cleanup
            };
        };
        reader.readAsDataURL(file);
        console.log("Image Uploaded");

    }
    else if (mediaElement.tagName.toLowerCase() === 'video') {
        const url = URL.createObjectURL(file);
        mediaElement.src = url;

        mediaElement.onloadeddata = function () {
            // Ensure the video has valid width and height before drawing
            if (mediaElement.videoWidth > 0 && mediaElement.videoHeight > 0) {
                console.log("Video width:", mediaElement.videoWidth, "Video height:", mediaElement.videoHeight);

                // Adjust canvas size based on video aspect ratio
                canvas.width = mediaElement.videoWidth;
                canvas.height = mediaElement.videoHeight;

                // Ensure the video is ready to be played, wait for the first frame
                requestAnimationFrame(function drawFirstFrame() {
                    if (mediaElement.readyState >= 2) {
                        // Draw the first frame of the video onto the canvas
                        context.drawImage(mediaElement, 0, 0, canvas.width, canvas.height);
                        console.log("First frame drawn on canvas.");
                    } else {
                        // Keep waiting until the video is ready
                        console.log("Video not ready yet, waiting...");
                        requestAnimationFrame(drawFirstFrame);
                    }
                });

                mediaElement.pause(); // Pause immediately after to stop playback
            } else {
                console.error("Video dimensions not valid.");
            }
        };
    }
}

function clearCanvas(){
    const canvas = document.getElementById('main-canvas');
    const context = canvas.getContext('2d');
//     clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function openCVReady() {
    cv['onRuntimeInitialized'] = () => {
        console.log('Open CV Ready!');

        let imgMain = cv.imread('img-main');
        console.log('Image is ready to showed.');
        cv.imshow("main-canvas", imgMain);
        imgMain.delete();

        // Event Listener for File Input
        document.getElementById("file-upload").addEventListener('change', function (event) {
            const file = event.target.files[0];

            if (file) {
                const mediaType = file.type.split("/")[0];

                // clear the canvas first
                clearCanvas();

                if (mediaType === "image") {
                    console.log("Image Uploaded");
                    handleInputMedia(event, document.getElementById("img-main"));
                    clearCanvas();

                    // Hide the video and ensure image is available
                    document.getElementById('video-main').style.display = "none";
                    document.getElementById('img-main').style.display = "block";
                    console.log("Image Detection");
                }
                else if (mediaType === "video") {
                    console.log("Video Uploaded");
                    handleInputMedia(event, document.getElementById("video-main"));
                    clearCanvas();

                    // Hide the image and ensure video is available
                    document.getElementById('video-main').style.display = "block";
                    document.getElementById('img-main').style.display = "none";
                    console.log("Video Detection");
                }
            }
        });

        // RGB Image
        document.getElementById("rgb-img").onclick = function () {
            console.log("RGB Processing");
            let imgMain = cv.imread('img-main');
            cv.imshow('main-canvas', imgMain);
            imgMain.delete();
        }

        // Grayscale Image
        document.getElementById('gray-img').onclick = function () {
            console.log('Grayscale Processing');
            let imgMain = cv.imread('img-main');
            let imgGray = new cv.Mat();
            cv.cvtColor(imgMain, imgGray, cv.COLOR_RGBA2GRAY);
            cv.imshow('main-canvas', imgGray);
            imgMain.delete();
            imgGray.delete();
        }

        // Object Detection on Image
        document.getElementById('img-detection').onclick = function () {
            console.log('Object Detection Image');
            const imageElement = document.getElementById('img-main');

            // Check if the image is loaded and has valid dimensions
            if (imageElement && imageElement.width > 0 && imageElement.height > 0) {
                const image = cv.imread(imageElement);
                console.log('Image width: ', image.cols, 'Image height: ', image.rows);

                // Load COCO-SSD
                cocoSsd.load().then(model => {
                    model.detect(imageElement).then(predictions => {
                        console.log('Predictions: ', predictions);
                        if (predictions.length > 0) {
                            drawBoundingBox(predictions, image);
                            cv.imshow('main-canvas', image);
                        } else {
                            console.log('No Object Detection');
                            cv.imshow('main-canvas', image);
                        }
                    });
                });
            } else {
                console.error('Image not loaded or invalid dimensions');
            }
        };

        // Object Detection on Video
        document.getElementById('video-detection').onclick = function () {
            console.log("Object Detection Video");
            const video = document.getElementById('video-main');
            const actionBtn = document.getElementById('enable-btn');
            let model = undefined;
            let streaming = false;
            let src, cap;
            const FPS = 24;

            const canvas = document.getElementById('main-canvas');
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            actionBtn.addEventListener('click', function () {
                if (!streaming) {
                    console.log("Streaming Started");
                    video.play();
                    enableVideo();
                    streaming = true;
                } else {
                    console.log("Streaming Stopped");
                    video.pause();
                    streaming = false;
                }
            });

            video.addEventListener('ended', function () {
                console.log('Video Ended');
                streaming = false;
            });

            function enableVideo() {
                if (!model) {
                    return;
                }
                setTimeout(predictWebCam, 0);
            }

            setTimeout(function () {
                cocoSsd.load().then(function (loadedModel) {
                    model = loadedModel;
                    console.log("Model Loaded");
                    alert('COCO-SSD Model Loaded');
                });
            }, 0);

            function predictWebCam() {
                if (!streaming) {
                    src.delete();
                    return;
                }

                const canvas = document.getElementById('main-canvas');
                const context = canvas.getContext('2d');

                if (video.videoWidth > 0 && video.videoHeight > 0) {
                    const begin = Date.now();
                    console.log("Original Video Width: ", video.videoWidth, "Original Video Height: ", video.videoHeight);

                    context.drawImage(canvas, 0, 0, video.width, video.height);

                    if(!src){
                        src = new cv.Mat(video.videoWidth, video.videoHeight, cv.CV_8UC4);
                    }
                    src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
                    console.log("Video Width Defined: ", video.width, "Video Height Defined: ", video.height);

                    cap = new cv.VideoCapture(video);
                    cap.read(src);

                    model.detect(video).then(function (predictions) {
                        console.log("Predictions: ", predictions);
                        if (predictions.length > 0) {
                            drawBoundingBoxVideo(predictions, src, video.videoWidth, video.videoHeight, video.width, video.height);
                            cv.imshow('main-canvas', src);
                            const delay = (FPS / 100) - (Date.now() - begin);
                            setTimeout(predictWebCam, delay);
                        }
                        else {
                            cv.imshow('main-canvas', src);
                            const delay = (FPS / 100) - (Date.now() - begin);
                            setTimeout(predictWebCam, delay);
                        }
                    });
                }
                else {
                    window.requestAnimationFrame(predictWebCam);
                }
            }
        }
    }
}