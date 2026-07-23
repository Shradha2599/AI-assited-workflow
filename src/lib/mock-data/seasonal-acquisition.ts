/** Acquisition windows for seasonal gap items added mid-year to an existing FY plan. */
export interface AcquisitionWindow {
  row: string;
  startMonth: number;
  span: number;
}

/** Jul–Sep acquisition window (month indices: Jul=8, Aug=9, Sep=10) */
const JUL_AUG_SEP: AcquisitionWindow = { row: "Kitchen & Dining", startMonth: 8, span: 3 };

const SEASONAL_ACQUISITION: Record<string, AcquisitionWindow> = {
  "Kitchen & Dining — Halloween": JUL_AUG_SEP,
  Halloween: JUL_AUG_SEP,
};

const DEFAULT_ACQUISITION: AcquisitionWindow = JUL_AUG_SEP;

export function getAcquisitionWindow(category: string, itemIndex = 0): AcquisitionWindow {
  const base = SEASONAL_ACQUISITION[category] ?? DEFAULT_ACQUISITION;
  return { ...base };
}
