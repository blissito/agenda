import { useLoaderData } from "@remix-run/react";
import { nanoid } from "nanoid";
import { FormEvent, useRef } from "react";
import { getPutFileUrl } from "~/utils/lib/tigris.server";

export const loader = async () => {
  //   const image = await getImageURL("testing/bXBq2.png");
  const k = nanoid(10); // we should get the right mymetype
  const presignedUrl = await getPutFileUrl(k);
  console.log("KEY: ", k);
  console.log("PRESIGNED:", presignedUrl);
  return {
    // image,
    src: "https://firecracker-microvm.github.io/img/firecracker-logo@3x.png",
    presignedUrl,
  };
};

export default function Page() {
  const {
    src,
    // image,
    presignedUrl,
  } = useLoaderData<typeof loader>();
  const imgRef = useRef<HTMLImageElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLInputElement>) => {
    event?.preventDefault();
    const file = event.target.file.files[0];
    const totalBytes = file.size;
    let bytesUploaded = 0;
    const progressTrackingStream = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk);
        bytesUploaded += chunk.byteLength;
        console.log("upload progress:", bytesUploaded / totalBytes);
        uploadProgress.value = bytesUploaded / totalBytes;
      },
      flush(controller) {
        console.log("completed stream");
        // controller.terminate();
      },
    });

    // do not use formData ⚠
    await fetch(presignedUrl, {
      method: "put",
      body: file,

      //   body: file.stream().pipeThrough(progressTrackingStream),
      //   duplex: "half",
      headers: {
        "Content-Length": file.size,
        "Content-Type": file.type,
      },
    }).catch((e) => console.error(e));
  };

  return (
    <>
      <section className="flex flex-col items-center bg-neutral-800 h-screen justify-center">
        <h1 className="text-white text-4xl">Hola blisssmo tigris</h1>
        <img alt="tigri" src={src} className="" />
        {/* <img alt="tigri" src={image} className="" /> */}
        <form
          //   action={presignedUrl}
          //   method="put"
          //   encType="multipart/form-data"
          onSubmit={handleSubmit}
        >
          {/* <input
            type="hidden"
            name="success_action_redirect"
            value="https://denik.me"
          /> */}
          <input
            type="file"
            name="file"
            accept="image/*"
            onChange={(evt) => {
              const previewURL = URL.createObjectURL(evt.target.files[0]);
              imgRef.current.src = previewURL;
            }}
          />
          <img ref={imgRef} src="" alt="preview" />
          <button
            type="submit"
            className="text-white bg-neutral-700 py-2 px-4 rounded-xl m-2"
          >
            Subir
          </button>
        </form>
      </section>
    </>
  );
}
