<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuration Report - {{ $configuration->name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .total {
            font-size: 18px;
            font-weight: bold;
            text-align: right;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px solid #333;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Configuration Report</h1>
        <p><strong>Project:</strong> {{ $project->name }}</p>
        <p><strong>Configuration:</strong> {{ $configuration->name }}</p>
        <p><strong>Generated:</strong> {{ now()->format('Y-m-d H:i:s') }}</p>
    </div>

    <div class="section">
        <div class="section-title">Project Details</div>
        <table>
            <tr>
                <th>Property</th>
                <th>Value</th>
            </tr>
            <tr>
                <td>Facade Area</td>
                <td>{{ number_format($project->facade_area, 2) }} m²</td>
            </tr>
            <tr>
                <td>Balcony Meters</td>
                <td>{{ number_format($project->balcony_meters, 2) }} m</td>
            </tr>
            <tr>
                <td>Interior Balustrade Meters</td>
                <td>{{ number_format($project->interior_balustrade_meters, 2) }} m</td>
            </tr>
            <tr>
                <td>Number of Rooms</td>
                <td>{{ $project->rooms->count() }}</td>
            </tr>
            <tr>
                <td>Number of Bathrooms</td>
                <td>{{ $project->bathrooms->count() }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Selected Items</div>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Item</th>
                    <th>Variation</th>
                    <th>Quantity</th>
                    <th>Room/Bathroom</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($configuration->configurationItems as $item)
                    @php
                        $baseCost = $item->item->additional_cost ?? 0;
                        $variationSurcharge = $item->itemVariation->surcharge ?? 0;
                        $unitPrice = $baseCost + $variationSurcharge;
                        $quantity = $item->quantity ?? 1;
                        $total = $unitPrice * $quantity;
                    @endphp
                    <tr>
                        <td>{{ $item->item->category->name ?? 'N/A' }}</td>
                        <td>{{ $item->item->title }}</td>
                        <td>{{ $item->itemVariation->name ?? '-' }}</td>
                        <td>{{ $quantity }}</td>
                        <td>
                            @if($item->projectRoom)
                                {{ $item->projectRoom->name }}
                            @elseif($item->projectBathroom)
                                Bathroom {{ $item->projectBathroom->room_number }}
                            @else
                                -
                            @endif
                        </td>
                        <td>€{{ number_format($unitPrice, 2) }}</td>
                        <td>€{{ number_format($total, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="total">
        <strong>Total Additional Cost: €{{ number_format($totalCost, 2) }}</strong>
    </div>

    <div class="footer">
        <p>This is a computer-generated report. Generated on {{ now()->format('Y-m-d H:i:s') }}</p>
    </div>
</body>
</html>






