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

app.post('/submitUrl', async (req, res) => {
    try {
        const { url } = req.body;
        link = url;
        console.log('Received URL from frontend:', link);
        const idx = link.indexOf('=')
        const pId = url.slice(idx + 1, url.length)
        const api = "AIzaSyBIVuBEKwDYGN8JPVJIHyHhjmJnFSyBgbc";
        const l = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=25&playlistId=${pId}&key=${api}`;
        const downloadLink = await downloader(l);
        console.log("Download completed!");
        res.json({ message: 'URL received successfully!', downloadLink });
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

function downloader(l) {
    const downloadPath = "C:/Users/Srivathsav S/Desktop/Code/Extension/Downloads";
    return new Promise((resolve, reject) => {
        fetch(l)
            .then((data) => data.json())
            .then((completedData) => {
                completedData.items.map((e) => {
                    const videoId = e.snippet.resourceId.videoId;

                    if (!downloadedVideos.has(videoId)) {
                        ytdl.getInfo(videoId)
                            .then((info) => {
                                const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

                                if (!format) {
                                    console.error('No valid audio format found');
                                    reject('No valid audio format found');
                                    return;
                                }

                                const fixedTitle = sanitizeFileName(info.videoDetails.title)
                                const outputFilePath = path.join(downloadPath, `${fixedTitle}.mp3`);
                                const outputStream = fs.createWriteStream(outputFilePath);

                                ytdl.downloadFromInfo(info, { format: format })
                                    .pipe(outputStream)
                                    .on('finish', () => {
                                        console.log(`Finished downloading as MP3: ${outputFilePath}`);
                                        downloadedVideos.add(videoId);
                                        resolve(outputFilePath);
                                    });
                            })
                            .catch((err) => {
                                console.error(err);
                                reject(err);
                            });
                    } else {
                        console.log(`Skipped downloading video (already downloaded): ${videoId}`);
                    }
                });
            })
            .catch((err) => {
                console.log("error!");
                reject(err);
            });
    });
}

function sanitizeFileName(fileName) {
    return fileName.replace(/[\/\?<>\\:\*\|"]/g, "_");
}
