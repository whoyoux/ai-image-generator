"use client";

import { cn } from "@/lib/utils";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

const SENTENCE = "A quick brown fox jumps over the lazy dog.";

const VoicesPreview = ({ className }: { className?: string }) => {
	const [alloySpeech, setAlloySpeech] = useState<HTMLAudioElement | null>(null);
	const [echoSpeech, setEchoSpeech] = useState<HTMLAudioElement | null>(null);
	const [fableSpeech, setFableSpeech] = useState<HTMLAudioElement | null>(null);
	const [novaSpeech, setNovaSpeech] = useState<HTMLAudioElement | null>(null);
	const [onyxSpeech, setOnyxSpeech] = useState<HTMLAudioElement | null>(null);
	const [shimmerSpeech, setShimmerSpeech] = useState<HTMLAudioElement | null>(
		null,
	);

	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		setAlloySpeech(new Audio("/voices/alloy.mp3"));
		setEchoSpeech(new Audio("/voices/echo.mp3"));
		setFableSpeech(new Audio("/voices/fable.mp3"));
		setNovaSpeech(new Audio("/voices/nova.mp3"));
		setOnyxSpeech(new Audio("/voices/onyx.mp3"));
		setShimmerSpeech(new Audio("/voices/shimmer.mp3"));
		setIsLoaded(true);
	}, []);

	if (!isLoaded) {
		return (
			<div className={cn("grid grid-cols-2 md:grid-cols-3 gap-4", className)}>
				<SpeechPreviewSkeleton />
				<SpeechPreviewSkeleton />
				<SpeechPreviewSkeleton />
				<SpeechPreviewSkeleton />
				<SpeechPreviewSkeleton />
				<SpeechPreviewSkeleton />
			</div>
		);
	}
	return (
		<div className={cn("grid grid-cols-2 md:grid-cols-3 gap-4", className)}>
			<SpeechPreview audio={alloySpeech} name="Alloy" />
			<SpeechPreview audio={echoSpeech} name="Echo" />
			<SpeechPreview audio={fableSpeech} name="Fable" />
			<SpeechPreview audio={novaSpeech} name="Nova" />
			<SpeechPreview audio={onyxSpeech} name="Onyx" />
			<SpeechPreview audio={shimmerSpeech} name="Shimmer" />
		</div>
	);
};

type SpeechPreviewProps = {
	audio: HTMLAudioElement | null;
	name: string;
};

const SpeechPreview = ({ audio, name }: SpeechPreviewProps) => {
	const [isPlaying, setIsPlaying] = useState(false);

	const handlePlay = () => {
		audio?.play();
		setIsPlaying(true);
	};

	const handlePause = () => {
		audio?.pause();
		setIsPlaying(false);
	};

	useEffect(() => {
		audio?.addEventListener("ended", () => {
			setIsPlaying(false);
		});

		return () => {
			audio?.removeEventListener("ended", () => {
				setIsPlaying(false);
			});
		};
	}, [audio]);
	return (
		<div className="bg-card flex items-center gap-4 w-auto p-4 rounded-lg border">
			{isPlaying ? (
				<Button
					onClick={handlePause}
					size="icon"
					variant="secondary"
					aria-label="Pause audio"
				>
					<Pause />
				</Button>
			) : (
				<Button
					onClick={handlePlay}
					size="icon"
					variant="secondary"
					aria-label="Play audio"
				>
					<Play />
				</Button>
			)}

			<h2>{name}</h2>
		</div>
	);
};

const SpeechPreviewSkeleton = () => {
	return <Skeleton className="w-full h-[74px]" />;
};

export default VoicesPreview;
