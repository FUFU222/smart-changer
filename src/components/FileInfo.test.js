import { fireEvent, render, screen } from "@testing-library/react";
import FileInfo from "./FileInfo";

describe("FileInfo", () => {
  test("exposes an accessible remove button for each uploaded file", () => {
    const onRemove = jest.fn();

    render(
      <FileInfo
        file={{
          extension: "png",
          name: "sample.png",
          size: "1.24 MB",
          url: "blob:sample",
        }}
        onRemove={onRemove}
      />
    );

    const removeButton = screen.getByRole("button", {
      name: "sample.pngを削除",
    });

    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
