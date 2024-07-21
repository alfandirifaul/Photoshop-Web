function openCVReady(){
    cv["onRuntimeInitialized"] = () => {
        console.log("Open CV Ready!");

        let video = document.getElementById('videocam');
        const actionButton = document.getElementById('action-btn');
        let streaming = false;
        let src;
        let dst;
        let faces;
        let gray;
        let cap;
        let classifier;
        let stream;
        const FPS = 50;

        actionButton.addEventListener('click', () => {
            if(streaming){
                stop();
                actionButton.textContent = 'Start';
            }else{
                start();
                actionButton.textContent = 'Stop';
            }
        });

        function start(){
            // use webRTC to gwt the media stream
            navigator.mediaDevices.getUserMedia({'video':true, 'audio':false})
            .then(function(stream){
                video.srcObject = stream;
                video.play();
            })
            .catch(function(err){
                console.log("An error occured!" + err);
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
                if (!streaming){
                    console.log("Streaming Stopped");
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
                    cv.putText(dst,"Face", new cv.Point(face.x, (face.y - 10)), cv.FONT_HERSHEY_SIMPLEX, 0.7, new cv.Scalar(255, 255, 255, 255), 2);
                }
                cv.imshow('main-canvas', dst);
                let delay = 1000/FPS - (Date.now - begin);
                setTimeout(processVideo, delay)
        }
    }
}


