function opencvReady(){
    cv["onRuntimeInitialized"] = () => {
        console.log("OpenCV Ready."); 

        // read image from the source and convert opencv 
        let imgMain = cv.imread("image-main");

        // convert image to grayscale
        let imgGray = imgMain.clone();
        cv.cvtColor(imgMain, imgGray, cv.COLOR_BGR2GRAY, 0);

        //  add blur 
        let imgBlur = imgMain.clone();
        let ksize = new cv.Size(49, 49);
        cv.GaussianBlur(imgMain, imgBlur, ksize, 0);

        // find edges using canny edge
        let imgCanny = imgMain.clone();
        let lowThreshold = 50;
        let highThreshold = 100;
        cv.Canny(imgMain, imgCanny, lowThreshold, highThreshold);

        cv.imshow("canvas-main", imgCanny);
        imgMain.delete();
        imgGray.delete();
        imgBlur.delete();
        imgCanny.delete();


    }
}
