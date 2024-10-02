function handleVideoInput(event, video){
    const file = event.target.files[0];
    if(file){
        const url = URL.createObjectURL(file);
        video.src = url;
        video.style.display = "block";
    }
}

function openCVReady(){
    cv['onRuntimeInitialized'] = () => {
        console.log('Open CV Ready');

        let video = document.getElementById('main-video');
        let videoInput = document.getElementById('video-input');
        let actionBtn = document.getElementById('action-btn');

        let src, dst, gray, cap, faces, classifier;
        let streaming = false;
        const FPS = 24;

        videoInput.addEventListener('change', (event) => handleVideoInput(event, video));
        actionBtn.addEventListener('click', () => {
            if(!streaming){
                console.log('Video Play');
                video.play();
                streaming = true;
                start();
            }
            else{
                console.log('Video Pause');
                video.pause();
                streaming = false;
            }
        });

        video.addEventListener('ended', () => {
            console.log('Video Ended');
            streaming = false; 
        });

        function start(){
            console.log('Video Processing');
            const width = video.width;
            const height = video.height;
            console.log(width, height);
            src = new cv.Mat(height, width, cv.CV_8UC4);
            dst = new cv.Mat(height, width, cv.CV_8UC1);
            gray = new cv.Mat();
            cap = new cv.VideoCapture(video);
            faces = new cv.RectVector();
            classifier = new cv.CascadeClassifier();
            let utils = new Utils('error message');
            let faceCascadeFile = 'haarcascade_frontalface_default.xml';

            if(!classifier.load(faceCascadeFile)){
                utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
                    classifier.load(faceCascadeFile);
                });
            }
            setTimeout(processVideo, 0);
        }

        function processVideo(){
            if(!streaming){
                console.log('Video Pause or Ended');
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
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

            try{
                classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
            }
            catch(err){
                console.log(err);
            }

            for(let i=0; i<faces.size(); i++){
                let face = faces.get(i);
                let point1 = new cv.Point(face.x, face.y);
                let point2 = new cv.Point((face.x + face.width), (face.y + face.height));
                cv.rectangle(src, point1, point2, [255, 0, 0, 255], 3);
                cv.putText(src, 'Face', point1, cv.FONT_HERSHEY_SIMPLEX, 0.7, [255, 0, 0, 255], 2);

            }
            cv.imshow('main-canvas', src);
            let delay = 1000/FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        }
    }
}