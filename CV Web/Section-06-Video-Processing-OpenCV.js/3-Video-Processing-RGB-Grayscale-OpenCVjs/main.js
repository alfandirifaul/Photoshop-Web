function openCVReady(){
    cv["onRuntimeInitialized"] = () => {
        console.log("Open CV Ready!");

        let video = document.getElementById("video-main");
        let playPauseBtn = document.getElementById("play-pause-btn");
        let streaming = false;

        let src;
        let dst;
        let gray;
        let cap;

        const FPS = 60;

        playPauseBtn.addEventListener('click', () =>{
            if(streaming){
                console.log('Pause the video');
                video.pause();
                streaming = false;
                start();
            }
            else{
                console.log("Play the video");
                video.play();
                streaming = true;
            }
        });

        function start(){
            console.log('Video processing');

            const width = video.width;
            const height = video.height;
            console.log('Input video width and height', width, height);

            src = new cv.Mat(height, width, cv.CV_8UC4);
            dst = new cv.Mat(height, width, cv.CV_8UC1);
            gray = new cv.Mat();
            cap = new cv.VideoCapture(video);

            console.log('The video is being processed');

            setTimeout(processVideo, 0);
        }

        function processVideo(){
            const begin = Date.now();
            cap.read(src);  
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY);
            cv.imshow("main-canvas", gray);
            console.log('The video is being processed');
            const delay = 1000/FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        }

    }
}

