<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;
use App\Traits\EncryptsAttributes;

class Router extends Model
{
    use HasFactory, HasUuid, EncryptsAttributes;

    protected $fillable = [
        'uuid',
        'name',
        'ip_address',
        'api_port',
        'username',
        'password',
        'api_certificate',
        'use_tls',
        'status',
        'location',
        'description',
        'capabilities',
        'max_connections',
        'current_connections',
        'last_sync',
    ];

    protected $casts = [
        'use_tls' => 'boolean',
        'last_sync' => 'datetime',
        'capabilities' => 'array',
    ];

    protected $encryptable = [
        'password',
        'api_certificate',
    ];

    public function services()
    {
        return $this->hasMany(Service::class);
    }

    public function activeServices()
    {
        return $this->services()->where('status', 'active');
    }

    public function getConnectionRateAttribute()
    {
        if ($this->max_connections == 0) {
            return 0;
        }
        
        return ($this->current_connections / $this->max_connections) * 100;
    }

    public function getApiUrlAttribute()
    {
        $protocol = $this->use_tls ? 'https' : 'http';
        return "{$protocol}://{$this->ip_address}:{$this->api_port}";
    }
}