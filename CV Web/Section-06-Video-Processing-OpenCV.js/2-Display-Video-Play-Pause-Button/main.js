function openCVReady(){
    cv["onRuntimeInitialized"] = () => {
        console.log("Open CV Ready!");

        let video = document.getElementById("video-main");
        let playPauseBtn = document.getElementById("play-pause-btn");
        let streaming = false;

        playPauseBtn.addEventListener('click', () =>{
            if(streaming){
                console.log('Pause the video');
                video.pause();
                streaming = false;
            }
            else{
                console.log("Play the video");
                video.play();
                streaming = true;
            }
        });

      

    }
}