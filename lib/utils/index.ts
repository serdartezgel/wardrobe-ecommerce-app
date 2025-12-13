import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/wardrobe/products/image_123.jpg
    if (!url.includes("cloudinary.com")) {
      return null;
    }

    const urlParts = url.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) {
      return null;
    }

    const publicIdWithExt = urlParts.slice(uploadIndex + 2).join("/");

    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}
