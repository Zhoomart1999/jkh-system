import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { api } from '../../../services/api';
import { GISObject, GISObjectType } from '../../../types';
import { MapPinIcon, WrenchIcon, UsersIcon, SaveIcon, SearchIcon, FilterIcon, LocationMarkerIcon } from '../../../components/ui/Icons';
import Modal from '../../../components/ui/Modal';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
// @ts-ignore
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRef } from 'react';

// Создаем профессиональные иконки для разных типов объектов
const createCustomIcon = (type: GISObjectType, status: 'ok' | 'warning' | 'error') => {
    const statusColors = {
        ok: '#10B981',      // green
        warning: '#F59E0B', // amber
        error: '#EF4444'    // red
    };
    
    const typeIcons = {
        [GISObjectType.Pipe]: '🔧',
        [GISObjectType.Valve]: '🔩',
        [GISObjectType.Hydrant]: '🧯',
        [GISObjectType.Abonent]: '🏠'
    };
    
    const color = statusColors[status];
    const icon = typeIcons[type];
    
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background: white;
                border: 3px solid ${color};
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
                ${icon}
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

const GISObjectFormModal: React.FC<{onSave: () => void, onClose: () => void}> = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: GISObjectType.Pipe,
        status: 'ok' as 'ok' | 'warning' | 'error',
        address: '',
        description: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await api.addGISObject(formData);
        setIsSaving(false);
        onSave();
    };

    return (
        <Modal title="Добавить объект на карту" isOpen={true} onClose={onClose} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Название объекта</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                            placeholder="Например: Задвижка №1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Тип объекта</label>
                        <select 
                            value={formData.type} 
                            onChange={e => setFormData({...formData, type: e.target.value as GISObjectType})} 
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={GISObjectType.Pipe}>Труба</option>
                            <option value={GISObjectType.Valve}>Задвижка</option>
                            <option value={GISObjectType.Hydrant}>Гидрант</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Адрес</label>
                    <input 
                        type="text" 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="ул. Ленина, 123"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Описание</label>
                    <textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Дополнительная информация об объекте"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Статус</label>
                    <select 
                        value={formData.status} 
                        onChange={e => setFormData({...formData, status: e.target.value as 'ok' | 'warning' | 'error'})} 
                        required 
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="ok">✅ Работает нормально</option>
                        <option value="warning">⚠️ Требует внимания</option>
                        <option value="error">❌ Неисправен</option>
                    </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">Отмена</button>
                    <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-300">
                        <SaveIcon className="w-5 h-5"/>
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </form>
        </Modal>
    )
};

// Улучшенная функция генерации координат с учетом реальных районов
const getRealisticCoords = (type: GISObjectType) => {
    // Разные зоны для разных типов объектов
    const zones = {
        [GISObjectType.Pipe]: [
            { lat: 42.87, lng: 74.6, radius: 0.02 },    // Центр
            { lat: 42.89, lng: 74.58, radius: 0.015 },  // Север
            { lat: 42.85, lng: 74.62, radius: 0.015 }   // Юг
        ],
        [GISObjectType.Valve]: [
            { lat: 42.87, lng: 74.6, radius: 0.01 },    // Центр
            { lat: 42.89, lng: 74.58, radius: 0.008 }   // Север
        ],
        [GISObjectType.Hydrant]: [
            { lat: 42.87, lng: 74.6, radius: 0.015 },   // Центр
            { lat: 42.85, lng: 74.62, radius: 0.012 }   // Юг
        ],
        [GISObjectType.Abonent]: [
            { lat: 42.87, lng: 74.6, radius: 0.03 },    // Центр
            { lat: 42.89, lng: 74.58, radius: 0.025 },  // Север
            { lat: 42.85, lng: 74.62, radius: 0.025 }   // Юг
        ]
    };
    
    const zone = zones[type][Math.floor(Math.random() * zones[type].length)];
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * zone.radius;
    
    return {
        lat: zone.lat + radius * Math.cos(angle),
        lng: zone.lng + radius * Math.sin(angle)
    };
};

function FlyToLocation({ position }: { position: [number, number] | null }) {
    const map = useMap();
    React.useEffect(() => {
        if (position) map.flyTo(position, 17, { duration: 1.5 });
    }, [position]);
    return null;
}

