import { GoogleGenAI } from '@google/genai/node';

/**
 * Initializes and returns a GoogleGenAI instance.
 */
export function useGoogleGenAI() {
	const { googleGenAiApiKey } = useRuntimeConfig();
	if (!googleGenAiApiKey) {
		throw new Error('Google GenAI API key is not defined');
	}

	return new GoogleGenAI({
		apiKey: googleGenAiApiKey,
	});
}
