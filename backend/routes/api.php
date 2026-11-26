<?php

use App\Http\Controllers\EnquiryController;
use Illuminate\Support\Facades\Route;

// Every route here is prefixed with /api and answers JSON.

Route::post('/enquiries', EnquiryController::class)
    ->middleware('throttle:enquiries')
    ->name('enquiries.store');
