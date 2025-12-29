<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

class Invoice extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'uuid',
        'invoice_number',
        'customer_id',
        'service_id',
        'period_start',
        'period_end',
        'amount',
        'tax',
        'discount',
        'total',
        'due_date',
        'status',
        'payment_method',
        'notes',
        'items',
        'paid_at',
        'cancelled_at',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'amount' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'items' => 'array',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }

    public function isOverdue()
    {
        return $this->status === 'overdue' || 
               ($this->status === 'unpaid' && $this->due_date->lt(now()));
    }

    public function getDaysOverdueAttribute()
    {
        if (!$this->isOverdue()) {
            return 0;
        }
        
        return now()->diffInDays($this->due_date);
    }

    public function markAsPaid($method = null, $paidAt = null)
    {
        $this->status = 'paid';
        $this->payment_method = $method;
        $this->paid_at = $paidAt ?? now();
        $this->save();
    }
}