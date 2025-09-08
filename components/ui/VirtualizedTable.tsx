import React from 'react';

interface VirtualizedTableProps<T> {
    data: T[];
    height: number;
    itemHeight: number;
    getItemId: (item: T) => string;
    selectedItems: Set<string>;
    onSelectionChange: (items: Set<string>) => void;
    onRowClick: (item: T) => void;
    columns: Array<{
        key: string;
        header: React.ReactNode;
        width: number;
        render: (item: T) => React.ReactNode;
    }>;
}

export function VirtualizedTable<T>({
    data,
    height,
    itemHeight,
    getItemId,
    selectedItems,
    onSelectionChange,
    onRowClick,
    columns
}: VirtualizedTableProps<T>) {
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(data.map(getItemId));
            onSelectionChange(allIds);
        } else {
            onSelectionChange(new Set());
        }
    };

    const handleSelectItem = (itemId: string, checked: boolean) => {
        const newSelection = new Set(selectedItems);
        if (checked) {
            newSelection.add(itemId);
        } else {
            newSelection.delete(itemId);
        }
        onSelectionChange(newSelection);
    };

    const isAllSelected = data.length > 0 && selectedItems.size === data.length;
    const isIndeterminate = selectedItems.size > 0 && selectedItems.size < data.length;

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: column.width }}
                            >
                                {column.key === 'select' ? (
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={(input) => {
                                            if (input) input.indeterminate = isIndeterminate;
                                        }}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                ) : (
                                    column.header
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => {
                        const itemId = getItemId(item);
                        const isSelected = selectedItems.has(itemId);
                        
                        return (
                            <tr
                                key={itemId}
                                className={`hover:bg-gray-50 cursor-pointer ${
                                    isSelected ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => onRowClick(item)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="px-6 py-4 whitespace-nowrap"
                                        onClick={(e) => {
                                            if (column.key === 'select') {
                                                e.stopPropagation();
                                            }
                                        }}
                                    >
                                        {column.key === 'select' ? (
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => handleSelectItem(itemId, e.target.checked)}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        ) : (
                                            column.render(item)
                                        )}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
} 