<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('esim_packages', function (Blueprint $table) {
            $table->tinyInteger('plan_type')->default(1)->after('day');
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->bigInteger('country_id')->nullable()->after('id');
            $table->bigInteger('region_id')->nullable()->after('country_id');
        });
    }

    public function down(): void
    {
        Schema::table('esim_packages', function (Blueprint $table) {
            $table->dropColumn('plan_type');
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['country_id', 'region_id']);
        });
    }
};
