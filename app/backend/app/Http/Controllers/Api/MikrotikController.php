<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Router;
use App\Services\MikrotikService;
use Illuminate\Support\Facades\Log;

class MikrotikController extends Controller
{
    protected $mikrotikService;

    public function __construct(MikrotikService $mikrotikService)
    {
        $this->mikrotikService = $mikrotikService;
    }

    public function index(Request $request)
    {
        $routers = Router::all();
        
        return response()->json([
            'status' => 'success',
            'data' => $routers
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'ip_address' => 'required|ip',
            'api_port' => 'required|integer|min:1|max:65535',
            'username' => 'required|string',
            'password' => 'required|string',
            'tls_enabled' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $router = Router::create([
                'name' => $request->name,
                'ip_address' => $request->ip_address,
                'api_port' => $request->api_port,
                'username' => $request->username,
                'password_encrypted' => encrypt($request->password),
                'tls_enabled' => $request->tls_enabled ?? true,
                'status' => 'online',
            ]);

            // Test connection
            $testResult = $this->mikrotikService->testConnection($router);

            return response()->json([
                'status' => 'success',
                'message' => 'Router added successfully',
                'data' => $router,
                'test_result' => $testResult
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to add router',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function testConnection($id)
    {
        try {
            $router = Router::findOrFail($id);
            $result = $this->mikrotikService->testConnection($router);

            if ($result['success']) {
                $router->update(['status' => 'online']);
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Connection test successful',
                    'data' => $result
                ]);
            } else {
                $router->update(['status' => 'offline']);
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Connection test failed',
                    'data' => $result
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to test connection',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'ip_address' => 'ip',
            'api_port' => 'integer|min:1|max:65535',
            'username' => 'string',
            'password' => 'string',
            'tls_enabled' => 'boolean',
            'status' => 'in:online,offline,maintenance',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $router = Router::findOrFail($id);
            $updateData = $request->only(['name', 'ip_address', 'api_port', 'username', 'tls_enabled', 'status']);

            if ($request->has('password')) {
                $updateData['password_encrypted'] = encrypt($request->password);
            }

            $router->update($updateData);

            return response()->json([
                'status' => 'success',
                'message' => 'Router updated successfully',
                'data' => $router
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update router',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $router = Router::findOrFail($id);
            
            // Check if router is being used by services
            if ($router->services()->count() > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete router. There are active services using this router.'
                ], 400);
            }

            $router->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Router deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete router',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}