const MapTab: React.FC = () => {
    const [gisObjects, setGisObjects] = useState<GISObject[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedObject, setSelectedObject] = useState<GISObject | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [layers, setLayers] = useState<Record<GISObjectType, boolean>>({
        [GISObjectType.Abonent]: true,
        [GISObjectType.Pipe]: true,
        [GISObjectType.Valve]: true,
        [GISObjectType.Hydrant]: true,
    });
    const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'warning' | 'error'>('all');
    const [search, setSearch] = useState('');
    const [foundObject, setFoundObject] = useState<GISObject | null>(null);
    const [myLocation, setMyLocation] = useState<[number, number] | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const fetchData = () => {
        setLoading(true);
        api.getGISData().then(data => {
            setGisObjects(data);
            setLoading(false);
        });
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleLayerToggle = (type: GISObjectType) => {
        setLayers(prev => ({ ...prev, [type]: !prev[type] }));
    };
    
    const handleSave = () => {
        setIsModalOpen(false);
        fetchData();
    };

    // Фильтрация объектов
    const filteredObjects = gisObjects.filter(obj => {
        const layerVisible = layers[obj.type];
        const statusMatch = statusFilter === 'all' || obj.status === statusFilter;
        const searchMatch = !search || 
            obj.name.toLowerCase().includes(search.toLowerCase()) ||
            ((obj as any).address && (obj as any).address.toLowerCase().includes(search.toLowerCase()));
        
        return layerVisible && statusMatch && searchMatch;
    });

    // Группировка объектов по близости для кластеризации
    const groupNearbyObjects = (objects: GISObject[]) => {
        const groups: GISObject[][] = [];
        const processed = new Set<string>();
        
        objects.forEach(obj => {
            if (processed.has(obj.id)) return;
            
            const group = [obj];
            processed.add(obj.id);
            
            objects.forEach(otherObj => {
                if (processed.has(otherObj.id)) return;
                
                const distance = Math.sqrt(
                    Math.pow((obj.lat || 0) - (otherObj.lat || 0), 2) +
                    Math.pow((obj.lng || 0) - (otherObj.lng || 0), 2)
                );
                
                if (distance < 0.002) { // Очень близкие объекты
                    group.push(otherObj);
                    processed.add(otherObj.id);
                }
            });
            
            groups.push(group);
        });
        
        return groups;
    };

    const objectGroups = groupNearbyObjects(filteredObjects.map(obj => {
        if (obj.lat && obj.lng) return obj;
        const coords = getRealisticCoords(obj.type);
        return { ...obj, lat: coords.lat, lng: coords.lng };
    }));

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!search.trim()) return;
        
        const found = filteredObjects.find(obj =>
            obj.name.toLowerCase().includes(search.toLowerCase()) ||
            ((obj as any).address && (obj as any).address.toLowerCase().includes(search.toLowerCase()))
        );
        setFoundObject(found || null);
        if (found) setSelectedObject(found);
    };

    const handleMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                setMyLocation([pos.coords.latitude, pos.coords.longitude]);
            }, () => {
                alert('Не удалось определить ваше местоположение');
            });
        } else {
            alert('Геолокация не поддерживается в вашем браузере');
        }
    };

    const getStatusStats = () => {
        const stats = { ok: 0, warning: 0, error: 0 };
        filteredObjects.forEach(obj => {
            stats[obj.status]++;
        });
        return stats;
    };

    const statusStats = getStatusStats();

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-semibold">Интерактивная карта (ГИС)</h2>
                    <p className="text-sm text-slate-500">Управление инфраструктурными объектами</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <MapPinIcon className="w-5 h-5"/>
                    Добавить объект
                </button>
            </div>

            {/* Улучшенная панель поиска и фильтров */}
            <div className="mb-4 space-y-3">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Поиск по названию или адресу..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-md w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                        Найти
                    </button>
                    <button 
                        type="button" 
                        onClick={handleMyLocation} 
                        className="bg-slate-200 px-3 py-2 rounded-md hover:bg-slate-300 transition-colors flex items-center gap-1"
                    >
                        <LocationMarkerIcon className="w-4 h-4"/>
                        Моё местоположение
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setShowFilters(!showFilters)}
                        className="bg-slate-200 px-3 py-2 rounded-md hover:bg-slate-300 transition-colors flex items-center gap-1"
                    >
                        <FilterIcon className="w-4 h-4"/>
                        Фильтры
                    </button>
                </form>

                {/* Панель фильтров */}
                {showFilters && (
                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Фильтр по статусу</label>
                                <select 
                                    value={statusFilter} 
                                    onChange={e => setStatusFilter(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                >
                                    <option value="all">Все статусы</option>
                                    <option value="ok">✅ Работает нормально</option>
                                    <option value="warning">⚠️ Требует внимания</option>
                                    <option value="error">❌ Неисправен</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Статистика</label>
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span>✅ Работает:</span>
                                        <span className="font-semibold text-emerald-600">{statusStats.ok}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>⚠️ Внимание:</span>
                                        <span className="font-semibold text-amber-600">{statusStats.warning}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>❌ Неисправен:</span>
                                        <span className="font-semibold text-red-600">{statusStats.error}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <div className="flex-grow relative">
                    <MapContainer 
                        center={myLocation || [42.87, 74.6]} 
                        zoom={13} 
                        style={{ height: 600, width: '100%' }}
                        className="rounded-lg border border-slate-200"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />
                        
                        {/* Моё местоположение */}
                        {myLocation && (
                            <CircleMarker 
                                center={myLocation} 
                                radius={8} 
                                pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.7 }}
                            >
                                <Popup>
                                    <div className="text-center">
                                        <LocationMarkerIcon className="w-6 h-6 mx-auto mb-1 text-blue-600"/>
                                        <strong>Вы здесь</strong>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        )}

                        {/* Объекты на карте */}
                        {objectGroups.map((group, groupIndex) => {
                            if (group.length === 1) {
                                // Одиночный объект
                                const obj = group[0];
                                return (
                                    <Marker
                                        key={obj.id}
                                        position={[obj.lat as number, obj.lng as number]}
                                        icon={createCustomIcon(obj.type, obj.status)}
                                        eventHandlers={{
                                            click: () => setSelectedObject(obj)
                                        }}
                                    >
                                        <Popup>
                                            <div className="min-w-[200px]">
                                                <h3 className="font-bold text-lg mb-2">{obj.name}</h3>
                                                <div className="space-y-1 text-sm">
                                                    <p><strong>Тип:</strong> {obj.type}</p>
                                                    <p><strong>Статус:</strong> 
                                                        <span className={`ml-1 ${
                                                            obj.status === 'ok' ? 'text-emerald-600' :
                                                            obj.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                                                        }`}>
                                                            {obj.status === 'ok' ? '✅ Работает' :
                                                             obj.status === 'warning' ? '⚠️ Внимание' : '❌ Неисправен'}
                                                        </span>
                                                    </p>
                                                    {(obj as any).address && (
                                                        <p><strong>Адрес:</strong> {(obj as any).address}</p>
                                                    )}
                                                    {(obj as any).description && (
                                                        <p><strong>Описание:</strong> {(obj as any).description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            } else {
                                // Группа объектов - показываем кластер
                                const centerLat = group.reduce((sum, obj) => sum + (obj.lat || 0), 0) / group.length;
                                const centerLng = group.reduce((sum, obj) => sum + (obj.lng || 0), 0) / group.length;
                                
                                return (
                                    <CircleMarker
                                        key={`cluster-${groupIndex}`}
                                        center={[centerLat, centerLng]}
                                        radius={Math.min(20 + group.length * 3, 40)}
                                        pathOptions={{ 
                                            color: '#3B82F6', 
                                            fillColor: '#3B82F6', 
                                            fillOpacity: 0.7 
                                        }}
                                        eventHandlers={{
                                            click: () => setSelectedObject(group[0])
                                        }}
                                    >
                                        <Popup>
                                            <div className="text-center">
                                                <div className="text-lg font-bold">{group.length}</div>
                                                <div className="text-sm">объектов</div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {group.map(obj => obj.type).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                                                </div>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                );
                            }
                        })}

                        <FlyToLocation position={foundObject ? [foundObject.lat as number, foundObject.lng as number] : myLocation} />
                    </MapContainer>
                </div>

                {/* Боковая панель */}
                <div className="w-80 space-y-4">
                    {/* Слои */}
                    <Card>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <FilterIcon className="w-5 h-5"/>
                            Слои карты
                        </h3>
                        <div className="space-y-2">
                            {Object.values(GISObjectType).map(type => (
                                <div key={type} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`layer-${type}`}
                                            checked={layers[type]}
                                            onChange={() => handleLayerToggle(type)}
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`layer-${type}`} className="text-sm capitalize cursor-pointer">
                                            {type === 'pipe' ? 'Трубы' :
                                             type === 'valve' ? 'Задвижки' :
                                             type === 'hydrant' ? 'Гидранты' : 'Абоненты'}
                                        </label>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        {filteredObjects.filter(obj => obj.type === type).length}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Информация об объекте */}
                    <Card>
                        <h3 className="font-semibold mb-3">Информация об объекте</h3>
                        {selectedObject ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <h4 className="font-bold text-lg mb-2">{selectedObject.name}</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Тип:</span>
                                            <span className="font-medium capitalize">{selectedObject.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Статус:</span>
                                            <span className={`font-medium ${
                                                selectedObject.status === 'ok' ? 'text-emerald-600' :
                                                selectedObject.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                                            }`}>
                                                {selectedObject.status === 'ok' ? '✅ Работает' :
                                                 selectedObject.status === 'warning' ? '⚠️ Внимание' : '❌ Неисправен'}
                                            </span>
                                        </div>
                                        {(selectedObject as any).address && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Адрес:</span>
                                                <span className="font-medium">{(selectedObject as any).address}</span>
                                            </div>
                                        )}
                                        {(selectedObject as any).description && (
                                            <div>
                                                <span className="text-slate-600 block mb-1">Описание:</span>
                                                <p className="text-sm bg-white p-2 rounded border">{(selectedObject as any).description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                                        Редактировать
                                    </button>
                                    {selectedObject.type === 'abonent' && (
                                        <button className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-md text-sm hover:bg-emerald-700 transition-colors">
                                            Перейти к абоненту
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <MapPinIcon className="w-12 h-12 mx-auto mb-2 text-slate-300"/>
                                <p>Выберите объект на карте</p>
                                <p className="text-xs mt-1">для просмотра информации</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            
            {isModalOpen && <GISObjectFormModal onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </Card>
    );
};

export default MapTab;