import ClassicReceiptTemplate from './ClassicReceiptTemplate';
import MinimalReceiptTemplate from './MinimalReceiptTemplate';
import RealisticReceiptTemplate from './RealisticReceiptTemplate';
import { CompactReceiptTemplate } from './CompactReceiptTemplate';
import { FC } from 'react';
import { ReceiptDetails } from '../../types';

export type ReceiptTemplateKey = 'classic' | 'minimal' | 'realistic' | 'compact';

export const receiptTemplates: Record<ReceiptTemplateKey, FC<{ details: ReceiptDetails }>> = {
  classic: ClassicReceiptTemplate,
  minimal: MinimalReceiptTemplate,
  realistic: RealisticReceiptTemplate,
  compact: CompactReceiptTemplate,
}; 