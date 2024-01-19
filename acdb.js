const CosmosClient = require('@azure/cosmos').CosmosClient;
const config2 = require('./config2');

const endpoint = config2.endpoint;
const key = config2.key;
const databaseId = config2.database.id;
const containerId = config2.container.id;

const options = {
    endpoint: endpoint,
    key: key,
    userAgentSuffix: 'CosmosDBJavascriptQuickstart'
};

const client = new CosmosClient(options);

// Define the queryDiseaseInfo function
module.exports = async function queryDiseaseInfo(diseaseName) {
    try {
        console.log(`Querying disease information for: ${diseaseName}`);
        const querySpec = {
            query: 'SELECT * FROM c WHERE c.diseaseName = @diseaseName',
            parameters: [
                { name: '@diseaseName', value: diseaseName }
            ]
        };

        const { resources: results } = await client
            .database(databaseId)
            .container(containerId)
            .items.query(querySpec)
            .fetchAll();

        results.forEach(result => {
            console.log(`Disease Information: ${JSON.stringify(result)}`);
        });

        return results;
    } catch (error) {
        console.error('Error querying disease information from Cosmos DB:', error);
        throw error;
    }
}


// // Usage example:
// const diseaseNameToQuery = 'Apple___Black_rot'; // Replace this with the disease name you want to query
// queryDiseaseInfo(diseaseNameToQuery)
//     .then(() => {
//         console.log('Query completed.');
//     })
//     .catch(error => {
//         console.error('Query failed:', error);
//     });
