import { toast } from "react-toastify";

const ERROR_TOAST_ID = "error-msg";

export function showErrorMessage(msg: string) {
  if (!toast.isActive(ERROR_TOAST_ID)) {
    toast.error(msg, {
      toastId: ERROR_TOAST_ID,
    });
  }
}
