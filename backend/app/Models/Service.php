<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use App\Traits\HasUuid;
use App\Traits\EncryptsAttributes;

class Service extends Model
{
    use HasFactory, HasUuid, EncryptsAttributes;

    protected $fillable = [
        'uuid',
        'customer_id',
        'plan_id',
        'router_id',
        'type',
        'username',
        'password',
        'static_ip',
        'mac_address',
        'interface',
        'start_date',
        'due_day',
        'status',
        'mikrotik_secret_id',
        'mikrotik_queue_id',
        'mikrotik_address_list_id',
        'provisioning_log',
        'last_provisioned_at',
        'suspended_at',
        'metadata',
    ];

    protected $casts = [
        'start_date' => 'date',
        'last_provisioned_at' => 'datetime',
        'suspended_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected $encryptable = [
        'password',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function router()
    {
        return $this->belongsTo(Router::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function getPasswordAttribute($value)
    {
        return $this->decryptAttribute($value);
    }

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = $this->encryptAttribute($value);
    }

    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isSuspended()
    {
        return $this->status === 'suspended';
    }

    public function getNextInvoiceDateAttribute()
    {
        $now = now();
        $dueDate = now()->setDay($this->due_day);
        
        if ($dueDate->lt($now)) {
            $dueDate->addMonth();
        }
        
        return $dueDate;
    }
}