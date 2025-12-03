import qrcode from "qrcode";

export const getQRImageURL = (urlString: string): Promise<string> =>
  new Promise((res) => {
    // @TODO: make a file and upload to s3?
    qrcode.toDataURL(
      urlString,
      {
        scale: 20,
      },
      (_, link) => {
        res(link);
      }
    );
  });
