function opencvReady(){
    cv["onRuntimeInitialized"] = () => {
        console.log("OpenCV Ready."); 

        // read image from the source and convert opencv 
        let imgMain = cv.imread("image-main");
        cv.imshow("canvas-main", imgMain);
        // to free memory allocated
        imgMain.delete();

        // RGB button
        document.getElementById("btn-rgb").onclick = function(){
            console.log("RGB Button Clicked.");
            let imgMain = cv.imread("image-main");
            cv.imshow("canvas-main", imgMain);
            console.log("Convert Image to RGB Successfully.");
            imgMain.delete();
        }

        // Grayscale button
        document.getElementById("btn-grayscale").onclick = () => {
            console.log("Gray Button Clicked.");
            let imgMain = cv.imread("image-main");
            let imgGray = imgMain.clone();
            cv.cvtColor(imgMain, imgGray, cv.COLOR_RGBA2GRAY);
            cv.imshow("canvas-main", imgGray);
            console.log("Convert Image to Grayscale Successfully.");
            imgMain.delete();
            imgGray.delete();
        }

        // Blur button
        document.getElementById("btn-blur").onclick = () => {
            console.log("Blur Button Clicked");
            let imgMain = cv.imread("image-main");
            let imgBlur = imgMain.clone();
            let ksize = new cv.Size(49,49);
            cv.GaussianBlur(imgMain, imgBlur, ksize, 0);
            cv.imshow("canvas-main", imgBlur);
            console.log("Convert Image to Blur Successfully.");
            imgMain.delete();
            imgBlur.delete();
        }

        // Canny button
        document.getElementById("btn-canny").onclick = () => {
            console.log("Canny Button Clicked");
            let imgMain = cv.imread("image-main");
            let imgCanny = imgMain.clone();
            let lowThreshold = 50;
            let highThreshold = 100;
            cv.Canny(imgMain, imgCanny, lowThreshold, highThreshold);
            cv.imshow("canvas-main", imgCanny);
            console.log("Find the Edges of Image Successfully.");
            imgMain.delete();
            imgCanny.delete();
        }
        
    }
}
