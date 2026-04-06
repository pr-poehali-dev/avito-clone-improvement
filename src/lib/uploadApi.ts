import { getToken } from "./auth";

const UPLOAD_URL = "https://functions.poehali.dev/1832ec9f-5918-4a0e-8002-bf0ec2656300";

export async function uploadPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const token = getToken();
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ data: base64, mime: file.type }),
      });
      const data = await res.json();
      if (!res.ok) reject(new Error(data.error || "Ошибка загрузки"));
      else resolve(data.url);
    };
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });
}
