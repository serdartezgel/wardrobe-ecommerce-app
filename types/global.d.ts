declare module "*.css";
declare module "*.svg";
declare module "*.png";
declare module "*.jpg";

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}
