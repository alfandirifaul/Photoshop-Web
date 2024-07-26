function openCVReady(){
    cv['onRuntimeInitialized'] = () => {
        console.log('Open CV Ready.');

        let video = document.getElementById('video-main');
        let actionBtn = document.getElementById('play-pause-btn');
        let streaming = false;

        let dst;
        let src;
        let gray;
        let cap;
        let faces;
        let classifier;

        const FPS = 60;

        actionBtn.addEventListener('click', () => {
            if(streaming){
                console.log('Video Paused');
                video.pause();
                streaming = false;
            }
            else{
                console.log('Video Played');
                video.play();
                streaming = true;
                start();
            }
        });

        video.addEventListener('ended', () => {
            console.log("Video ended");
            streaming = false;
        });

        // start function
        function start(){
            console.log('Video processing');
            
            const width = video.width;
            const height = video.height;

            src = new cv.Mat(height, width, cv.CV_8UC4);
            dst = new cv.Mat(height, width, cv.CV_8UC1);
            gray = new cv.Mat();
            cap = new cv.VideoCapture(video);
            faces = new cv.RectVector();
            classifier = new cv.CascadeClassifier();

            let utils = new Utils('errorMessage');
            let faceCascadeFile = 'haarcascade_frontalface_default.xml';

            if(!classifier.load(faceCascadeFile)){
               utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
                    classifier.load(faceCascadeFile);
               });
            }
            setTimeout(processVideo, 0);
        }

        function processVideo(){
            const begin = Date.now();
            cap.read(src);
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY);

            try{
                classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
            }
            catch(err){
                console.log(err);
            }
            
            for(let i = 0; i < faces.size(); i++){
                let face = faces.get(i);
                let point1 = new cv.Point(face.x, face.y);
                let point2 = new cv.Point((face.x + face.width), (face.y + face.height));
                cv.rectangle(dst, point1, point2, [0, 255, 0, 255], 2);
                cv.putText(dst, "Face", new cv.Point(face.x, face.y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.7, new cv.Scalar(255, 0, 255, 255), 3);            }

            cv.imshow('main-canvas', dst);
            const delay = (1000 / FPS) - (Date.now() - begin);
            setTimeout(processVideo, delay);
        }
    }
}