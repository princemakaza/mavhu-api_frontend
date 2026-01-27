import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import {
    MapPin,
    Maximize2,
    Minimize2,
    Navigation,
    Layers,
    ZoomIn,
    ZoomOut,
    Target,
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

interface LocationTabProps {
    themeClasses: ThemeClasses;
    logoGreen: string;
    isDarkMode: boolean;
    coordinates: any[];
    areaName: string;
    areaCovered: string;
}

const LocationTab: React.FC<LocationTabProps> = ({
    themeClasses,
    logoGreen,
    isDarkMode,
    coordinates,
    areaName,
    areaCovered,
}) => {
    const [mapZoom, setMapZoom] = useState(10);
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

    // Map Component
    const MapDisplay = () => {
        if (coordinates.length === 0) {
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: logoGreen }} />
                        <p className={themeClasses.textMuted}>No location data available</p>
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

        const polygonPositions = coordinates.map((coord: any) => [coord.lat, coord.lon] as LatLngExpression);

        return (
            <MapContainer
                center={mapCenter as LatLngExpression}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                className="leaflet-container"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={isDarkMode
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    }
                />

                {coordinates.length === 1 ? (
                    <Marker
                        position={[coordinates[0].lat, coordinates[0].lon] as LatLngExpression}
                        icon={customIcon as L.Icon<L.IconOptions>}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold" style={{ color: logoGreen }}>{areaName}</h3>
                                <p className="text-sm">Lat: {coordinates[0].lat.toFixed(4)}</p>
                                <p className="text-sm">Lon: {coordinates[0].lon.toFixed(4)}</p>
                                <p className="text-sm">Area: {areaCovered}</p>
                            </div>
                        </Popup>
                    </Marker>
                ) : (
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
                                <h3 className="font-bold" style={{ color: logoGreen }}>{areaName}</h3>
                                <p className="text-sm">Area: {areaCovered}</p>
                                <p className="text-sm">Coordinates: {coordinates.length} points</p>
                            </div>
                        </Popup>
                    </Polygon>
                )}
            </MapContainer>
        );
    };

    return (
        <div className="space-y-6">
            {/* Map Card */}
            <div className={`${themeClasses.cardBg} backdrop-blur-xl rounded-2xl border ${themeClasses.border} p-6 shadow-lg ${isDarkMode ? "shadow-black/20" : "shadow-gray-200/50"}`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">Production Area</h3>
                        <p className={`text-sm ${themeClasses.textMuted}`}>{areaName} • {areaCovered}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setMapZoom(mapZoom + 1)}
                            className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                            style={{ color: logoGreen }}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setMapZoom(mapZoom - 1)}
                            className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                            style={{ color: logoGreen }}
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setShowFullMap(!showFullMap)}
                            className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                            style={{ color: logoGreen }}
                        >
                            {showFullMap ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className={`${showFullMap ? 'h-[600px]' : 'h-96'} rounded-lg overflow-hidden border ${themeClasses.border}`}>
                    <MapDisplay />
                </div>

                {/* Coordinates Table */}
                {coordinates.length > 0 && (
                    <div className="mt-6">
                        <h4 className="font-semibold mb-4">Coordinates</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={`border-b ${themeClasses.border}`}>
                                        <th className="py-2 px-3 text-left font-medium">#</th>
                                        <th className="py-2 px-3 text-left font-medium">Latitude</th>
                                        <th className="py-2 px-3 text-left font-medium">Longitude</th>
                                        <th className="py-2 px-3 text-left font-medium">ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coordinates.slice(0, 10).map((coord: any, index: number) => (
                                        <tr key={index} className={`border-b ${themeClasses.border}`}>
                                            <td className="py-2 px-3">{index + 1}</td>
                                            <td className="py-2 px-3">{coord.lat.toFixed(6)}</td>
                                            <td className="py-2 px-3">{coord.lon.toFixed(6)}</td>
                                            <td className="py-2 px-3">{coord._id || 'N/A'}</td>
                                        </tr>
                                    ))}
                                    {coordinates.length > 10 && (
                                        <tr>
                                            <td colSpan={4} className="py-2 px-3 text-center text-sm text-gray-500">
                                                ... and {coordinates.length - 10} more coordinates
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Location Details */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border ${themeClasses.border}`}>
                        <p className={`text-xs ${themeClasses.textMuted}`}>Total Points</p>
                        <p className="text-lg font-semibold">{coordinates.length}</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${themeClasses.border}`}>
                        <p className={`text-xs ${themeClasses.textMuted}`}>Area Name</p>
                        <p className="text-lg font-semibold">{areaName}</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${themeClasses.border}`}>
                        <p className={`text-xs ${themeClasses.textMuted}`}>Area Covered</p>
                        <p className="text-lg font-semibold">{areaCovered}</p>
                    </div>
                </div>
            </div>

            {/* Additional Location Information */}
            <div className={`${themeClasses.cardBg} backdrop-blur-xl rounded-2xl border ${themeClasses.border} p-6 shadow-lg ${isDarkMode ? "shadow-black/20" : "shadow-gray-200/50"}`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">Location Details</h3>
                        <p className={`text-sm ${themeClasses.textMuted}`}>Additional information about the production area</p>
                    </div>
                    <Navigation className="w-5 h-5" style={{ color: logoGreen }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-3">Geographic Information</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className={themeClasses.textMuted}>Coordinate System</span>
                                <span>WGS 84</span>
                            </div>
                            <div className="flex justify-between">
                                <span className={themeClasses.textMuted}>Map Projection</span>
                                <span>EPSG:4326</span>
                            </div>
                            <div className="flex justify-between">
                                <span className={themeClasses.textMuted}>Data Source</span>
                                <span>GPS Survey</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Area Statistics</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className={themeClasses.textMuted}>Minimum Latitude</span>
                                <span>
                                    {coordinates.length > 0
                                        ? Math.min(...coordinates.map((c: any) => c.lat)).toFixed(6)
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className={themeClasses.textMuted}>Maximum Latitude</span>
                                <span>
                                    {coordinates.length > 0
                                        ? Math.max(...coordinates.map((c: any) => c.lat)).toFixed(6)
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className={themeClasses.textMuted}>Center Point</span>
                                <span>
                                    {mapCenter[0].toFixed(6)}, {mapCenter[1].toFixed(6)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationTab;