import Image from "next/image";
import FileUploader from "./FileUploader";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className="">UploadImages</div>
			<FileUploader />
		</main>
	);
}
