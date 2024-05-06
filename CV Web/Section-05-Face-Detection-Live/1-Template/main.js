function openCVReady(){
    cv["onRuntimeInitialized"] = () => {
        console.log("Open CV Ready.");
        let video = document.getElementById("video-cam");
        // use web rtc get media stream
        navigator.mediaDevices.getUserMedia({'video': true, 'audio': false})
        .then(function(stream){
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err){
            console.log("An error occurred: " + err);
        });

        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        let cap = new cv.VideoCapture(video);
        let gray = new cv.Mat();
        let faces = new cv.RectVector();
        let classifier = new cv.CascadeClassifier();
        let utils = new Utils('errorMessage');
        let faceCascadeFile = 'haarcascade_frontalface_default.xml';
        if(!classifier.load(faceCascadeFile)){
            utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
                classifier.load(faceCascadeFile);
            });
        }
        const FPS = 24;
        function processVideo(){
            // Date.now() returns the number of milliseconds
            // begin is the timestamp at the start of processing the current frame
            let begin = Date.now();
            cap.read(src);
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY);
            try{
                classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
                console.log(faces.size());
            }
            catch(err){
                console.log(err);
            }
            for(let i = 0; i < faces.size(); i++){
                let face = faces.get(i);
                let point1 = new cv.Point(face.x , face.y);
                let point2 = new cv.Point((face.x + face.width), (face.y + face.height));
                cv.rectangle(dst, point1, point2, [255,0,0,255], 2);
                cv.putText(dst, "Face", new cv.Point(face.x, face.y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.7, [255,255,255,255], 2);
            }
            cv.imshow("main-canvas", dst);
            // schedule the next one is 1000/24 = 41.67 miliseconds
            let delay = 1000/FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        }
        setTimeout(processVideo, 0);
    }
}