const BoxSDK = require('box-node-sdk');
const fs = require('fs');
const crypto = require('crypto');
const config = require('./config');

// set up to use client with developer token
let sdk = new BoxSDK({
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET
});

let client = sdk.getBasicClient(config.DEVELOPER_TOKEN);

// grab a file that is = or > 50MB
let stats = fs.statSync(config.FILE_PATH);
let fileContent = fs.readFileSync(config.FILE_PATH);

// file size
let totalSize = stats.size;

function startUpload(options){
    
}

function createSesssion(){
}

// Create the upload session
client.files.createUploadSession(config.FOLDER_ID, totalSize, config.FILE_NAME)
    .then(session => {
        return session;
    }).catch(err => {
        if (err.statusCode === 409) {
            console.log(`Check to see if you have already uploaded file`)
        } else {
            console.log(`Create upload session failed: ${err}`);
        }
    }).then(session => {
        return fileSlicer(session)
    }).then(partsData => {
        return uploadPartsInParallel(partsData)
    }).then(uploadData => {
        debugger;
        uploadData.uploads.then({

        })
    });

let parts = [];

// slice each part from the file
// returns parts, partSize, sessionID
function fileSlicer(session) {
    let sessionID = session.id;
    let partSize = session.part_size;
    console.log(`Part Size: ${partSize}`);
    console.log(`sessionID: ${sessionID}`);
    console.log(`Total Size: ${totalSize}`);
    console.log('---------------------------');

    let position = 0;
    while (position < totalSize) {
        let end = position + partSize;
        let part = fileContent.slice(position, end);
        position = position + partSize;
        let hash = crypto.createHash('sha1').update(part);
        parts.push(part);
    }

    let partsInfo = { parts: parts, partSize: partSize, sessionID: sessionID };

    return partsInfo;
}

// upload parts in parallel
// aggregates the results for each part uploaded.
function uploadPartsInParallel(data) {
    let partsToBeUploaded = data.parts;
    let sessionID = data.sessionID;
    let partSize = data.partSize;
    let maxRetries = 5;
    // map each upload to 
    let uploads = partsToBeUploaded.map(function(part, index) { return uploadPart(part, maxRetries, index * partSize, sessionID) });

    return {
        uploads: Promise.all(uploads).then(
            data => {
                return data;
            }
        ).catch(err => {
            console.log("Upload Cancelled!")
            console.log(`Upload Error: ${err}`);
        }),
        sessionID: sessionID
    }
    // .then(parts => {
    //     return commitUpload(sessionID, parts)
    // })
}

// commit 
function commitUpload(sessionID, parts) {
    let base64EncodedSha1 = crypto.createHash('sha1').update(fileContent).digest('base64')
    let partsToBeCommited = parts.map(function(part) {
        return part.part;
    })
    return client.files.commitUploadSession(sessionID, base64EncodedSha1, { parts: partsToBeCommited })
        .then(response => {
            console.log('Upload commited!')
            console.log(response.entries);
            return response;
        })
        .catch(err => {
            console.log(`Commit failed: ${err}`);
        });
}

function uploadPart(part, retries, offset, sessionID) {
    return client.files.uploadPart(sessionID, part, offset, totalSize)
        .then(part => {
            console.log('Part uploaded!');
            return part
        })
        .catch(err => {
            if (retries > 0) {
                return uploadPart(part, retries - 1, offset)
            } else {
                console.log(`Part Upload Error: ${err}`);
            }
        })
}