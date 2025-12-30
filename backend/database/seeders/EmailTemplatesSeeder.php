<?php

// database/seeders/EmailTemplatesSeeder.php
class EmailTemplatesSeeder extends Seeder
{
    public function run()
    {
        $templates = [
            [
                'name' => 'Invoice Baru',
                'subject' => 'Invoice Internet #{invoice_number} - PT. Trira Inti Utama',
                'body' => '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B0000; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { background: #8B0000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .invoice-details { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .invoice-details td { padding: 8px; border-bottom: 1px solid #ddd; }
        .invoice-details .label { font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PT. Trira Inti Utama</h1>
            <h2>Maroon-NET</h2>
        </div>
        <div class="content">
            <h3>Tagihan Internet</h3>
            <p>Halo {customer_name},</p>
            <p>Berikut adalah tagihan internet Anda untuk periode {period_start} hingga {period_end}:</p>
            
            <table class="invoice-details">
                <tr>
                    <td class="label">No. Invoice</td>
                    <td>{invoice_number}</td>
                </tr>
                <tr>
                    <td class="label">Total Tagihan</td>
                    <td>Rp {total_amount}</td>
                </tr>
                <tr>
                    <td class="label">Jatuh Tempo</td>
                    <td>{due_date}</td>
                </tr>
                <tr>
                    <td class="label">Metode Pembayaran</td>
                    <td>{payment_methods}</td>
                </tr>
            </table>
            
            <p style="text-align: center;">
                <a href="{payment_link}" class="button">Bayar Sekarang</a>
            </p>
            
            <p>Jika Anda sudah melakukan pembayaran, harap abaikan email ini.</p>
            <p>Hubungi kami jika ada pertanyaan:</p>
            <p>Telepon: {company_phone}<br>
            Email: {company_email}</p>
        </div>
        <div class="footer">
            <p>© {current_year} PT. Trira Inti Utama - Maroon-NET. All rights reserved.</p>
            <p>Email ini dikirim secara otomatis, harap tidak membalas.</p>
        </div>
    </div>
</body>
</html>',
                'variables' => json_encode([
                    'customer_name',
                    'invoice_number',
                    'period_start',
                    'period_end',
                    'total_amount',
                    'due_date',
                    'payment_methods',
                    'payment_link',
                    'company_phone',
                    'company_email',
                    'current_year'
                ]),
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            \App\Models\EmailTemplate::create($template);
        }
    }
}

?>