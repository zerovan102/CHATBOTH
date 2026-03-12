<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    protected $geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    public function chat(Request $request)
    {
        $request->validate(['history' => 'required|array']);
        $history = $request->input('history');

        $contents = collect($history)->map(function ($msg) {
            return [
            'role' => $msg['role'] === 'user' ? 'user' : 'model',
            'parts' => [['text' => $msg['content']]]
            ];
        })->toArray();

        $response = Http::post($this->geminiUrl . '?key=' . env('GEMINI_API_KEY'), [
            'contents' => $contents
        ]);

        if ($response->successful()) {
            $text = $response->json('candidates.0.content.parts.0.text');
            return response()->json(['data' => $text]);
        }

        return response()->json(['message' => 'Internal Server Error'], 500);
    }

    public function generateSuggestions()
    {
        $prompt = "Generate 3 short, interesting conversation starter questions for a general AI assistant. Return as a JSON array of strings.";

        $response = Http::post($this->geminiUrl . '?key=' . env('GEMINI_API_KEY'), [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ]
        ]);

        if ($response->successful()) {
            $text = $response->json('candidates.0.content.parts.0.text');
            $cleanText = preg_replace('/```json\s*|\s*```/', '', $text);
            $suggestions = json_decode($cleanText, true);

            return response()->json(['suggestions' => $suggestions]);
        }

        return response()->json(['message' => 'Failed to generate suggestions.'], 500);
    }
    /**
     */
    function __construct()
    {
    }
}