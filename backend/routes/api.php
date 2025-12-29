<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\RouterController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Middleware\RoleMiddleware;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/refresh', [AuthController::class, 'refresh']);
Route::post('/webhook/midtrans', [PaymentController::class, 'midtransWebhook']);
Route::post('/webhook/xendit', [PaymentController::class, 'xenditWebhook']);

// Protected routes
Route::middleware([JwtMiddleware::class])->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-activities', [DashboardController::class, 'recentActivities']);
    Route::get('/dashboard/overdue-invoices', [DashboardController::class, 'overdueInvoices']);
    
    // Customers
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store'])->middleware(RoleMiddleware::class . ':supervisor,administrator');
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])->middleware(RoleMiddleware::class . ':supervisor,administrator');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->middleware(RoleMiddleware::class . ':administrator');
    Route::post('/customers/{customer}/documents', [CustomerController::class, 'uploadDocument']);
    Route::get('/customers/{customer}/services', [CustomerController::class, 'services']);
    Route::get('/customers/{customer}/invoices', [CustomerController::class, 'invoices']);
    
    // Services
    Route::get('/services', [ServiceController::class, 'index']);
    Route::post('/services', [ServiceController::class, 'store'])->middleware(RoleMiddleware::class . ':technician,supervisor,administrator');
    Route::get('/services/{service}', [ServiceController::class, 'show']);
    Route::put('/services/{service}', [ServiceController::class, 'update'])->middleware(RoleMiddleware::class . ':technician,supervisor,administrator');
    Route::post('/services/{service}/provision', [ServiceController::class, 'provision'])->middleware(RoleMiddleware::class . ':technician,administrator');
    Route::post('/services/{service}/suspend', [ServiceController::class, 'suspend'])->middleware(RoleMiddleware::class . ':technician,supervisor,administrator');
    Route::post('/services/{service}/reactivate', [ServiceController::class, 'reactivate'])->middleware(RoleMiddleware::class . ':technician,supervisor,administrator');
    Route::post('/services/{service}/test-connection', [ServiceController::class, 'testConnection']);
    
    // Billing
    Route::get('/invoices', [BillingController::class, 'index']);
    Route::post('/invoices', [BillingController::class, 'store'])->middleware(RoleMiddleware::class . ':finance,administrator');
    Route::get('/invoices/{invoice}', [BillingController::class, 'show']);
    Route::put('/invoices/{invoice}', [BillingController::class, 'update'])->middleware(RoleMiddleware::class . ':finance,administrator');
    Route::post('/invoices/{invoice}/send-reminder', [BillingController::class, 'sendReminder'])->middleware(RoleMiddleware::class . ':finance,administrator');
    Route::post('/invoices/generate-monthly', [BillingController::class, 'generateMonthly'])->middleware(RoleMiddleware::class . ':finance,administrator');
    Route::get('/invoices/{invoice}/download', [BillingController::class, 'download']);
    
    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);
    Route::put('/payments/{payment}/verify', [PaymentController::class, 'verify'])->middleware(RoleMiddleware::class . ':finance,administrator');
    Route::post('/payments/midtrans-token', [PaymentController::class, 'generateMidtransToken']);
    Route::post('/payments/xendit-invoice', [PaymentController::class, 'createXenditInvoice']);
    
    // Routers
    Route::get('/routers', [RouterController::class, 'index'])->middleware(RoleMiddleware::class . ':technician,supervisor,administrator');
    Route::post('/routers', [RouterController::class, 'store'])->middleware(RoleMiddleware::class . ':administrator');
    Route::get('/routers/{router}', [RouterController::class, 'show'])->middleware(RoleMiddleware::class . ':technician,supervisor,administrator');
    Route::put('/routers/{router}', [RouterController::class, 'update'])->middleware(RoleMiddleware::class . ':administrator');
    Route::post('/routers/{router}/test-connection', [RouterController::class, 'testConnection'])->middleware(RoleMiddleware::class . ':technician,administrator');
    Route::get('/routers/{router}/connections', [RouterController::class, 'connections'])->middleware(RoleMiddleware::class . ':technician,administrator');
    
    // Tickets
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
    Route::put('/tickets/{ticket}', [TicketController::class, 'update']);
    Route::post('/tickets/{ticket}/assign', [TicketController::class, 'assign'])->middleware(RoleMiddleware::class . ':support,supervisor,administrator');
    Route::post('/tickets/{ticket}/resolve', [TicketController::class, 'resolve'])->middleware(RoleMiddleware::class . ':support,technician,supervisor,administrator');
    
    // Reports
    Route::get('/reports/financial', [ReportController::class, 'financial'])->middleware(RoleMiddleware::class . ':finance,supervisor,administrator');
    Route::get('/reports/customers', [ReportController::class, 'customers'])->middleware(RoleMiddleware::class . ':supervisor,administrator');
    Route::get('/reports/network', [ReportController::class, 'network'])->middleware(RoleMiddleware::class . ':technician,supervisor,administrator');
    Route::post('/reports/export', [ReportController::class, 'export'])->middleware(RoleMiddleware::class . ':finance,supervisor,administrator');
    
    // Company Settings
    Route::get('/company', [CompanyController::class, 'show']);
    Route::put('/company', [CompanyController::class, 'update'])->middleware(RoleMiddleware::class . ':administrator');
    
    // User Management
    Route::get('/users', [UserController::class, 'index'])->middleware(RoleMiddleware::class . ':supervisor,administrator');
    Route::post('/users', [UserController::class, 'store'])->middleware(RoleMiddleware::class . ':administrator');
    Route::get('/users/{user}', [UserController::class, 'show'])->middleware(RoleMiddleware::class . ':supervisor,administrator');
    Route::put('/users/{user}', [UserController::class, 'update'])->middleware(RoleMiddleware::class . ':administrator');
    Route::put('/users/{user}/change-password', [UserController::class, 'changePassword']);
    
    // Plans
    Route::get('/plans', [PlanController::class, 'index']);
    Route::post('/plans', [PlanController::class, 'store'])->middleware(RoleMiddleware::class . ':supervisor,administrator');
    Route::get('/plans/{plan}', [PlanController::class, 'show']);
    Route::put('/plans/{plan}', [PlanController::class, 'update'])->middleware(RoleMiddleware::class . ':supervisor,administrator');
    Route::delete('/plans/{plan}', [PlanController::class, 'destroy'])->middleware(RoleMiddleware::class . ':administrator');
});