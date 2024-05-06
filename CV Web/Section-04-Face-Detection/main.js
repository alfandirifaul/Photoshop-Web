function uploadFileHandle(event){
    console.log("Upload Image Button Clicked");
    const fileInput = event.target;
    const file = fileInput.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(e){
            const img = document.getElementById("main-img");
            img.onload = function(){
                let imgMain = cv.imread(img);
                cv.imshow("main-canvas", imgMain);
                imgMain.delete();
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
    console.log("Image Uploaded");
}

function downloadImage(){
    console.log("Download Image Button Clicked");
    const canvas = document.getElementById("main-canvas");
    const link = document.createElement("a");
    link.download = "img face detection.jpg";
    const dataUrl = canvas.toDataURL();
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log("Download Image Success");
}

function openCVready(){
    cv["onRuntimeInitialized"] = () => {
        console.log("OpenCV Ready.");

        // read img
        let imgMain = cv.imread("main-img");
        cv.imshow("main-canvas", imgMain);

       // img handler function
       document.getElementById("upload-img-input").addEventListener("change", uploadFileHandle);
       document.getElementById("upload-img").addEventListener("click", function(){
           document.getElementById("upload-img-input").click();
       });

        // rgb img
        document.getElementById("rgb-btn").onclick = () => {
            console.log("RGB Button Clicked");
            let imgMain = cv.imread("main-img");
            cv.imshow("main-canvas", imgMain);
            imgMain.delete();
        }

        // grayscale img
        document.getElementById("gray-btn").onclick = () => {
            console.log("Grayscale Button Clicked");
            let imgMain = cv.imread("main-img");
            let imgGray = new cv.Mat();
            cv.cvtColor(imgMain, imgGray, cv.COLOR_RGBA2GRAY);
            cv.imshow("main-canvas", imgGray);
            imgMain.delete();
            imgGray.delete();
        }

        // face detection
        document.getElementById("face-btn").onclick = () => {
            console.log("Face Detection Processing");
            let imgMain = cv.imread("main-img");
            let imgClone = imgMain.clone();
            let imgGray = new cv.Mat();
            cv.cvtColor(imgMain, imgGray, cv.COLOR_RGBA2GRAY);
            
            // load file
            let faceCascade = new cv.CascadeClassifier();
            let faceCascadeFile = 'haarcascade_frontalface_default.xml';
            let utils = new Utils("Error Message");
            // 
            if(!faceCascade.load(faceCascadeFile)){
                utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
                    const loaded = faceCascade.load(faceCascadeFile);
                    if(loaded){
                        console.log("XML File Loaded Successfully.");
                        let faces = new cv.RectVector();
                        faceCascade.detectMultiScale(imgGray, faces, 1.1, 4, 0);
                        for(let i = 0; i < faces.size(); i++){
                            let face = faces.get(i);
                            let point1 = new cv.Point(face.x, face.y);
                            let point2 = new cv.Point((face.x + face.width), (face.y + face.height));
                            cv.rectangle(imgClone, point1, point2, [0,255,0,255], 4);
                            cv.putText(imgClone, "Face", new cv.Point(face.x, face.y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.7, new cv.Scalar(255, 255, 255, 255), 2)  
                        }
                        cv.imshow("main-canvas", imgClone);
                        imgMain.delete();
                        imgClone.delete();
                        imgGray.delete();
                        faces.delete();
                    }
                    else{
                        console.log("Unable to Load XML File");
                        imgMain.delete();
                        imgClone.delete();
                        imgGray.delete();
                        faceCascade.delete()
                    }
                });
            }
            else{
                // proceed with loaded file
                console.log("XML File Already Loaded.");
                let faces = new cv.RectVector();
                faceCascade.detectMultiScale(imgGray, faces, 1.1, 4, 0);
                for(let i = 0; i < faces.size(); i++){
                    let face = faces.get(i);
                    let point1 = new cv.Point(face.x, face.y);
                    let point2 = new cv.Point((face.x + face.width), (face.y + face.height));
                    cv.rectangle(imgClone, point1, point2, [0,255,0,255], 4);
                    cv.putText(imgClone, "Face", new cv.Point(face.x, face.y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.7, new cv.Scalar(255, 255, 255, 255), 2);
                }

            }
        }
        document.getElementById("download-img").addEventListener("click", downloadImage);
    }
}