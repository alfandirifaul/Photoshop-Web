function opencvReady(){
    cv["onRuntimeInitialized"] = () => {
        console.log("OpenCV Ready."); 

        // read image from the source and convert opencv 
        let imgMain = cv.imread("image-main");
        cv.imshow("canvas-main", imgMain);
        console.log("Success show the image.");
        imgMain.delete();
    }
}
