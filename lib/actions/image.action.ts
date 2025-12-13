"use server";

import { v2 as cloudinary } from "cloudinary";
import z from "zod";

import action from "../handlers/action";
import handleError from "../handlers/error";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadSchema = z.object({
  file: z.string(),
  folder: z.string().default("products"),
  publicId: z.string().optional(),
});

export async function uploadToCloudinary(
  params: z.infer<typeof uploadSchema>,
): Promise<ActionResponse<{ url: string; publicId: string }>> {
  const validationResult = await action({
    params,
    schema: uploadSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { file, folder, publicId } = validationResult.params!;

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `wardrobe/${folder}`,
      public_id: publicId,
      resource_type: "auto",
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return {
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

const bulkUploadSchema = z.object({
  files: z.array(z.string()),
  folder: z.string().default("products"),
});

export async function bulkUploadToCloudinary(
  params: z.infer<typeof bulkUploadSchema>,
): Promise<ActionResponse<Array<{ url: string; publicId: string }>>> {
  const validationResult = await action({
    params,
    schema: bulkUploadSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { files, folder } = validationResult.params!;

  try {
    const uploadPromises = files.map((file, index) =>
      cloudinary.uploader.upload(file, {
        folder: `wardrobe/${folder}`,
        public_id: `image_${Date.now()}_${index}`,
        resource_type: "auto",
        transformation: [
          { width: 1200, height: 1200, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      }),
    );

    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }));

    return {
      success: true,
      data: uploadedImages,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteFromCloudinary(
  publicId: string,
): Promise<ActionResponse<{ success: boolean }>> {
  const validationResult = await action({
    params: { publicId },
    schema: z.object({ publicId: z.string() }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await cloudinary.uploader.destroy(publicId);

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function bulkDeleteFromCloudinary(
  publicIds: string[],
): Promise<ActionResponse<{ success: boolean; deleted: number }>> {
  const validationResult = await action({
    params: { publicIds },
    schema: z.object({ publicIds: z.array(z.string()) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const result = await cloudinary.api.delete_resources(publicIds);

    const deletedCount = Object.values(result.deleted).filter(
      (status) => status === "deleted",
    ).length;

    return {
      success: true,
      data: {
        success: true,
        deleted: deletedCount,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
