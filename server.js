// const express = require('express');
// const cors = require('cors');
// const app = express();
// const path = require('path');
// const ytdl = require('ytdl-core');
// const fs = require('fs');
// app.use(cors());
// app.use(express.json());


// // const api = "AIzaSyBIVuBEKwDYGN8JPVJIHyHhjmJnFSyBgbc";
// // const pId = "PLeQGRdO33VBna7UjWMILAD-Ufoot_wmYv";
// // const video = "https://www.youtube.com/watch?v=";
// // const l = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=25&playlistId=${pId}&key=${api}`;

// const z = "Youtube Playlist Downloader!";
// let link = ""
// const downloadedVideos = new Set();

// function transform(url) {
//     const idx = url.indexof("=")
//     const len = url.length
//     console.log(url.slice(idx, len))
// }

// function sanitizeFileName(fileName) {
//     return fileName.replace(/[\/\?<>\\:\*\|"]/g, "_");
// }

// app.post('/submitUrl', async (req, res) => {
//     try {
//         const { url } = req.body;
//         link = url
//         console.log('Received URL from frontend:', link);
//         const idx = link.indexOf('=')
//         const pId = url.slice(idx + 1, url.length)
//         // const pId = "PLeQGRdO33VBna7UjWMILAD-Ufoot_wmYv";
//         const api = "AIzaSyBIVuBEKwDYGN8JPVJIHyHhjmJnFSyBgbc";
//         const l = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=25&playlistId=${pId}&key=${api}`;
//         downloader(l);
//         console.log("Download completed!")
//         res.json({ message: 'URL received successfully!' });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// app.get('/message', (req, res) => {
//     res.json({ message: z });
// });

// app.listen(8000, () => {
//     console.log(`Server is running on port 8000.`);
// });


// function downloader(l) {
//     const downloadPath = "C:/Users/Srivathsav S/Desktop/Code/Extension/Downloads";
//     fetch(l)
//         .then((data) => {
//             return data.json();
//         }).then((completedData) => {
//             completedData.items.map(
//                 (e) => {
//                     const videoId = e.snippet.resourceId.videoId;

//                     if (!downloadedVideos.has(videoId)) {
//                         ytdl.getInfo(videoId)
//                             .then((info) => {
//                                 // Choose a format with the desired audio quality and format (e.g., MP3)
//                                 const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

//                                 if (!format) {
//                                     console.error('No valid audio format found');
//                                     return;
//                                 }

//                                 const fixedTitle = sanitizeFileName(info.videoDetails.title)
//                                 const outputFilePath = path.join(downloadPath, `${fixedTitle}.mp3`);
//                                 const outputStream = fs.createWriteStream(outputFilePath);

//                                 ytdl.downloadFromInfo(info, { format: format })
//                                     .pipe(outputStream)
//                                     .on('finish', () => {
//                                         console.log(`Finished downloading as MP3: ${outputFilePath}`);
//                                         downloadedVideos.add(videoId);
//                                     });
//                             })
//                             .catch((err) => {
//                                 console.error(err);
//                             });
//                     } else {
//                         console.log(`Skipped downloading video (already downloaded): ${videoId}`);
//                     }
//                 }
//             );
//         })
//         .catch(() => {
//             console.log("error!");
//         });
// }


const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const ytdl = require('ytdl-core');
const fs = require('fs');
app.use(cors());
app.use(express.json());

const z = "Youtube Playlist Downloader!";
let link = "";
const downloadedVideos = new Set();

function sanitizeFileName(fileName) {
    return fileName.replace(/[\/\?<>\\:\*\|"]/g, "_");
}

app.post('/submitUrl', async (req, res) => {
    try {
        const { url } = req.body;
        link = url;
        console.log('Received URL from frontend:', link);
        const idx = link.indexOf('=');
        const pId = url.slice(idx + 1, url.length);
        const api = "AIzaSyBIVuBEKwDYGN8JPVJIHyHhjmJnFSyBgbc";
        const l = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=25&playlistId=${pId}&key=${api}`;
        await downloader(l);
        console.log("Download completed!");
        res.json({ message: 'URL received successfully!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/message', (req, res) => {
    res.json({ message: z });
});

app.listen(8000, () => {
    console.log(`Server is running on port 8000.`);
});

async function downloader(l) {
    const downloadPath = "C:/Users/Srivathsav S/Desktop/Code/Extension/Downloads";

    try {
        const response = await fetch(l);
        const completedData = await response.json();

        for (const item of completedData.items) {
            const videoId = item.snippet.resourceId.videoId;

            if (!downloadedVideos.has(videoId)) {
                const info = await ytdl.getInfo(videoId);
                const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });

                if (!format) {
                    console.error('No valid format found');
                    return;
                }

                const fixedTitle = sanitizeFileName(info.videoDetails.title);
                const outputFilePath = path.join(downloadPath, `${fixedTitle}.${format.container}`);
                const outputStream = fs.createWriteStream(outputFilePath);

                const videoStream = ytdl.downloadFromInfo(info, { format: format });

                videoStream.on('data', (chunk) => {
                    outputStream.write(chunk);
                });

                videoStream.on('end', () => {
                    outputStream.end();
                    console.log(`Finished downloading: ${outputFilePath}`);
                    downloadedVideos.add(videoId);
                });
            } else {
                console.log(`Skipped downloading video (already downloaded): ${videoId}`);
            }
        }

        console.log("Download completed!");
    } catch (error) {
        console.error('Error during download:', error);
    }
}
