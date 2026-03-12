<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Gemini\Laravel\Facades\Gemini;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        try {
            $history = $request->input('history');

            if (!$history || !is_array($history)) {
                return response()->json(['message' => 'History is required and must be an array.'], 400);
            }

            $userPrompt = '';
            if (!empty($history)) {
                $lastMessage = array_pop($history);
                $userPrompt = $lastMessage['content'] ?? '';
            }

            $geminiHistory = array_map(function ($msg) {
                return [
                    'role' => ($msg['role'] ?? 'user') === 'user' ? 'user' : 'model',
                    'parts' => [
                        ['text' => $msg['content'] ?? '']
                    ],
                ];
            }, $history);

            // Use gemini-1.5-flash for faster response
            $chat = Gemini::chat()
                ->startChat(history: $geminiHistory);

            $result = $chat->sendMessage($userPrompt);

            return response()->json(['data' => $result->text()]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Internal Server Error.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function generateSuggestions()
    {
        try {
            $prompt = "Generate 3 short, interesting conversation starter questions for a general AI assistant. Return as a JSON array of strings.";
            
            $result = Gemini::geminiPro()->generateContent($prompt);
            $text = $result->text();
            
            // Clean up JSON if Gemini adds markdown formatting
            $jsonText = preg_replace('/```json\s*|\s*```/', '', $text);
            $suggestions = json_decode(trim($jsonText), true);

            return response()->json(['suggestions' => $suggestions]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate suggestions.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
