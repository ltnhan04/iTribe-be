const cloudinary = require("../libs/cloudinary");

class CloudinaryHelper {
  static uploadImage = async (files) => {
    let images = [];

    if (!Array.isArray(files)) {
      files = [files];
    }

    for (const file of files) {
      const cloudinaryResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      images.push(cloudinaryResponse.secure_url);
    }
    return images;
  };
}
module.exports = CloudinaryHelper;
