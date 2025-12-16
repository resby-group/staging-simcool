<?php

namespace App\Jobs;

use Google_Client;
use Google_Service_AndroidPublisher;
use Google_Service_AndroidPublisher_InappproductsBatchUpdateRequest;
use Google_Service_AndroidPublisher_InappproductsBatchUpdateRequestEntry;
use Google_Service_AndroidPublisher_InAppProduct;
use Google_Service_AndroidPublisher_Price;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class BatchUpdateInAppProductsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $items;

    public function __construct(array $items)
    {
        $this->items = $items;
    }

    public function handle()
    {
        $androidPackageName = systemflag('androidPackageName');
        try {
            $client = new Google_Client();
            $client->setAuthConfig(storage_path('app/google/esim-firebase.json'));
            $client->addScope(\Google_Service_AndroidPublisher::ANDROIDPUBLISHER);
            $client->setAccessType('offline');

            $service = new \Google_Service_AndroidPublisher($client);

            foreach ($this->items as $item) {
                // Ensure minimum price = 10
                $price = (float) $item['price'];

                // Google requires minimum INR 10
                if ($price < 10) {
                    $price = 10.00;
                }

                // Convert to micros (string required)
                // Use bcmul() for high-precision multiplication
                $priceMicros = bcmul((string) $price, '1000000');

                // Build price list for all currencies (same numeric value everywhere)
                $defaultPrice = new \Google_Service_AndroidPublisher_Price();
                $defaultPrice->setCurrency('INR');
                $defaultPrice->setPriceMicros($priceMicros);

                // In-app product definition
                $iap = new \Google_Service_AndroidPublisher_InAppProduct([
                    'sku' => strtolower(str_replace('-', '_', $item['sku'])),
                    'status' => 'active',
                    'defaultLanguage' => 'en-GB',
                    'listings' => [
                        'en-GB' => [
                            'title' => $item['title'],
                            'description' => $item['description'],
                        ],
                    ],
                    'defaultPrice'    => $defaultPrice,
                    'purchaseType' => 'managedUser',
                ]);

                // Wrap into batch request entry
                $entry = new \Google_Service_AndroidPublisher_InappproductsBatchUpdateRequestEntry();
                $entry->setSku($iap->getSku());
                $entry->setAllowMissing(true);
                $entry->setAutoConvertMissingPrices(true);
                $entry->setLatencyTolerance(
                    'PRODUCT_UPDATE_LATENCY_TOLERANCE_LATENCY_TOLERANT'
                );
                $entry->setInappproduct($iap);

                $entries[] = $entry;
            }

            if (empty($entries)) {
                Log::warning('No items to batch update');
                return;
            }

            // Build batch request
            $batchReq = new \Google_Service_AndroidPublisher_InappproductsBatchUpdateRequest();
            $batchReq->setRequests($entries);

            // Execute
            $response = $service->inappproducts->batchUpdate($androidPackageName, $batchReq);

            Log::info('Batch update completed', [
                'count' => count($entries),
                'response' => json_decode(json_encode($response), true),
            ]);
        } catch (\Google\Service\Exception $e) {
            $reason = $e->getErrors()[0]['reason'] ?? null;

            if ($reason === 'notFound') {
                Log::error("Package not found in Google Play", [
                    'package' => $androidPackageName,
                    'message' => $e->getMessage(),
                ]);
                return;
            }

            Log::error('Google API Error in batchUpdate', [
                'message' => $e->getMessage(),
                'errors'  => $e->getErrors() ?? []
            ]);
        } catch (\Throwable $e) {
            Log::error('General error in batchUpdate job', [
                'message' => $e->getMessage(),
            ]);
        }
    }
}
