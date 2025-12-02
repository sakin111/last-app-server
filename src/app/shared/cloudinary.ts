import { v2 as cloudinary } from "cloudinary";
import { envVar } from "../config/envVar";

cloudinary.config({
    cloud_name: envVar.CLOUDINARY_API_CLOUD,
    api_key: envVar.CLOUDINARY_API_KEY,
    api_secret: envVar.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (filePath: string, folder: string = "travel-buddy") => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: "auto"
        });
        return result.secure_url;
    } catch (error: any) {
        throw new Error(`Cloudinary upload error: ${error.message}`);
    }
};

export const uploadMultipleToCloudinary = async (filePaths: string[], folder: string = "travel-buddy") => {
    try {
        const uploadPromises = filePaths.map(filePath =>
            cloudinary.uploader.upload(filePath, {
                folder: folder,
                resource_type: "auto"
            })
        );

        const results = await Promise.all(uploadPromises);
        return results.map(result => result.secure_url);
    } catch (error: any) {
        throw new Error(`Cloudinary multiple upload error: ${error.message}`);
    }
};

export default cloudinary;
