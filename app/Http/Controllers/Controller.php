<?php

namespace App\Http\Controllers;



use Illuminate\Http\Request; Controller { ( Request $request )     { return response ()->json([ "reply" => "Halo dari server Laravel"         ]);     } }

  

class ChatController extends Controller
{
    private $apiKey;
    private $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
        
        if (!$this->apiKey) {
            throw new \Exception("GEMINI_API_KEY not found in .env");
        }
    }

    public function chat(Request $request)
    {
        try {
            $history = $request->input('history');

            if (!$history || !is_array($history)) {
                return response()->json(
                    ['message' => 'History is required and must be an array.'],
                    400
                );
            }

            \Log::info('[' . now()->format('H:i:s') . '] Menerima riwayat dengan ' . count($history) . ' pesan.');

            // Get last user message
            $userPrompt = array_pop($history)['content'];

            // Format history for API
            $contents = [];
            foreach ($history as $msg) {
                $contents[] = [
                    'role' => $msg['role'] === 'user' ? 'user' : 'model',
                    'parts' => [['text' => $msg['content']]]
                ];
            }

            // Add current user message
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $userPrompt]]
            ];

            // Call Gemini API
            $response = $this->callGeminiAPI($contents);
            $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? '';

            \Log::info('[' . now()->format('H:i:s') . '] Mengirim balasan: "' . substr($text, 0, 70) . '..."');

            return response()->json(['data' => $text]);

        } catch (\Exception $error) {
            \Log::error('Chat Error: ' . $error->getMessage());
            return response()->json(
                ['message' => 'Internal Server Error. Check logs for details.'],
                500
            );
        }
    }

    public function generateSuggestions(Request $request)
    {
        try {
            $prompt = "Generate 3 short, interesting conversation starter questions for a general AI assistant. Return ONLY a JSON array of strings like: [\"question1\", \"question2\", \"question3\"]";

            $contents = [
                [
                    'role' => 'user',
                    'parts' => [['text' => $prompt]]
                ]
            ];

            $response = $this->callGeminiAPI($contents);
            $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? '';

            // Clean JSON response
            $jsonText = preg_replace('/```json\n|\n```/', '', $text);
            $suggestions = json_decode($jsonText, true);

            return response()->json(['suggestions' => $suggestions]);

        } catch (\Exception $error) {
            \Log::error('Suggestions Error: ' . $error->getMessage());
            return response()->json(['message' => 'Failed to generate suggestions.'], 500);
        }
    }

    private function callGeminiAPI($contents)
    {
        $client = new \GuzzleHttp\Client();

        $url = $this->apiUrl . '?key=' . $this->apiKey;

        $response = $client->post($url, [
            'json' => [
                'contents' => $contents
            ],
            'headers' => [
                'Content-Type' => 'application/json'
            ]
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }
}