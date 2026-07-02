import QRCode from 'qrcode';
import { ApiError } from '../utils/ApiError';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    // Generate QR Code as Data URI (base64)
    // Only contains the ticket UUID/token for security
    const qrCodeDataUri = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return qrCodeDataUri;
  } catch (error: any) {
    throw new ApiError(500, `QR generation failed: ${error.message}`);
  }
};
