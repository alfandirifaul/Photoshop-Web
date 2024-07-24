    function openCVReady(){
        cv["onRuntimeInitialized"] = () => {
            console.log("Open CV Ready.");

            let video = document.getElementById("video-main");
            video.controls = true;
        }
    }