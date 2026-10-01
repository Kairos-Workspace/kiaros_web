import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kiaros",
    short_name: "Kiaros",
    description:
      "AI-assisted trading signals, transparent results, and community tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/logo/kiaros-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo/kiaros-icon-180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
