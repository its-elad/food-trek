import type { UploadFileRes } from "@food-trek/schemas";
import { baseApi } from "./baseApi";

export const uploadFile = {
  fn: (data: File) => {
    const formData = new FormData();
    formData.append("file", data);
    return baseApi
      .post<UploadFileRes>("/files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  key: ["files", "upload"] as const,
};
