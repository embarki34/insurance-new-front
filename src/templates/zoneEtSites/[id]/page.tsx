import { useEffect, useState } from 'react';
import { ZoneDetailsOutput, SiteOutput } from '@/lib/output-Types';
import { useParams } from 'react-router-dom';
import { getZoneById } from '@/data/zone.service';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from 'lucide-react';
import SiteCard from '@/components/site-card';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AddSite from './add-Site';
import { Input } from "@/components/ui/input";

function ZoneDetails() {
    const { id } = useParams();
    const [zone, setZone] = useState<ZoneDetailsOutput>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [refresh, setRefresh] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        setLoading(true);
        getZoneById(id as string)
            .then((zone) => {
                setZone(zone);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch zone:", err);
                setError("Failed to load zone details. Please try again later.");
                setLoading(false);
            });
    }, [id, refresh]);

    const handleAddSite = () => {
        setRefresh(!refresh);
    }

    const handleEditSite = () => {
        setRefresh(!refresh);
    }

    // Calculate zone statistics
    const calculateStats = () => {
        if (!zone?.sites || zone.sites.length === 0) {
            return { totalSites: 0, totalBuiltSurface: 0, totalUnbuiltSurface: 0, totalValue: 0 };
        }

        return zone.sites.reduce((acc, site) => {
            return {
                totalSites: acc.totalSites + 1,
                totalBuiltSurface: acc.totalBuiltSurface + site.builtSurface,
                totalUnbuiltSurface: acc.totalUnbuiltSurface + site.unbuiltSurface,
                totalValue: acc.totalValue + site.totalValue,
            };
        }, { totalSites: 0, totalBuiltSurface: 0, totalUnbuiltSurface: 0, totalValue: 0 });
    };

    const stats = calculateStats();

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const filteredSites = zone?.sites.filter(site => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return site.name.toLowerCase().includes(lowerCaseSearchTerm) || 
               site.builtSurface?.toString().toLowerCase().includes(lowerCaseSearchTerm) || 
               site.unbuiltSurface?.toString().toLowerCase().includes(lowerCaseSearchTerm) || 
               site.totalValue?.toString().toLowerCase().includes(lowerCaseSearchTerm);
    }) || [];

    if (loading) {
        return (
            <div className="container mx-auto py-6 max-w-7xl">
                <div className="flex flex-col gap-8">
                    <Skeleton className="h-12 w-1/3" />
                    <Skeleton className="h-6 w-1/2" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-40" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-64" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-16 max-w-8xl">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="flex flex-col items-center py-10">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={() => window.history.back()}>Go Back</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 max-w-8xl">
            {/* Zone Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{zone?.name}</h1>
                        <div className="flex items-center mt-2 text-slate-500">
                            <MapPin className="h-4 w-4 mr-2" />
                            <p>{zone?.address}</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <AddSite zoneId={id as string} onAdd={handleAddSite} />
                    </div>
                </div>
            </div>

            {/* Zone Stats */}
            <Card className="mb-8 border-slate-200 bg-slate-50">
                <CardHeader>
                    <CardTitle className="text-lg">Zone Overview</CardTitle>
                    <CardDescription>Summary statistics for this zone</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                            <p className="text-sm text-slate-500 font-medium mb-1">Total Sites</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.totalSites}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                            <p className="text-sm text-slate-500 font-medium mb-1">Total Built Surface</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.totalBuiltSurface.toLocaleString()} m²</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                            <p className="text-sm text-slate-500 font-medium mb-1">Total Unbuilt Surface</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.totalUnbuiltSurface.toLocaleString()} m²</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                            <p className="text-sm text-slate-500 font-medium mb-1">Total Value</p>
                            <p className="text-2xl font-bold text-green-600">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'DZD',
                                    maximumFractionDigits: 0
                                }).format(stats.totalValue)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sites List */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Sites</h2>
                 
                    <div className='flex items-center gap-2'>
                        <Input type='text' placeholder='Search' value={searchTerm} onChange={handleSearch} />
                    </div>
                </div>

                {filteredSites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-6">
                        {filteredSites.map((site: SiteOutput) => (
                            <SiteCard key={site.id} site={site} onEdit={handleEditSite} />
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed border-2 border-slate-200">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Building2 className="h-12 w-12 text-slate-300 mb-4" />
                            <p className="text-slate-500 text-center">No sites found in this zone.</p>
                            <p className="text-slate-400 text-sm text-center mt-2">Sites added to this zone will appear here.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default ZoneDetails;