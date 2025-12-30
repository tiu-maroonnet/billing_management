<?php

// database/seeders/WhatsAppTemplatesSeeder.php
class WhatsAppTemplatesSeeder extends Seeder
{
    public function run()
    {
        $templates = [
            [
                'template_id' => 'invoice_new',
                'name' => 'Invoice Baru',
                'language' => 'id',
                'category' => 'utility',
                'body' => "Halo {{1}},\n\nTagihan internet Anda untuk periode {{2}} telah tersedia.\n\nTotal: {{3}}\nJatuh tempo: {{4}}\n\nBayar di: {{5}}\n\nHubungi kami jika ada pertanyaan: {{6}}",
                'header' => 'Tagihan Internet {{1}}',
                'footer' => 'PT. Trira Inti Utama - Maroon-NET',
                'buttons' => json_encode([
                    [
                        'type' => 'url',
                        'text' => 'Bayar Sekarang',
                        'url' => '{{5}}'
                    ]
                ]),
                'is_active' => true,
            ],
            [
                'template_id' => 'invoice_reminder',
                'name' => 'Pengingat Tagihan',
                'language' => 'id',
                'category' => 'utility',
                'body' => "Halo {{1}},\n\nIni pengingat bahwa tagihan internet Anda masih belum dibayar.\n\nTotal: {{2}}\nJatuh tempo: {{3}}\nTenggat: {{4}} hari lagi\n\nBayar di: {{5}}\n\n*Layanan akan ditangguhkan jika tidak dibayar sebelum jatuh tempo.*",
                'header' => 'Pengingat Tagihan {{1}}',
                'footer' => 'PT. Trira Inti Utama - Maroon-NET',
                'buttons' => json_encode([
                    [
                        'type' => 'url',
                        'text' => 'Bayar Sekarang',
                        'url' => '{{5}}'
                    ]
                ]),
                'is_active' => true,
            ],
            [
                'template_id' => 'service_suspended',
                'name' => 'Layanan Ditangguhkan',
                'language' => 'id',
                'category' => 'utility',
                'body' => "Halo {{1}},\n\nLayanan internet Anda telah ditangguhkan karena pembayaran terlambat.\n\nTagihan: {{2}}\nTotal: {{3}}\n\nSegera lakukan pembayaran untuk mengaktifkan kembali layanan.\n\nHubungi kami jika sudah bayar: {{4}}",
                'header' => 'Layanan Ditangguhkan',
                'footer' => 'PT. Trira Inti Utama - Maroon-NET',
                'buttons' => json_encode([]),
                'is_active' => true,
            ],
            [
                'template_id' => 'service_activated',
                'name' => 'Layanan Diaktifkan',
                'language' => 'id',
                'category' => 'utility',
                'body' => "Halo {{1}},\n\nLayanan internet Anda telah diaktifkan kembali.\n\nDetail layanan:\nUsername: {{2}}\nPassword: {{3}}\nIP: {{4}}\n\nTerima kasih telah melakukan pembayaran.",
                'header' => 'Layanan Diaktifkan',
                'footer' => 'PT. Trira Inti Utama - Maroon-NET',
                'buttons' => json_encode([]),
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            \App\Models\WhatsAppTemplate::create($template);
        }
    }
}

?>