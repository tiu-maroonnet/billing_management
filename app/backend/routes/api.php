<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\MikrotikController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/refresh', [AuthController::class, 'refresh']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-activities', [DashboardController::class, 'recentActivities']);
    Route::get('/dashboard/upcoming-invoices', [DashboardController::class, 'upcomingInvoices']);

    // Customers
    Route::apiResource('customers', CustomerController::class);
    Route::get('customers/{id}/services', [CustomerController::class, 'services']);
    Route::get('customers/{id}/invoices', [CustomerController::class, 'invoices']);

    // Services
    Route::apiResource('services', ServiceController::class);
    Route::post('services/{id}/suspend', [ServiceController::class, 'suspend']);
    Route::post('services/{id}/reactivate', [ServiceController::class, 'reactivate']);
    Route::post('services/{id}/terminate', [ServiceController::class, 'terminate']);

    // Plans
    Route::apiResource('plans', PlanController::class);

    // Invoices
    Route::apiResource('invoices', InvoiceController::class);
    Route::post('invoices/generate-monthly', [InvoiceController::class, 'generateMonthly']);
    Route::post('invoices/{id}/send-reminder', [InvoiceController::class, 'sendReminder']);
    Route::get('invoices/export/{type}', [InvoiceController::class, 'export']);

    // Payments
    Route::apiResource('payments', PaymentController::class);
    Route::post('payments/{id}/verify', [PaymentController::class, 'verify']);
    Route::post('payments/{id}/reject', [PaymentController::class, 'reject']);
    Route::post('payments/webhook/midtrans', [PaymentController::class, 'midtransWebhook']);
    Route::post('payments/webhook/xendit', [PaymentController::class, 'xenditWebhook']);

    // Mikrotik Routers
    Route::apiResource('routers', MikrotikController::class);
    Route::post('routers/{id}/test-connection', [MikrotikController::class, 'testConnection']);

    // Tickets
    Route::apiResource('tickets', TicketController::class);
    Route::post('tickets/{id}/assign', [TicketController::class, 'assign']);
    Route::post('tickets/{id}/resolve', [TicketController::class, 'resolve']);
    Route::post('tickets/{id}/close', [TicketController::class, 'close']);

    // Reports
    Route::get('/reports/summary', [DashboardController::class, 'summaryReport']);
    Route::get('/reports/revenue', [DashboardController::class, 'revenueReport']);
    Route::get('/reports/customer-growth', [DashboardController::class, 'customerGrowthReport']);

    // Settings
    Route::get('/settings/company', [DashboardController::class, 'getCompanySettings']);
    Route::put('/settings/company', [DashboardController::class, 'updateCompanySettings']);
    Route::get('/settings/notification-templates', [DashboardController::class, 'getNotificationTemplates']);
    Route::put('/settings/notification-templates/{id}', [DashboardController::class, 'updateNotificationTemplate']);

    // Users Management
    Route::get('/users', [DashboardController::class, 'getUsers']);
    Route::post('/users', [DashboardController::class, 'createUser']);
    Route::put('/users/{id}', [DashboardController::class, 'updateUser']);
    Route::delete('/users/{id}', [DashboardController::class, 'deleteUser']);
    Route::put('/users/{id}/change-password', [DashboardController::class, 'changePassword']);
});