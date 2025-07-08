import React from 'react';
import { CheckNoticeZoneGroup, BuildingType, WaterTariffType, AbonentStatus } from '../../../types';
import ControllerReportTable from '../../../components/templates/ControllerReportTable';

interface CheckNoticeTemplateProps {
    data: CheckNoticeZoneGroup[];
}

export const CheckNoticeTemplate: React.FC<CheckNoticeTemplateProps> = ({ data }) => {
    // Собираем всех абонентов из всех зон в один массив
    const abonents = data.flatMap(zone => zone.abonents.map(a => ({
        id: a.id,
        fullName: a.fullName,
        address: a.address,
        phone: '',
        numberOfPeople: 1,
        buildingType: BuildingType.Private,
        waterTariff: WaterTariffType.ByPerson,
        status: AbonentStatus.Active,
        balance: a.balance,
        createdAt: '',
        hasGarden: false,
        personalAccount: '',
    })));
    return <ControllerReportTable abonents={abonents} />;
};
