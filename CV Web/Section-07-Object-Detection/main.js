    function handleImageInput(event){
    const fileInput = event.target;
    const file = fileInput.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(e){
            const imgMain = document.getElementById("img-main");
            imgMain.src = e.target.result;
            imgMain.onload = function() {
                // Automatically display the image on the canvas once it is loaded
                let imgMainCv = cv.imread(imgMain);
                cv.imshow('main-canvas', imgMainCv);
                imgMainCv.delete(); // Clean up after showing the image
            };
        };
        reader.readAsDataURL(file);
    }
}

function getLabelColor(className){
    if(className === 'person'){
        color = [200, 204, 255, 200];
    }
    else{
        color = [0, 255, 0, 200];
    }
    return color;
}

function drawBoundingBox(predictions, image){
    predictions.forEach(
        prediction => {
            const bbox = prediction.bbox;
            const x  = bbox[0];
            const y = bbox[1];
            const width = bbox[2];
            const height = bbox[3];
            const className = prediction.class;
            const confScore = prediction.score;
            const color = getLabelColor(className);
            console.log(x, y, width, height, className, confScore);
            let point1 = new cv.Point(x, y);
            let point2 = new cv.Point((x + width), (y + height));
            cv.rectangle(image, point1, point2, color, 2);
            const text = `${className} - ${Math.round(confScore*100)/100}`;
            const font = cv.FONT_HERSHEY_TRIPLEX;
            const fontSize = 0.7;
            const thickness = 1;

            // Get size of the text
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const textMetrics = context.measureText(text);
            const twidth = textMetrics.width;
            console.log('Text Width', twidth);
            cv.rectangle(image, new cv.Point(x, (y - 20)), new cv.Point((x + twidth + 125),  y), color, -1);
            cv.putText(image, text, new cv.Point(x, y - 5), font, fontSize, new cv.Scalar(255, 255, 255, 255), thickness);
        }
    )
}

function openCVReady(){
    cv['onRuntimeInitialized'] = () => {
        console.log("OpenCV Ready");

        let imgMain = cv.imread("img-main");
        cv.imshow("main-canvas", imgMain);
        imgMain.delete();

        // Image Input
        document.getElementById('file-upload').addEventListener('change', handleImageInput);

        // RGB Image 
        document.getElementById('rgb-img').onclick = () => {
            console.log('RGB Image Processing');
            let imgMain = cv.imread('img-main');
            cv.imshow('main-canvas', imgMain);
            imgMain.delete();
        }

        // Grayscale Image
        document.getElementById('gray-img').onclick = () => {
            console.log('Grayscale Image Processing');
            let imgMain = cv.imread('img-main');
            let imgGray = new cv.Mat();
            cv.cvtColor(imgMain, imgGray, cv.COLOR_RGBA2GRAY);
            cv.imshow('main-canvas', imgGray);
            imgMain.delete();
            imgGray.delete();
        }

        // Object Detection Image
        document.getElementById('img-detection').onclick = () => {
            console.log('Object Detection Image');
            const image = document.getElementById('img-main');

            // load the model
            console.log('Loading Model');
            cocoSsd.load().then(model => {
                console.log('Model Loaded');
                model.detect(image).then(predictions => {
                    console.log('Predictions', predictions);
                    console.log('Length of Predictions', predictions.length);
                    const imageElement = cv.imread(image);
                    let inputImage = imageElement;
                    // check the any predictions
                    if(predictions.length > 0){
                        drawBoundingBox(predictions, inputImage);
                        cv.imshow('main-canvas', inputImage);  
                        inputImage.delete();
                    }
                    else{
                        cv.imshow('main-canvas', inputImage);
                        inputImage.delete();
                    }
                });
            });
        }

        // Object Detection Video
        document.getElementById('video-detection').onclick = () => {
            console.log('Object Detection Live Webcam Feed');
            const video = document.getElementById('video-main');
            const enableCamBtn = document.getElementById('enable-btn');
            let model = undefined;
            let streaming = false;
            let src, cap;
            const FPS = 24;

            // Browser Feature Detection
            if(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)){
                enableCamBtn.addEventListener('click', () => {
                    if(!streaming){
                        console.log("Streaming Started");
                        enableCam();
                        streaming = true;
                    }
                    else{
                        console.log("Streaming Paused");
                        video.pause();
                        video.srcObject = null;
                        streaming = false;
                    }
                });
            }
            else{
                console.log("getUserMedia is not supported in your browser");
            }

            // Enable Cam Function
            function enableCam(){
                if(!model){
                    return;
                }

                navigator.mediaDevices.getUserMedia({'video': true, 'audio': false}).then(function(stream){
                    video.srcObject = stream;
                    video.addEventListener('loadeddata', predictWebCam);
                });
            }

            setTimeout(function(){
                cocoSsd.load().then(function(loadedModel){
                    model = loadedModel;
                    console.log("Model Loaded");
                });
            }, 0);

            function predictWebCam() {
                const canvas = document.getElementById('main-canvas');
                const context = canvas.getContext('2d');
        
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                    // Draw the video on the canvas
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
                    // Perform object detection using the loaded model
                    model.detect(video).then(predictions => {
                        console.log("Predictions", predictions);
                        let imgMainCv = cv.imread(canvas);
    
                        if (predictions.length > 0) {
                            drawBoundingBox(predictions, imgMainCv);
                        }
        
                        // Display the result
                        cv.imshow('main-canvas', imgMainCv);
                        imgMainCv.delete(); 
        
                        const delay = 1000 / FPS;
                        setTimeout(predictWebCam, delay);
                    }).catch(function(error) {
                        console.log("Error in object detection: " + error);
                    });
                } else {
                    // If the video isn't ready, try again on the next frame
                    requestAnimationFrame(predictWebCam);
                }
            }
        }
    }
} 