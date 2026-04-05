import { fireEvent, render, screen } from "@testing-library/react";
import { useContext } from "react";
import CustomModal from "./CustomModal";
import { ModalContext, ModalProvider } from "../context/ModalContext";

jest.mock("react-modal", () => {
  return function MockModal({ isOpen, children }) {
    if (!isOpen) {
      return null;
    }

    return <div>{children}</div>;
  };
});

const ErrorTrigger = () => {
  const { showModal } = useContext(ModalContext);

  return (
    <button
      type="button"
      onClick={() =>
        showModal("error", "画像ファイルのみをアップロードしてください。")
      }
    >
      open
    </button>
  );
};

describe("CustomModal", () => {
  test("shows the specific error message passed by callers", () => {
    render(
      <ModalProvider>
        <ErrorTrigger />
        <CustomModal images={[]} clearImages={() => {}} outputFormat="jpeg" />
      </ModalProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "open" }));

    expect(
      screen.getByText("画像ファイルのみをアップロードしてください。")
    ).toBeTruthy();
  });
});
