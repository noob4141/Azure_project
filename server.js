const express = require('express');
const multer = require('multer');
const path = require('path');
const PredictionApi = require("@azure/cognitiveservices-customvision-prediction");
const msRest = require("@azure/ms-rest-js");

// Import the queryDiseaseInfo function
const queryDiseaseInfo = require('./acdb');

const app = express();
const port = 8080;

app.use(express.static('public'));

const config = require('./config.json');
const predictionKey = config.VISION_PREDICTION_KEY;
const predictionResourceId = config.VISION_PREDICTION_RESOURCE_ID;
const predictionEndpoint = config.VISION_PREDICTION_ENDPOINT;
const publishIterationName = config.publishIterationName;

const predictor_credentials = new msRest.ApiKeyCredentials({ inHeader: { "Prediction-key": predictionKey } });
const predictor = new PredictionApi.PredictionAPIClient(predictor_credentials, predictionEndpoint);

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage }).single('image');

app.get('/', (req, res) => {
    res.redirect('/Home_page/index.html');
});

app.get('/Home_page/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home_page', 'index.html'));
});

app.post('/upload', upload, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const testFile = req.file.buffer;
        const results = await predictor.classifyImage(config.projectId, publishIterationName, testFile);
        
        // Filter predictions with confidence greater than 1%
        const threshold = 1; // Confidence threshold in percentage
        const filteredPredictions = results.predictions.filter(prediction => prediction.probability > threshold / 100);

        // Assuming predictions are sorted by probability, get the disease name with the highest confidence
        if (filteredPredictions.length > 0) {
            const highestPrediction = filteredPredictions[0]; // Assuming the first one has the highest probability
            const diseaseNameToQuery = highestPrediction.tagName; // Assuming the tag name corresponds to disease name

            // Now, integrate the Cosmos DB query function here
            try {
                const cosmosResults = await queryDiseaseInfo(diseaseNameToQuery);
                res.json({ predictions: filteredPredictions, cosmosResults });
            } catch (cosmosError) {
                console.error('Error querying Cosmos DB:', cosmosError);
                res.status(500).json({ error: 'An error occurred querying Cosmos DB' });
            }
        } else {
            res.status(404).json({ error: 'No predictions above threshold' });
        }
    } catch (error) {
        console.error('Error processing image upload:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
