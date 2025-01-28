const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const sharp = require('sharp');

const SOURCE_BUCKET = 'nickiscooking-image-upload';
const DESTINATION_BUCKET = 'nickiscooking.com';

exports.handler = async (event) => {
    try {
        for (const record of event.Records) {
            const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

            // Get the original image
            const originalImage = await S3.getObject({
                Bucket: SOURCE_BUCKET,
                Key: key,
            }).promise();

            // Process full-size WebP
            const fullSizeWebP = await sharp(originalImage.Body)
                .webp()
                .toBuffer();

            // Process thumbnail WebP (e.g., 200px width)
            const thumbnailWebP = await sharp(originalImage.Body)
                .resize({ width: 200 })
                .webp()
                .toBuffer();

            // Upload full-size WebP
            await S3.putObject({
                Bucket: DESTINATION_BUCKET,
                Key: `full/${key}.webp`,
                Body: fullSizeWebP,
                ContentType: 'image/webp',
            }).promise();

            // Upload thumbnail WebP
            await S3.putObject({
                Bucket: DESTINATION_BUCKET,
                Key: `thumbnail/${key}.webp`,
                Body: thumbnailWebP,
                ContentType: 'image/webp',
            }).promise();
        }
        console.log('Processing complete.');
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
};
