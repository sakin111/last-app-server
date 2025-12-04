import { v2 as cloudinary } from "cloudinary";
import { envVar } from "../config/envVar";
import fs from "fs"

cloudinary.config({
    cloud_name: envVar.CLOUDINARY_API_CLOUD,
    api_key: envVar.CLOUDINARY_API_KEY,
    api_secret: envVar.CLOUDINARY_API_SECRET
});


export const uploadMultipleToCloudinary = async (filePaths: string[], folder: string = "travel-buddy/travels") => {
  try {
    const uploadPromises = filePaths.map(async filePath => {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: "auto",
      });
      fs.unlinkSync(filePath);
      return result.secure_url;
    });
    return await Promise.all(uploadPromises);
  } catch (error: any) {
    throw new Error(`Cloudinary multiple upload error: ${error.message}`);
  }
};

export default cloudinary;
