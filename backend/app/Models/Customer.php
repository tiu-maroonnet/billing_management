<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

class Customer extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'uuid',
        'code',
        'type',
        'name',
        'email',
        'phone',
        'address',
        'id_card_number',
        'id_card_file',
        'document_file',
        'subscription_date',
        'birth_date',
        'status',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'subscription_date' => 'date',
        'birth_date' => 'date',
        'metadata' => 'array',
    ];

    public function services()
    {
        return $this->hasMany(Service::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function activeServices()
    {
        return $this->services()->where('status', 'active');
    }

    public function pendingInvoices()
    {
        return $this->invoices()->whereIn('status', ['unpaid', 'overdue']);
    }

    public function getTotalOutstandingAttribute()
    {
        return $this->pendingInvoices()->sum('total');
    }
}