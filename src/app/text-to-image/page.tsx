import TextToImageForm from "./form";

const TextToImage = () => {
	return (
		<div className="max-w-screen-md mx-auto flex flex-col gap-8">
			<h1 className="text-3xl font-semibold">Text to image</h1>
			<TextToImageForm />
		</div>
	);
};

export default TextToImage;
