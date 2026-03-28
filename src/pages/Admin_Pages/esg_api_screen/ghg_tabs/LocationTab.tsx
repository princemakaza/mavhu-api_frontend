import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import {
    MapPin,
    Maximize2,
    Minimize2,
    Navigation,
    ZoomIn,
    ZoomOut,
    Target,
    Info,
} from "lucide-react";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ThemeClasses {
    bg: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    navBg: string;
    cardBg: string;
    cardBgAlt: string;
    border: string;
    borderHover: string;
    hoverBg: string;
    modalBg: string;
    chartGrid: string;
    chartText: string;
}

interface Metadata {
    api_version: string;
    calculation_version: string;
    gee_adapter_version: string;
    generated_at: string;
    endpoint: string;
}

interface AreaOfInterestMetadata {
    name: string;
    area_covered: string;
    coordinates: Array<{
        lat: number;
        lon: number;
        _id?: string;
    }>;
}

interface Company {
    area_of_interest_metadata?: AreaOfInterestMetadata;
}

interface LocationTabProps {
    themeClasses?: ThemeClasses; // Make optional
    logoGreen: string;
    coordinates: any[];
    areaName: string;
    areaCovered: string;
    metadata?: Metadata;
    company?: Company;
}

// Default theme classes for light mode only
const defaultThemeClasses: ThemeClasses = {
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    navBg: 'bg-white',
    cardBg: 'bg-white/80',
    cardBgAlt: 'bg-white/60',
    border: 'border-gray-200',
    borderHover: 'border-gray-300',
    hoverBg: 'hover:bg-gray-100',
    modalBg: 'bg-white',
    chartGrid: '#e5e7eb',
    chartText: '#374151'
};

