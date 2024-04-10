import VoicesPreview from "@/components/voices-preview";
import TextToSpeechForm from "./form";

const TextToSpeech = () => {
	return (
		<div className="max-w-screen-md mx-auto flex flex-col gap-8">
			<h1 className="text-3xl font-semibold">Text to speech</h1>
			<div className="space-y-2">
				<h2 className="text-xl font-medium">Available voices</h2>
				<VoicesPreview />
			</div>
			<TextToSpeechForm />
		</div>
	);
};

export default TextToSpeech;
