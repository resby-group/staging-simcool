<?php

namespace App\Console\Commands;

use App\Models\Country;
use App\Models\EsimPackage;
use App\Models\Operator;
use App\Models\Region;
use App\Services\EsimAccessService;
use Illuminate\Console\Command;

class SyncEsimAccessRegionPackage extends Command
{
    protected $signature = 'esimaccess:sync-packages';
    protected $description = 'Sync Esim Access eSIM packages with local database';

    public function handle()
    {
        $this->info('Syncing Esim Access packages...');

        try {
            $esimAccessService = new EsimAccessService();
            $count = 0;

            $response = $esimAccessService->getPackages([
                'locationCode' => '!RG'
            ]);

            foreach ($response->packageList as $pkg) {

                // -----------------------------------------
                // Convert bytes to MB/GB
                // -----------------------------------------
                $bytes = $pkg->volume;
                if ($bytes >= 1024 ** 3) {
                    $dataMB = round($bytes / (1024 ** 3), 2) . ' GB';
                } else {
                    $dataMB = round($bytes / (1024 ** 2), 2) . ' MB';
                }

                // -----------------------------------------
                // Create or Update eSIM Package
                // -----------------------------------------
                $esimPackageGenerated = EsimPackage::firstOrNew([
                    'package_id' => $pkg->packageCode
                ]);

                $pkgAttrs = [
                    'package_id'      => $pkg->packageCode,
                    'name'            => $pkg->name,
                    'type'            => 'sim',
                    'plan_type'       => $pkg->smsStatus == 1 ? 2 : 1,
                    'price'           => $pkg->retailPrice / 10000,
                    'amount'          => $pkg->retailPrice,
                    'day'             => $pkg->duration,
                    'is_unlimited'    => $pkg->dataType == 4 ? 1 : 0,
                    'short_info'      => $pkg->description,
                    'is_fair_usage_policy' => !empty($pkg->fupPolicy) ? 1 : 0,
                    'fair_usage_policy' => $pkg->fupPolicy,
                    'data'            => $dataMB,
                    'net_price'       => $pkg->price / 10000,
                    'location'        => $pkg->location,
                    'locationCode'    => $pkg->locationCode,
                    'esim_provider'   => 'esimaccess',
                    'prices'          => null,
                    'is_active'       => 1,
                ];

                if ($esimPackageGenerated->exists) {
                    if (updateIfChanged($esimPackageGenerated, $pkgAttrs)) {
                        $this->info("Updated package: {$esimPackageGenerated->name}");
                    }
                } else {
                    $esimPackageGenerated->fill($pkgAttrs)->save();
                    $this->info("Created package: {$esimPackageGenerated->name}");
                }

                // -----------------------------------------
                // Country & Operator Mapping
                // -----------------------------------------
                $countryIds = [];

                foreach ($pkg->locationNetworkList as $location) {

                    // COUNTRY
                    $countryId = Country::where('country_code', $location->locationCode)->value('id') ?? 0;
                    if ($countryId > 0) {
                        $countryIds[] = $countryId;
                    }

                    // OPERATOR
                    foreach ($location->operatorList as $operator) {

                        $generatedOperator = Operator::firstOrNew([
                            'name' => $operator->operatorName
                        ]);

                        $existingList = json_decode($generatedOperator->esim_id, true);
                        $existingList = is_array($existingList) ? $existingList : [];

                        // Merge safely
                        $merged = array_unique(array_merge($existingList, [$esimPackageGenerated->id]));
                        $merged = array_values($merged);

                        $operatorAttrs = [
                            'name'        => $operator->operatorName,
                            'type'        => 'local',
                            'is_prepaid'  => 0,
                            'plan_type'   => 'data',
                            'networkType' => $operator->networkType,
                            'esim_id'     => json_encode($merged),
                            'is_active'   => 1,
                        ];

                        if ($generatedOperator->exists) {
                            if (updateIfChanged($generatedOperator, $operatorAttrs)) {
                                $this->info("Updated operator: {$generatedOperator->name}");
                            }
                        } else {
                            $generatedOperator->fill($operatorAttrs)->save();
                            $this->info("Created operator: {$generatedOperator->name}");
                        }
                    }
                }

                // -----------------------------------------
                // Region mapping
                // -----------------------------------------
                $region = Region::firstOrNew([
                    'code' => $pkg->locationCode
                ], [
                    'name' => $pkg->location,
                    'slug' => strtolower($pkg->location),
                    'is_active' => 1
                ]);

                if (!$region->exists) {
                    $region->save();
                }

                updateIfChanged($esimPackageGenerated, [
                    'country_ids' => json_encode(array_values($countryIds)),
                    'region_id'   => $region->id
                ]);

                $count++;
            }

            $this->info("Esim Access package sync complete. Synced $count packages.");

        } catch (\Exception $e) {
            $this->error("Error syncing Esim Access packages: " . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
