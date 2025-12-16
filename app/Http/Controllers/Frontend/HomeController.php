<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Jobs\AppleStoreIapJob;
use App\Models\Country;
use App\Models\EsimPackage;
use App\Models\Faq;
use App\Models\Page;
use App\Models\Region;
use App\Services\DynamicPriceImageGenerator;
use App\Services\EsimAccessService;
use App\Services\EsimGoService;
use App\Services\IosService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Google_Client;
use Google_Service_AndroidPublisher;
use Illuminate\Support\Facades\Http;
use Str;


class HomeController extends Controller
{
    public function home(Request $request)
    {
        try {
            $destinations = Country::inRandomOrder()
                ->take(6)
                ->get();

            $esimPackages = EsimPackage::where('type', 'sim')
                ->inRandomOrder()
                ->take(3)
                ->get();
            $faqs = Faq::get();
            return view('frontend.index', compact('faqs', 'destinations', 'esimPackages'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function search(Request $request)
    {
        $query = $request->get('q');

        $countries = Country::where('name', 'like', "%{$query}%")
            ->select('id', 'name', 'image', 'country_code', DB::raw("'Rountry' as type"))
            ->limit(5)
            ->get();

        $regions = Region::where('name', 'like', "%{$query}%")
            ->select('id', 'name', 'image', DB::raw("null as country_code"), DB::raw("'Region' as type"))
            ->limit(5)
            ->get();

        $results = $countries->merge($regions);

        return response()->json($results);
    }

    public function testFunction()
    {
        $currency = 'KWD';
        switch ($currency) {
            case 'AUD':
                $territory = 'AUS';
                break;
            case 'BRL':
                $territory = 'BRA';
                break;
            case 'GBP':
                $territory = 'GBR';
                break;
            case 'CAD':
                $territory = 'CAN';
                break;
            case 'AED':
                $territory = 'ARE';
                break;
            case 'EUR':
                $territory = 'EUR';
                break;
            case 'INR':
                $territory = 'IND';
                break;
            case 'IDR':
                $territory = 'IDN';
                break;
            case 'ILS':
                $territory = 'ISR';
                break;
            case 'JPY':
                $territory = 'JPN';
                break;
            case 'KWD':
                $territory = 'KWT';
                break;
            case 'MYR':
                $territory = 'MYS';
                break;
            case 'MXN':
                $territory = 'MEX';
                break;
            case 'SGD':
                $territory = 'SGP';
                break;
            case 'KRW':
                $territory = 'KOR';
                break;
            case 'USD':
                $territory = 'USA';
                break;
            case 'VND':
                $territory = 'VNM';
                break;
            default:
                $territory = 'USD';
        }

        $iosService = new IosService('range_between_50_to_99', $territory);
        dd($iosService->priceGet());
    }
}
