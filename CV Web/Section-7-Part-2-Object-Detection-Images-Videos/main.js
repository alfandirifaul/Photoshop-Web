function getColor(className){
    if(className == 'person'){
        color = [85, 45, 255, 255];
    }
    else{
        color = [85, 255, 45, 255];
    }

    return color;
}

// Draw Bounding Box for Frame
function drawBoundingBox(predictions, image){
    predictions.forEach(prediction => {
        const bbox = prediction.bbox;
        const x = bbox[0];
        const y = bbox[1];
        const width = bbox[2];
        const height = bbox[3];
        const className = prediction.class;
        const confScore = (prediction.score * 100).toFixed(1);
        console.log('Class: ', className, 'Confidence Score: ', confScore,
        'X: ', x, 'Y: ', y, 'Width: ', width, 'Height: ', height);
        
        let point1 = new cv.Point(x, y);
        let point2 = new cv.Point((x + width), (y + height));
        cv.rectangle(image, point1, point2, getColor(className), 2);
        const text = className + "-" + confScore + "%";

        // Create a hidden canvas element to measure the text size
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '22px Arial';

        // Measure of the width of the text
        const tectWidth = context.measureText(text).width;
        cv.rectangle(image, new cv.Point(x, (y - 20)), new cv.Point((x + textWidth + context.lineWidth), y), getColor(className), -1);
        cv.putText(image, text, new cv.Point(x, ( y- 5)), cv.FONT_HERSHEY_TRIPLEX, 0.50, new cv.Scalar(255, 255, 255, 255), 0);
    });
}





function openCVReady(){
    cv['onRuntimeInitialized'] = () => {
        console.log('Open CV Ready.');

        let imgMain = document.getElementById('img-main');
        cv.imshow('main-canvas', imgMain);
        imgMain.delete();

        // Input File
        let fileInput = document.getElementById('file-upload').addEventListener('change', function(event){
            const fileInput = event.target;
            const file = fileInput.files[0];
            if(file){
                const mediaType = file.type.split('/')[0]; // check image or video
                if(mediaType == "image"){
                    handleMediaInput(event, document.getElementById('img-main'));
                }
                else if(mediaType == "video"){
                    handleMediaInput(event, document.getElementById("video-main"));
                }
            }
        });

        // RGB Image
        document.getElementById('rgb-img').onclick = function(){
            console.log("RGB Image");
            let imgMain = document.getElementById('img-main');
            cv.imshow('main-canvas', imgMain);
            imgMain.delete();
        }

        // Grayscale Image
        document.getElementById('gray-img').onclik = function(){
            console.log("Grayscale Image");
            let imgMain = document.getElementById('img-main');
            let imgGray = new cv.Mat();
            cv.cvtColor(imgMain, imgGray, cv.COLOR_RGBA2GRAY);
            cv.imshow('main-canvas', imgGray);
            imgMain.delete();
            imgGray.delete();
        }

        // Object Detection on Image
        document.getELementById('img-detection').onclick = function(){
            console.log('Object Detection on Image');
            const image = cv.imread('img-main');
            const inputImage = cv.imread(image);
            console.log("Input Image Width: ", inputImage.cols, "Input Image Height: ", inputImage.rows);

            // load the model
            cocoSsd.load().then(predictions => {
                model.detect(image).then(predictions => {
                    if(predictions.length > 0){
                        console.log('Predictions: ', predictions);
                        
                    }
                })
            })
        }

    }
}