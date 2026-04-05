import { render, screen } from "@testing-library/react";
import FormatSelector from "./FormatSelector";

describe("FormatSelector", () => {
  test("renders only the formats that the converter can actually export", () => {
    render(
      <FormatSelector outputFormat="jpeg" setOutputFormat={() => {}} />
    );

    const optionValues = screen
      .getAllByRole("option")
      .map((option) => option.getAttribute("value"));

    expect(optionValues).toEqual(["jpeg", "png", "webp"]);
  });

  test("associates the label with the output format select", () => {
    render(
      <FormatSelector outputFormat="jpeg" setOutputFormat={() => {}} />
    );

    expect(screen.getByLabelText("①変換後の拡張子を選択:")).toBeTruthy();
  });
});
