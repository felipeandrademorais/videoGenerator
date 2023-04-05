const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

// Set the input directory containing the images
const inputDirectory = path.join(__dirname, "media/images");

// Set the input directory containing the songs
const audioFile = path.join(__dirname, "media/audio/song1.mp3");

// Set the output video file path
const outputFile = "output_video.mp4";

// Get the list of images from the input directory
const images = fs
  .readdirSync(inputDirectory)
  .filter((file) => /\.(jpg|jpeg|png)$/i.test(file))
  .map((file) => path.join(inputDirectory, file));

const fps = 25;
const loopSeconds = 5;
const transitionDuration = 1;

const concatFile = "concat.txt";
const fileList = images
  .map((image) => `file '${image}'\nduration ${loopSeconds}`)
  .join("\n");
fs.writeFileSync(concatFile, fileList);

const filter = `
[0:v]scale=7680:-1,zoompan=z='min(zoom+0.0015,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${
  fps * loopSeconds - 1
}:s=1920x1080[v]
`;

ffmpeg()
  .input(concatFile)
  .inputFormat("concat")
  .inputOptions(["-safe", "0"])
  .outputOptions(["-map", "[v]"])
  .videoCodec("libx264")
  .videoBitrate("1024k")
  .fps(fps)
  .audioBitrate("128k")
  .audioChannels(2)
  .format("mp4")
  .complexFilter(filter)
  .on("start", (command) => {
    console.log("ffmpeg process started: ", command);
  })
  .on("error", (err, stdout, stderr) => {
    console.error("Error: ", err);
  })
  .on("end", (output) => {
    console.log("Video created in: ", output);
  })
  .save(outputFile);
