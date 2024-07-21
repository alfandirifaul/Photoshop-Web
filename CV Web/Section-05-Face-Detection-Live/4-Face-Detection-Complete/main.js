function openCVReady(){
    cv["onRuntimeInitialized"] = () => {
        console.log("Open CV Ready!");

        // rgb img
        document.getElementById("rgb-img").onclick = () => {
            let imgMain = cv.imread("img-main");
            cv.imshow("main-canvas", imgMain);
            imgMain.delete();
        }

        // grayscale img
        document.getElementById("grayscale-img").onclick = () => {
            let imgMain = cv.imread("img-main");
            let imgGray = new cv.Mat();
            cv.cvtColor(imgMain, imgGray, cv.COLOR_RGBA2GRAY);
            cv.imshow("main-canvas", imgGray);
            imgGray.delete();
            imgMain.delete();
        }

        // faces detection on image
        document.getElementById("face-detection").onclick = () => {
            let imgMain = cv.imread("img-main");
            let imgGray = new cv.Mat();
            cv.cvtColor(imgMain, imgGray, cv.COLOR_RGBA2GRAY);
            let imgClone = imgMain.clone();

            // face detect
            let faceCascadeFile = 'haarcascade_frontalface_default.xml';
            let faceCascade = new cv.CascadeClassifier();
            let utils = new Utils("Error Message");
            if(!faceCascade.load(faceCascadeFile)){
                utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
                    const loaded = faceCascade.load(faceCascadeFile);
                    if(loaded){
                        console.log("XML file loaded successfully.");
                        let faces = new cv.RectVector();
                        faceCascade.detectMultiScale(imgGray, faces, 1.1, 4, 0);

                        for(let i=0; i<faces.size(); i++){
                            let face = faces.get(i);
                            let point1 = new cv.Point(face.x, face.y);
                            let point2 = new cv.Point((face.x + face.width), (face.y + face.height));
                            cv.rectangle(imgClone, point1, point2, [255, 0, 0, 255], 4);
                            cv.putText(imgClone, "Face", new cv.Point(face.x, face.y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.7, new cv.Scalar(255, 0, 0, 255), 2);
                        }
                        cv.imshow("main-canvas", imgClone);
                        imgClone.delete();
                        imgMain.delete();
                        imgGray.delete();
                        faceCascade.delete();
                        faces.delete();
                    }
                    else{
                        console.log("Unable to load the XML file");
                        imgGray.delete();
                        faceCascade.delete();
                        imgClone.delete();
                    }
                });
            }
            else{
                // xml file was loaded
                console.log("XML file already loaded.");
                let faces = new cv.RectVector();
                faceCascade.detectMultiScale(imgGray, faces, 1.1, 4, 0);
                for(let i=0; i<faces.size(); i++){
                    let face = faces.get(i);
                    let point1 = new cv.Point(face.x, face.y);
                    let point2 = new cv.Point((face.x + face.width), (face.y + face.height));
                    cv.rectangle(imgClone, point1, point2, [255, 0, 0, 255], 4);
                    cv.putText(imgClone, "Face", new cv.Point(face.x, face.y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.7, new cv.Scalar(255, 0, 0, 255), 2);
                }
                cv.imshow("main-canvas", imgClone);
                imgClone.delete();
                imgMain.delete();
                imgGray.delete();
                faceCascade.delete();
                faces.delete();
            }
        }

        // face detect with live or realtime
        document.getElementById("face-detection-live").onclick = () => {
            let video = document.getElementById("video-cam");
            const actionBtn = document.getElementById("action-btn");
            let streaming = false;
            let src;
            let dst;
            let stream;
            let classifier;
            let faces;
            let gray;
            let cap;
            let FPS = 50;

            document.getElementById("face-detection-live").onclick = toggleStream;
            function toggleStream(){
                if(streaming){
                    stop();
                    // actionBtn.textContent = 'Start';
                }else{
                    start();
                    // actionBtn.textContent = 'Stop';
                }
            }

            function start(){
                navigator.mediaDevices.getUserMedia({'video':true, 'audio':false})
                .then(function(stream){
                    video.srcObject = stream;
                    video.play();
                })
                .catch(function(err){
                    console.log("An error occured " + err);
                });
                streaming = true;
                src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
                dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
                cap = new cv.VideoCapture(video);
                gray = new cv.Mat();
                faces = new cv.RectVector();
                classifier = new cv.CascadeClassifier();

                let utils = new Utils("Error Message");
                let faceCascadeFile = 'haarcascade_frontalface_default.xml';

                if(!classifier.load(faceCascadeFile)){
                    utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
                        classifier.load(faceCascadeFile);
                    });
                }
                setTimeout(processVideo, 0);
            }

            function stop(){
                if(video){
                    video.pause();
                    video.srcObject = null;
                }
                if(stream){
                    stream.getVideoTracks()[0].stop();
                }
                streaming = false;
            }

            function processVideo(){
                if(!streaming){
                    console.log("streaming stopped");
                    src.delete();
                    dst.delete();
                    gray.delete();
                    faces.delete();
                    classifier.delete();
                    return;
                }
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

                for(let i=0; i<faces.size(); i++){
                    let face = faces.get(i);
                    let point1 = new cv.Point(face.x, face.y);
                    let point2 = new cv.Point((face.x + face.width), (face.y + face.height));
                    cv.rectangle(dst, point1, point2, [255, 0, 0, 255], 4);
                    cv.putText(dst, "Face", new cv.Point(face.x, face.y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.7, new cv.Scalar(255, 0, 0, 255), 2);
                }
                cv.imshow("main-canvas", dst);
                let delay = 1000/FPS - (Date.now() - begin);
                setTimeout(processVideo, delay);
            }
        }
    }   
}