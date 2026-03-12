<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ChatbotController;

Route::post('/chat', [ChatbotController::class , 'chat']);
Route::post('/generate-suggestions', [ChatbotController::class , 'generateSuggestions']);