"use client";

import Image, { type ImageProps } from "next/image";
import { cfLoader } from "@/app/lib/cfImageClient";

export default function CfImage(props: ImageProps) {
  return <Image {...props} loader={cfLoader} />;
}

