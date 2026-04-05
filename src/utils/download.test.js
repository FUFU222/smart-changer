import { getZipEntryName } from "./download";

describe("downloadAsZip", () => {
  test("keeps the original converted file extension inside the zip", async () => {
    const image = new File(["content"], "sample.jpeg", { type: "image/jpeg" });

    expect(getZipEntryName(image, "jpeg")).toBe("sample.jpeg");
  });
});
