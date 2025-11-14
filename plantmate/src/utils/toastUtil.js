import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function triggerNotification(type, text) {
  toast[type](text, {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    closeButton: true, 
  });
}