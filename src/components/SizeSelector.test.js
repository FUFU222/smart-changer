import { render, screen } from "@testing-library/react";
import SizeSelector from "./SizeSelector";

describe("SizeSelector", () => {
  test("associates the label with the size select", () => {
    render(
      <SizeSelector
        standardSizes={[
          { label: "1200x1200 (ブログ記事など)", width: 1200, height: 1200 },
        ]}
        selectedSize="1200x1200 (ブログ記事など)"
        setSelectedSize={() => {}}
      />
    );

    expect(screen.getByLabelText("②変換後のサイズを選択:")).toBeTruthy();
  });
});
