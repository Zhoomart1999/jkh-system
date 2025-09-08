export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
};

export const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' сом';
};

export const formatDateTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatPhone = (phone: string): string => {
    if (!phone) return '';
    // Простое форматирование телефона
    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
};

export const formatPersonalAccount = (account: string): string => {
    if (!account) return '';
    // Форматирование лицевого счета в формате YYMM0001
    return account.replace(/(\d{2})(\d{2})(\d{4})/, '$1-$2-$3');
}; 