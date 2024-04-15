import TextToImageForm from "./form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TextToImage = () => {
	return (
		<div className="max-w-screen-md mx-auto flex flex-col gap-8">
			<h1 className="text-3xl font-semibold">Text to image</h1>
			<Tabs defaultValue="img-gen" className="w-full">
				<TabsList className="w-full">
					<TabsTrigger value="img-gen" className="flex-1">
						Image Generation
					</TabsTrigger>
					<TabsTrigger value="img-var" className="flex-1">
						Image Variations
					</TabsTrigger>
					<TabsTrigger value="img-idk" className="flex-1">
						Image idk
					</TabsTrigger>
				</TabsList>
				<TabsContent value="img-gen">
					<TextToImageForm />
				</TabsContent>
				<TabsContent value="img-var">image variatons</TabsContent>
				<TabsContent value="img-idk">idk</TabsContent>
			</Tabs>
		</div>
	);
};

export default TextToImage;
