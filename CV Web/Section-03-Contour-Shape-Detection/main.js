function downloadImage(){
    const canvas = document.getElementById("main-canvas");
    const link = document.createElement("a");
    link.download = "photo.jpg"
    const dataUrl = canvas.toDataURL();
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log("Download Image Success");
}

function handleImageUpload(event){
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
        };
        reader.readAsDataURL(file);
    }
    console.log("Image Uploaded");
}

function openCVReady(){
    cv["onRuntimeInitialized"] = () => {
        console.log("OpenCV Ready.");

        // read img
        let imgMain = cv.imread("main-img");
        cv.imshow("main-canvas", imgMain);

        document.getElementById("upload-img").addEventListener("change", handleImageUpload);
        document.getElementById('upload-btn').addEventListener('click', function() {
            document.getElementById('upload-img').click();
        });


        // rgb img
        document.getElementById("rgb-img-btn").onclick = function(){
            console.log("RGB Button Clicked");
            let imgMain = cv.imread("main-img");
            cv.imshow("main-canvas", imgMain);
            imgMain.delete();
        }

        // grayscale img
        document.getElementById("gray-img-btn").onclick = function(){
            console.log("Grayscale Button Clicked")
            let imgMain = cv.imread("main-img");
            let imgGray = new cv.Mat();
            cv.cvtColor(imgMain, imgGray, cv.COLOR_RGBA2GRAY);
            cv.imshow("main-canvas", imgGray);
            imgGray.delete();
            imgMain.delete();
        }

        // canny edges img
        document.getElementById("edge-img-btn").onclick = function(){
            console.log("Canny Button Clicked");
            let imgMain = cv.imread("main-img");
            let imgGray = new cv.Mat();
            cv.cvtColor(imgMain, imgGray, cv.COLOR_RGBA2GRAY);
            let imgCanny = new cv.Mat();
            let lowerThreshold = 100;
            let upperThreshold = 250;
            cv.Canny(imgGray, imgCanny, lowerThreshold, upperThreshold);
            cv.imshow("main-canvas", imgCanny);
            imgMain.delete();
            imgGray.delete();
            imgCanny.delete();
        }

        // contour img
        document.getElementById("contour-img-btn").onclick = function(){
            console.log("Contour Button Clicked");
            let imgMain = cv.imread("main-img");
            let imgGray = new cv.Mat();
            cv.cvtColor(imgMain, imgGray, cv.COLOR_RGBA2GRAY);
            let imgCanny = new cv.Mat();
            let lowerThreshold = 100;
            let upperThreshold = 250;
            cv.Canny(imgGray, imgCanny, lowerThreshold, upperThreshold);
            let contour = new cv.MatVector();
            let hierarchy = new cv.Mat();
            cv.findContours(imgCanny, contour, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
            let length = contour.size();
            console.log("Length area of contour: ", length);
            let cloneImg = imgMain.clone();
            for(let i =0; i<contour.size(); i++){
                cv.drawContours(cloneImg, contour, i, new cv.Scalar(0,255,0,255), 3);
            }
            cv.imshow("main-canvas", cloneImg);
            imgMain.delete();
            imgGray.delete();
            imgCanny.delete();
            contour.delete();
            hierarchy.delete();
            cloneImg.delete();
        }
        
        // shape img
        document.getElementById("shape-img-btn").onclick = function(){
            console.log("Shape Button Clicked");
            let imgMain = cv.imread("main-img");
            let imgGray = new cv.Mat();
            cv.cvtColor(imgMain, imgGray, cv.COLOR_RGBA2GRAY);
            let imgCanny = new cv.Mat();
            let lowerThreshold = 100;
            let upperThreshold = 250;
            cv.Canny(imgGray, imgCanny, lowerThreshold, upperThreshold);
            let contour = new cv.MatVector();
            let hierarchy = new cv.Mat();
            cv.findContours(imgCanny, contour, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
            let length = contour.size();
            console.log("Length area of contour: ", length);
            let cloneImg = imgMain.clone();
        
            for(let i =0; i<length; i++){
                let cnt = contour.get(i);
                cv.drawContours(cloneImg, contour, i, new cv.Scalar(0,255,0,255), 2);
                let area = cv.contourArea(cnt);
                console.log("Area of the Contour: ", area);
                let perimeter = cv.arcLength(cnt, true);
                console.log("Perimeter of the Contour: ", perimeter);
                let epsilon = 0.02 * perimeter;
                let approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, epsilon, true);
                let cornerPointLength = approx.size().height;
                console.log("Length of Corner Point: ", cornerPointLength);
                let rectangle = cv.boundingRect(approx);
                cv.rectangle(cloneImg, new cv.Point(rectangle.x, rectangle.y), new cv.Point((rectangle.x + rectangle.width), (rectangle.y + rectangle.height)),
                new cv.Scalar(255, 0, 255, 255), 1);

                // shape det
                let shape = "unidentified"
                if(cornerPointLength == 4){
                    let aspectRatio = rectangle.width/rectangle.height;
                    if(aspectRatio > 0.95 && aspectRatio < 1.38){
                        shape = "Square";
                    } else{
                        shape = "Rectangle";
                    }
                }
                else if(cornerPointLength == 3){
                    shape = "Triangle";
                }
                else if(cornerPointLength > 4){
                    shape = "Circle";
                }
                else{
                    shape = "None";
                }

                cv.putText(cloneImg, shape, new cv.Point((rectangle.x + (rectangle.width/2)), (rectangle.y + (rectangle.height/2))),
                                cv.FONT_HERSHEY_SIMPLEX, 0.7, new cv.Scalar(0,0,0,255), 2);
                approx.delete();
            }
            
            cv.imshow("main-canvas", cloneImg);
            imgMain.delete();
            imgGray.delete();
            imgCanny.delete();
            contour.delete();
            hierarchy.delete();
            cloneImg.delete();
        }

        document.getElementById("download-btn").addEventListener("click", downloadImage);
    }
}