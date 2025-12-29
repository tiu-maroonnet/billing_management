<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\HasUuid;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuid;

    protected $fillable = [
        'uuid',
        'group_id',
        'name',
        'email',
        'phone',
        'password',
        'status',
        'avatar',
        'settings',
        'last_login_ip',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'settings' => 'array',
        'password' => 'hashed',
    ];

    public function group()
    {
        return $this->belongsTo(UserGroup::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'assigned_to');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    public function hasPermission($permission)
    {
        if ($this->group->slug === 'administrator') {
            return true;
        }

        $permissions = $this->group->permissions;
        return in_array($permission, $permissions) || in_array('*', $permissions);
    }
}