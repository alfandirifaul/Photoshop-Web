function handleVideo(event, video){
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        video.src = url;
        video.style.display = "block";
    }
}
function openCVready() {
    cv["onRuntimeInitialized"] = () => {
        console.log('Open CV Ready');

        let video = document.getElementById('main-video');
        let inputVideo = document.getElementById('input-video');
        let actionBtn = document.getElementById('action-btn');

        if (!video) {
            console.error('Element with ID "video-main" not found.');
            return;
        }
        if (!inputVideo) {
            console.error('Element with ID "input-video" not found.');
            return;
        }
        if (!actionBtn) {
            console.error('Element with ID "action-btn" not found.');
            return;
        }

        inputVideo.addEventListener('change', (event) => handleVideo(event, video));
        let streaming = false;
        const FPS = 60;

        let dst, src, gray, cap, faces, classifier;

        actionBtn.addEventListener('click', () => {
            if (!streaming) {
                console.log('Video Played');
                video.play();
                streaming = true;
                start();
            } else {
                console.log('Video Paused');
                video.pause();
                streaming = false;
            }
        });

        video.addEventListener('ended', () => {
            console.log('Video Ended');
            streaming = false;
        });

        function start() {
            console.log('Video Processing');
            const width = video.width;
            const height = video.height;
            console.log(width, height);

            src = new cv.Mat(height, width, cv.CV_8UC4);
            dst = new cv.Mat(height, width, cv.CV_8UC1);
            gray = new cv.Mat(height, width, cv.CV_8UC1);
            cap = new cv.VideoCapture(video);
            faces = new cv.RectVector();
            classifier = new cv.CascadeClassifier();

            let utils = new Utils('errorMessage');
            let faceCascadeFile = 'haarcascade_frontalface_default.xml';

            if (!classifier.load(faceCascadeFile)) {
                utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
                    classifier.load(faceCascadeFile);
                });
            }

            setTimeout(processVideo, 0);
        }

        function processVideo() {
            let begin = Date.now();
            cap.read(src);
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY);

            try {
                classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
            } catch (err) {
                console.log(err);
            }

            for (let i = 0; i < faces.size(); i++) {
                let face = faces.get(i);
                let point1 = new cv.Point(face.x, face.y);
                let point2 = new cv.Point(face.x + face.width, face.y + face.height);
                cv.rectangle(dst, point1, point2, [255, 0, 0, 255], 2);
                cv.putText(dst, 'Face', new cv.Point(face.x, face.y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.5, [255, 0, 0, 255]);
            }

            cv.imshow('main-canvas', dst);
            const delay = 1000 / FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        }
    }
}