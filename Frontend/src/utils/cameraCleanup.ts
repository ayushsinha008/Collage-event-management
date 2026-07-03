import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

const activeStreamRef: { current: MediaStream | null } = { current: null };

export function captureStreamFromScanner(elementId: string) {
  const video = document.querySelector(`#${elementId} video`) as HTMLVideoElement | null;
  if (video?.srcObject instanceof MediaStream) {
    activeStreamRef.current = video.srcObject;
  }
}

/** Synchronous — must run before unmount to turn off camera LED. */
export function stopCameraTracksNow() {
  if (activeStreamRef.current) {
    activeStreamRef.current.getTracks().forEach((track) => {
      track.stop();
    });
    activeStreamRef.current = null;
  }

  document.querySelectorAll('video').forEach((video) => {
    const stream = video.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
    video.removeAttribute('src');
    video.load();
  });
}

export async function stopHtml5QrcodeScanner(scanner: Html5Qrcode | null) {
  if (!scanner) return;

  try {
    const state = scanner.getState();
    if (
      state === Html5QrcodeScannerState.SCANNING ||
      state === Html5QrcodeScannerState.PAUSED
    ) {
      await scanner.stop();
    }
  } catch {
    stopCameraTracksNow();
  }

  try {
    scanner.clear();
  } catch {
    // ignore
  }

  stopCameraTracksNow();
}
