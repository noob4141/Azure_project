async function previewImage() {
    const fileInput = document.getElementById('imageUpload');
    const uploadedImage = document.getElementById('uploadedImage');
    const uploadedImageContainer = document.getElementById('uploadedImageContainer');

    const imageFile = fileInput.files[0];
    const imageUrl = URL.createObjectURL(imageFile);

    uploadedImage.src = imageUrl;
    uploadedImage.style.display = 'block';
    uploadedImageContainer.style.display = 'block';

    // Display image name
    imageName.textContent = 'Image Name: ' + imageFile.name;
    imageName.style.display = 'block';
}

async function uploadImage() {
    const fileInput = document.getElementById('imageUpload');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsList = document.getElementById('results');

    const imageFile = fileInput.files[0];

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        loadingIndicator.style.display = 'block';
        resultsList.innerHTML = ''; // Clear previous results

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        displayResults(data.predictions, data.cosmosResults);

        loadingIndicator.style.display = 'none'; // Hide loading indicator after displaying results
    } catch (error) {
        console.error('Error uploading image:', error);
        displayResults([], []);

        loadingIndicator.style.display = 'none'; // Hide loading indicator in case of an error
    }
}

// Rest of your code remains unchanged...



async function displayResults(predictions, cosmosResults) {
    const resultsList = document.getElementById('results');
    resultsList.innerHTML = '';

    try {
        let predictionsAvailable = false;

        const predictionText = document.createElement('li');
        predictionText.innerHTML = `<strong>Prediction:</strong>`;
        resultsList.appendChild(predictionText);

        if (Array.isArray(predictions) && predictions.length > 0 && Array.isArray(cosmosResults) && cosmosResults.length > 0) {
            predictionsAvailable = true;

            const uniquePredictions = new Set();

            predictions.forEach(prediction => {
                if (!uniquePredictions.has(prediction.tagName)) {
                    uniquePredictions.add(prediction.tagName);

                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<strong>${prediction.tagName}</strong>: ${(prediction.probability * 100).toFixed(2)}%`;
                    resultsList.appendChild(listItem);
                }
            });

            displayPreventionMethods(predictions, cosmosResults);
        }

        if (!predictionsAvailable) {
            const noPredictionsItem = document.createElement('li');
            noPredictionsItem.textContent = 'No predictions available';
            resultsList.appendChild(noPredictionsItem);
        }
    } catch (error) {
        console.error('Error displaying results:', error);
        resultsList.textContent = 'An error occurred while displaying results';
    }
}

function displayPreventionMethods(predictions, cosmosResults) {
    const resultsList = document.getElementById('results');

    predictions.forEach(prediction => {
        const diseaseInfo = cosmosResults.find(result => result.diseaseName === prediction.tagName);

        if (diseaseInfo && diseaseInfo['preventionAndControlMethods']) {
            const methodsHeader = document.createElement('li');
            methodsHeader.innerHTML = `<strong>Prevention and Control Methods for ${prediction.tagName}:</strong>`;
            resultsList.appendChild(methodsHeader);

            const preventionMethods = diseaseInfo['preventionAndControlMethods'];
            preventionMethods.forEach(method => {
                const methodItem = document.createElement('li');
                methodItem.innerHTML = `<em>${method.Method}</em>: ${method.Description}`;
                resultsList.appendChild(methodItem);
            });
        }
    });
}