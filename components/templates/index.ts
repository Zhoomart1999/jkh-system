import ClassicReceiptTemplate from './ClassicReceiptTemplate';
import MinimalReceiptTemplate from './MinimalReceiptTemplate';
import { FC } from 'react';
import { ReceiptDetails } from '../../types';

export type ReceiptTemplateKey = 'classic' | 'minimal';

export const receiptTemplates: Record<ReceiptTemplateKey, FC<{ details: ReceiptDetails }>> = {
  classic: ClassicReceiptTemplate,
  minimal: MinimalReceiptTemplate,
}; 