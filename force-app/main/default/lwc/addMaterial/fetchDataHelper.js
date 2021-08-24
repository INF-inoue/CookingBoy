const recordMetadata = {
    name: 'name',
    MaterialClassification__c: 'Class',
};

export default function fetchDataHelper({ amountOfRecords }) {
    return fetch('https://data-faker.herokuapp.com/Material__c', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
            amountOfRecords,
            recordMetadata,
        }),
    }).then((response) => response.json());
}