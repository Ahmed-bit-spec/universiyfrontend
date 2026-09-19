import Modal from "./Modal";
import { useLanguage } from "@/hooks/useLanguage";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "danger",
  body,
  loading = false,
  loadingLabel,
  closeOnConfirm = true,
}) => {
  const { t } = useLanguage();
  const ap = t.adminPanel;

  const confirmClass =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-600 text-white"
      : "bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? ap.common.confirmTitle}
      description={description ?? ap.common.confirmBody}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
          >
            {cancelLabel ?? ap.common.cancel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              onConfirm?.();
              if (closeOnConfirm) onClose();
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
          >
            {loading ? loadingLabel ?? ap.common.loading : confirmLabel ?? ap.common.confirm}
          </button>
        </>
      }
    >
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {body ?? description ?? ap.common.confirmBody}
      </p>
    </Modal>
  );
};

export default ConfirmDialog;
