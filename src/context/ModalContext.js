import React, { createContext, useState } from "react";

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');

  const openModal = (title, message = "") => {
    setModalTitle(title);
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsProcessing(false);
    setModalMessage("");
  };

  const showModal = (type, message = "") => {
    switch (type) {
      case "processing":
        setIsProcessing(true);
        openModal("処理中", message);
        break;
      case "conversionComplete":
        setIsProcessing(false);
        openModal("変換完了", message);
        break;
      case "downloadComplete":
        setIsProcessing(false);
        openModal("ダウンロード完了", message);
        break;
      default:
        setIsProcessing(false);
        openModal("エラー", message);
    }
  };

  return (
    <ModalContext.Provider
      value={{
        modalTitle,
        modalMessage,
        isModalOpen,
        isProcessing,
        fileName,
        setFileName,
        openModal,
        closeModal,
        showModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
