import React, { useContext } from "react";
import Modal from "react-modal";
import { ModalContext } from "../context/ModalContext";
import { downloadAsZip } from "../utils/download";
import { BounceLoader } from "react-spinners";
import "../style/modal.css";

const CustomModal = ({ images, clearImages, outputFormat }) => {
  const {
    isModalOpen,
    modalTitle,
    modalMessage,
    closeModal,
    isProcessing,
    fileName,
    setFileName,
    showModal,
  } = useContext(ModalContext);

  // ファイル名をサニタイズする関数
  const sanitizeFileName = (name) => {
    return name.replace(/[^a-zA-Z0-9\u3040-\u30FF\u4E00-\u9FFF-_]/g, "_");
  };

  const handleDownload = async () => {
    try {
      const sanitizedFileName =
        sanitizeFileName(fileName.trim()) || "converted_images";
      await downloadAsZip(images, sanitizedFileName, outputFormat);
      showModal("downloadComplete");
      clearImages();
    } catch (error) {
      console.error("ダウンロードエラー:", error);
      showModal("error", "ダウンロード中にエラーが発生しました。");
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      className="custom-modal"
      overlayClassName="custom-modal-overlay"
    >
      <h2>{modalTitle}</h2>
      <div className="modal-body">
        {isProcessing ? (
          <BounceLoader
            className="loader"
            loading={isProcessing}
            size={60}
            speedMultiplier={0.8}
          />
        ) : (
          <>
            {modalTitle === "変換完了" && images && images.length > 0 && (
              <div>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) {
                      setFileName(e.target.value);
                    }
                  }}
                  placeholder="ファイル名を入力"
                  className="file-name-input"
                  maxLength={50}
                />
                <span>.zip</span>
                <button onClick={handleDownload}>zipでダウンロード</button>
              </div>
            )}
            {modalTitle === "ダウンロード完了" && (
              <p>{modalMessage || "ダウンロードが完了しました。"}</p>
            )}
            {modalTitle !== "変換完了" && modalTitle !== "ダウンロード完了" && (
              <p>{modalMessage || "予期せぬエラーが発生しました。"}</p>
            )}
          </>
        )}
      </div>
      {!isProcessing && (
        <div className="modal-footer">
          <button className="close-button" onClick={closeModal}>
            閉じる
          </button>
        </div>
      )}
    </Modal>
  );
};

export default CustomModal;
