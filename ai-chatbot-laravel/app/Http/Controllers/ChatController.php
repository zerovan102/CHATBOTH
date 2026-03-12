<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Gemini\Laravel\Facades\Gemini;

class ChatController extends Controller
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
                $userPrompt = $lastMessage['content'];
            }

            $geminiHistory = array_map(function ($msg) {
                return [
                    'role' => $msg['role'] === 'user' ? 'user' : 'model',
                    'parts' => [
                        ['text' => $msg['content']]
                    ],
                ];
            }, $history);

            $chat = Gemini::chat()
                ->withModel('gemini-1.5-flash')
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
            
            // Clean up JSON if necessary (sometimes Gemini adds markdown)
            $text = preg_replace('/```json\n|\n```/', '', $text);
            $suggestions = json_decode($text, true);

            return response()->json(['suggestions' => $suggestions]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to generate suggestions.', 'error' => $e->getMessage()], 500);
        }
    }
}