// Custom hook to handle map bounds
const MapBoundsSetter: React.FC<{ coordinates: any[] }> = ({ coordinates }) => {
    const map = useMap();

    useEffect(() => {
        if (coordinates.length > 0) {
            const bounds = coordinates.map(coord => [coord.lat, coord.lon] as [number, number]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [coordinates, map]);

    return null;
};

const LocationTab: React.FC<LocationTabProps> = ({
    themeClasses,
    logoGreen,
    coordinates,
    areaName,
    areaCovered,
    metadata,
    company,
}) => {
    const [mapZoom, setMapZoom] = useState(12);
    const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
        if (coordinates.length > 0) {
            if (coordinates.length === 1) {
                return [coordinates[0].lat, coordinates[0].lon];
            } else {
                const avgLat = coordinates.reduce((sum: number, c: any) => sum + c.lat, 0) / coordinates.length;
                const avgLon = coordinates.reduce((sum: number, c: any) => sum + c.lon, 0) / coordinates.length;
                return [avgLat, avgLon];
            }
        }
        return [0, 0];
    });
    const [showFullMap, setShowFullMap] = useState(false);
    
    // Use themeClasses if provided, otherwise use default
    const theme = themeClasses || defaultThemeClasses;
    
    // Use company's area_of_interest_metadata if available
    const areaData = company?.area_of_interest_metadata || {
        name: areaName,
        area_covered: areaCovered,
        coordinates: coordinates
    };

    // Map Component
    const MapDisplay = () => {
        if (areaData.coordinates.length === 0) {
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: logoGreen }} />
                        <p className={theme.textMuted}>No location data available</p>
                    </div>
                </div>
            );
        }

        // Create a custom div icon for better compatibility
        const customIcon = L.divIcon({
            html: `<div style="background-color: ${logoGreen}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
            className: 'custom-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });

        const polygonPositions = areaData.coordinates.map((coord: any) => [coord.lat, coord.lon] as LatLngExpression);

        return (
            <MapContainer
                center={mapCenter as LatLngExpression}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                className="leaflet-container"
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapBoundsSetter coordinates={areaData.coordinates} />

                {areaData.coordinates.length === 1 ? (
                    <Marker
                        position={[areaData.coordinates[0].lat, areaData.coordinates[0].lon] as LatLngExpression}
                        icon={customIcon as L.Icon<L.IconOptions>}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold" style={{ color: logoGreen }}>{areaData.name}</h3>
                                <p className="text-sm">Lat: {areaData.coordinates[0].lat.toFixed(4)}</p>
                                <p className="text-sm">Lon: {areaData.coordinates[0].lon.toFixed(4)}</p>
                                <p className="text-sm">Area: {areaData.area_covered}</p>
                            </div>
                        </Popup>
                    </Marker>
                ) : (
                    <>
                        <Polygon
                            pathOptions={{
                                fillColor: logoGreen,
                                color: logoGreen,
                                fillOpacity: 0.3,
                                weight: 2
                            }}
                            positions={polygonPositions}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold" style={{ color: logoGreen }}>{areaData.name}</h3>
                                    <p className="text-sm">Area: {areaData.area_covered}</p>
                                    <p className="text-sm">Coordinates: {areaData.coordinates.length} points</p>
                                </div>
                            </Popup>
                        </Polygon>
                        
                        {/* Add markers for each coordinate point */}
                        {areaData.coordinates.map((coord: any, index: number) => (
                            <Marker
                                key={index}
                                position={[coord.lat, coord.lon] as LatLngExpression}
                                icon={L.divIcon({
                                    html: `<div style="background-color: ${logoGreen}; width: 8px; height: 8px; border-radius: 50%; border: 1px solid white;"></div>`,
                                    className: 'small-marker',
                                    iconSize: [8, 8],
                                    iconAnchor: [4, 4],
                                })}
                            />
                        ))}
                    </>
                )}
            </MapContainer>
        );
    };

    const handleResetView = () => {
        if (areaData.coordinates.length > 0) {
            const avgLat = areaData.coordinates.reduce((sum: number, c: any) => sum + c.lat, 0) / areaData.coordinates.length;
            const avgLon = areaData.coordinates.reduce((sum: number, c: any) => sum + c.lon, 0) / areaData.coordinates.length;
            setMapCenter([avgLat, avgLon]);
            setMapZoom(12);
        }
    };

    return (
        <div className="space-y-6">
            {/* Map Card */}
            <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg shadow-gray-200/50`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">Area of Interest</h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                                Production Area
                            </span>
                        </div>
                        <p className={`text-sm ${theme.textMuted}`}>{areaData.name} • {areaData.area_covered}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleResetView}
                            className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                            style={{ color: logoGreen }}
                            title="Reset view"
                        >
                            <Target className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setMapZoom(mapZoom + 1)}
                            className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                            style={{ color: logoGreen }}
                            title="Zoom in"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setMapZoom(Math.max(mapZoom - 1, 1))}
                            className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                            style={{ color: logoGreen }}
                            title="Zoom out"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setShowFullMap(!showFullMap)}
                            className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                            style={{ color: logoGreen }}
                            title={showFullMap ? "Minimize map" : "Maximize map"}
                        >
                            {showFullMap ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className={`${showFullMap ? 'h-[600px]' : 'h-96'} rounded-lg overflow-hidden border ${theme.border} relative`}>
                    <MapDisplay />
                    <div className="absolute top-2 right-2 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: logoGreen, opacity: 0.3 }}></div>
                                <span className={theme.textMuted}>Area</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: logoGreen }}></div>
                                <span className={theme.textMuted}>Points</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coordinates Table */}
                {areaData.coordinates.length > 0 && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold">Boundary Coordinates</h4>
                            <span className={`text-xs px-3 py-1 rounded-full ${theme.bg} ${theme.border}`}>
                                {areaData.coordinates.length} points
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={`border-b ${theme.border}`}>
                                        <th className="py-2 px-3 text-left font-medium text-xs">#</th>
                                        <th className="py-2 px-3 text-left font-medium text-xs">Latitude</th>
                                        <th className="py-2 px-3 text-left font-medium text-xs">Longitude</th>
                                        <th className="py-2 px-3 text-left font-medium text-xs">Point ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {areaData.coordinates.slice(0, 10).map((coord: any, index: number) => (
                                        <tr key={index} className={`border-b ${theme.border} ${theme.hoverBg}`}>
                                            <td className="py-2 px-3 text-sm">{index + 1}</td>
                                            <td className="py-2 px-3 text-sm font-mono">{coord.lat.toFixed(6)}</td>
                                            <td className="py-2 px-3 text-sm font-mono">{coord.lon.toFixed(6)}</td>
                                            <td className="py-2 px-3 text-sm">{coord._id || `PT-${index + 1}`}</td>
                                        </tr>
                                    ))}
                                    {areaData.coordinates.length > 10 && (
                                        <tr>
                                            <td colSpan={4} className="py-2 px-3 text-center text-sm text-gray-500">
                                                ... and {areaData.coordinates.length - 10} more coordinates
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Area Details */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border ${theme.border} ${theme.hoverBg} transition-colors`}>
                        <p className={`text-xs ${theme.textMuted} mb-1`}>Total Boundary Points</p>
                        <p className="text-lg font-semibold">{areaData.coordinates.length}</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${theme.border} ${theme.hoverBg} transition-colors`}>
                        <p className={`text-xs ${theme.textMuted} mb-1`}>Area Name</p>
                        <p className="text-lg font-semibold">{areaData.name}</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${theme.border} ${theme.hoverBg} transition-colors`}>
                        <p className={`text-xs ${theme.textMuted} mb-1`}>Area Covered</p>
                        <p className="text-lg font-semibold">{areaData.area_covered}</p>
                    </div>
                </div>
            </div>

            {/* Geographic Information Card */}
            <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg shadow-gray-200/50`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">Geographic Information</h3>
                        <p className={`text-sm ${theme.textMuted}`}>Technical details about the area of interest</p>
                    </div>
                    <Navigation className="w-5 h-5" style={{ color: logoGreen }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-3">Coordinate System</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className={theme.textMuted}>Coordinate System</span>
                                <span className="font-medium">WGS 84</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className={theme.textMuted}>Map Projection</span>
                                <span className="font-medium">EPSG:4326</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className={theme.textMuted}>Data Source</span>
                                <span className="font-medium">GPS Survey</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className={theme.textMuted}>Format</span>
                                <span className="font-medium">GeoJSON Compatible</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Area Statistics</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className={theme.textMuted}>Min Latitude</span>
                                <span className="font-mono text-sm">
                                    {areaData.coordinates.length > 0
                                        ? Math.min(...areaData.coordinates.map((c: any) => c.lat)).toFixed(6)
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className={theme.textMuted}>Max Latitude</span>
                                <span className="font-mono text-sm">
                                    {areaData.coordinates.length > 0
                                        ? Math.max(...areaData.coordinates.map((c: any) => c.lat)).toFixed(6)
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className={theme.textMuted}>Min Longitude</span>
                                <span className="font-mono text-sm">
                                    {areaData.coordinates.length > 0
                                        ? Math.min(...areaData.coordinates.map((c: any) => c.lon)).toFixed(6)
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className={theme.textMuted}>Max Longitude</span>
                                <span className="font-mono text-sm">
                                    {areaData.coordinates.length > 0
                                        ? Math.max(...areaData.coordinates.map((c: any) => c.lon)).toFixed(6)
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Metadata Card */}
            {metadata && (
                <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg shadow-gray-200/50`}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold">API Metadata</h3>
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                                    System Information
                                </span>
                            </div>
                            <p className={`text-sm ${theme.textMuted}`}>Version and generation details for this data</p>
                        </div>
                        <Info className="w-5 h-5" style={{ color: logoGreen }} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-xl border ${theme.border} ${theme.hoverBg} transition-colors`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <p className={`text-xs ${theme.textMuted}`}>API Version</p>
                            </div>
                            <p className="text-lg font-semibold font-mono">{metadata.api_version}</p>
                            <p className="text-xs text-gray-500 mt-1">ghg_emissions endpoint</p>
                        </div>

                        <div className={`p-4 rounded-xl border ${theme.border} ${theme.hoverBg} transition-colors`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <p className={`text-xs ${theme.textMuted}`}>Calculation Version</p>
                            </div>
                            <p className="text-lg font-semibold font-mono">{metadata.calculation_version}</p>
                            <p className="text-xs text-gray-500 mt-1">Carbon accounting logic</p>
                        </div>

                        <div className={`p-4 rounded-xl border ${theme.border} ${theme.hoverBg} transition-colors`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <p className={`text-xs ${theme.textMuted}`}>GEE Adapter Version</p>
                            </div>
                            <p className="text-lg font-semibold font-mono">{metadata.gee_adapter_version}</p>
                            <p className="text-xs text-gray-500 mt-1">Google Earth Engine</p>
                        </div>

                        <div className={`p-4 rounded-xl border ${theme.border} ${theme.hoverBg} transition-colors md:col-span-2 lg:col-span-1`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                <p className={`text-xs ${theme.textMuted}`}>Generated At</p>
                            </div>
                            <p className="text-lg font-semibold">
                                {new Date(metadata.generated_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(metadata.generated_at).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>

                        <div className={`p-4 rounded-xl border ${theme.border} ${theme.hoverBg} transition-colors md:col-span-2 lg:col-span-2`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <p className={`text-xs ${theme.textMuted}`}>Endpoint</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-semibold">{metadata.endpoint}</p>
                                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                                    Active
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">GHG Emissions data endpoint</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm ${theme.textMuted}`}>Data Freshness</p>
                                <p className="text-sm">
                                    Generated {new Date(metadata.generated_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm ${theme.textMuted}`}>System Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm">Operational</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationTab;