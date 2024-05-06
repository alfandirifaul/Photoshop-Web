 
function downloadImage(){
    const canvas = document.getElementById("main-canvas");
    const link = document.createElement("a");
    link.download = "color detection.png";

    const dataUrl = canvas.toDataURL();
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function BGRtoHSV(image){
    let imgHSV = new cv.Mat();
    cv.cvtColor(image, imgHSV, cv.COLOR_BGR2HSV);
    return imgHSV;
}

function logTrackbarValue(lowerHue, upperHue, lowerSat, upperSat, lowerVal, upperVal){
    console.log('Lower Hue: ', lowerHue);
    console.log('Upper Hue: ', upperHue);
    console.log('Lower Sat: ', lowerSat);
    console.log('Upper Sat: ', upperSat);
    console.log('Lower Val: ', lowerVal);
    console.log('Upper Val: ', upperVal);
}

function openCVReady(){
    cv["onRuntimeInitialized"] = () => {
        console.log("OpenCV Ready.");

        let imgMain = cv.imread("main-img");
        let imgHSV = BGRtoHSV(imgMain);

        // event listener for trackbar
        const lowerHue = document.getElementById("lower-hue");
        const upperHue = document.getElementById("upper-hue");
        const lowerSat = document.getElementById("lower-sat");
        const upperSat = document.getElementById("upper-sat");
        const lowerVal = document.getElementById("lower-val");
        const upperVal = document.getElementById("upper-val");

        lowerHue.addEventListener("input", updateTrackbarValues);
        upperHue.addEventListener("input", updateTrackbarValues);
        lowerSat.addEventListener("input", updateTrackbarValues);
        upperSat.addEventListener("input", updateTrackbarValues);
        lowerVal.addEventListener("input", updateTrackbarValues);
        upperVal.addEventListener("input", updateTrackbarValues);

        function updateTrackbarValues() {
            // get values from trackbars
            const lowerHueValue = parseInt(lowerHue.value);
            const upperHueValue = parseInt(upperHue.value);
            const lowerSatValue = parseInt(lowerSat.value);
            const upperSatValue = parseInt(upperSat.value);
            const lowerValValue = parseInt(lowerVal.value);
            const upperValueVal = parseInt(upperVal.value);
        
            logTrackbarValue(lowerHueValue, upperHueValue, lowerSatValue, upperSatValue, lowerValValue, upperValueVal);
        
            let lower = new cv.Mat(1, 3, cv.CV_8UC1);
            let upper = new cv.Mat(1, 3, cv.CV_8UC1);
        
            lower.data8S[0] = lowerHueValue;
            lower.data8S[1] = lowerSatValue;
            lower.data8S[2] = lowerValValue;
        
            upper.data8S[0] = upperHueValue;
            upper.data8S[1] = upperSatValue;
            upper.data8S[2] = upperValueVal;
        
            // creating a mask
            let mask = new cv.Mat();
            cv.inRange(imgHSV, lower, upper, mask);

            // apply the mask to original image
            let imgResult = new cv.Mat();
            let cloneImgMain = imgMain.clone();
            cv.bitwise_and(cloneImgMain, cloneImgMain, imgResult, mask);

            cv.imshow("main-canvas", imgResult);

            // Delete the cv.Mat objects after they have been used
            cloneImgMain.delete();
            mask.delete();
            imgResult.delete();
            lower.delete();
            upper.delete();

            // add event listener for download button
            document.getElementById("download-btn").addEventListener("click", downloadImage);
          
        }
    }
}