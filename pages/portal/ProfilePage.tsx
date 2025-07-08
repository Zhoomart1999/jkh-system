
import React, { useContext } from 'react';
import Card from '../../components/ui/Card';
import { PortalAuthContext } from '../../context/PortalAuthContext';
import { BuildingType, WaterTariffType } from '../../types';

const ProfilePage: React.FC = () => {
    const auth = useContext(PortalAuthContext);
    const { abonent } = auth || {};

    if (!abonent) {
        return <p>Загрузка...</p>;
    }
    
    const tariffMap = {
        [WaterTariffType.ByMeter]: 'По счетчику',
        [WaterTariffType.ByPerson]: 'По количеству человек',
    };
    const buildingMap = {
        [BuildingType.Apartment]: 'Многоквартирный дом',
        [BuildingType.Private]: 'Частный дом',
    };

    return (
        <Card>
            <h1 className="text-xl font-bold mb-4">Профиль абонента</h1>
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-slate-500">ФИО</p>
                        <p className="font-semibold">{abonent.fullName}</p>
                    </div>
                     <div>
                        <p className="text-sm text-slate-500">Лицевой счет</p>
                        <p className="font-semibold">{abonent.personalAccount}</p>
                    </div>
                     <div>
                        <p className="text-sm text-slate-500">Адрес</p>
                        <p className="font-semibold">{abonent.address}</p>
                    </div>
                     <div>
                        <p className="text-sm text-slate-500">Телефон</p>
                        <p className="font-semibold">{abonent.phone}</p>
                    </div>
                      <div>
                        <p className="text-sm text-slate-500">Тип жилья</p>
                        <p className="font-semibold">{buildingMap[abonent.buildingType]}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Тариф на воду</p>
                        <p className="font-semibold">{tariffMap[abonent.waterTariff]}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Количество проживающих</p>
                        <p className="font-semibold">{abonent.numberOfPeople}</p>
                    </div>
                </div>
                 <p className="text-xs text-slate-500">Для изменения данных, пожалуйста, обратитесь в абонентский отдел.</p>
            </div>
        </Card>
    );
};

export default ProfilePage;