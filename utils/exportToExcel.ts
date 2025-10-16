import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';

export type ColumnFormatter = (value: any, row: any) => string;

export type ColumnDef =
    | string
    |  {
            key: string;
            header?: string;
            width?: number;
            formatter?: ColumnFormatter;
        };

export type ColumnsInput = ColumnDef[];

export type MappingFunction<RowType = any> = (row: RowType) => any;

export type Mapping<RowType = any> = Record<string, string | MappingFunction<RowType>>;

export type ExportOptions = {
    sheetName?: string;
    includeHeader?: boolean;
    autoWidth?: boolean;
    fileName?: string;
};

export type ExportResult = {
    buffer: Buffer;
    fileName?: string;
    mimeType: string;
    size: number;
};

function getValueByPath(source: any, path: string): any {
    if (source == null) return undefined;
    if (!path) return undefined;
    const segments = path.split('.');
    let current: any = source;
    for (const segment of segments) {
        if (current == null) return undefined;
        current = current[segment];
    }
    return current;
}

type NormalizedColumn = {
    key: string;
    header: string;
    width: number | undefined;
    formatter: ColumnFormatter | undefined;
};

function normalizeColumns(columns: ColumnsInput): NormalizedColumn[] {
    return columns.map((col) => {
        if (typeof col === 'string') {
            return { key: col, header: col, width: undefined, formatter: undefined };
        }
        return {
            key: col.key,
            header: col.header ?? col.key,
            width: col.width === undefined ? undefined : col.width,
            formatter: col.formatter === undefined ? undefined : col.formatter,
        };
    });
}

function computeAutoWidths(data: any[][]): number[] {
    const colCount = Math.max(0, ...data.map((r) => r.length));
    const widths: number[] = new Array(colCount).fill(0);
    for (const row of data) {
        for (let c = 0; c < colCount; c++) {
            const cell = row[c];
            const text = cell == null ? '' : String(cell);
            const currentWidth = widths[c] ?? 0;
            widths[c] = Math.max(currentWidth, text.length);
        }
    }
    // Add padding
    return widths.map((w) => Math.min(Math.max(w + 2, 6), 60));
}

export async function exportToExcel<RowType = any>(
    columns: ColumnsInput,
    rows: RowType[],
    mapping: Mapping<RowType>,
    options: ExportOptions = {}
): Promise<ExportResult> {
    const { sheetName = 'Sheet1', includeHeader = true, autoWidth = true } = options;

    const normalized = normalizeColumns(columns);

    // Build AOA body rows from mapping
    const bodyRows: any[][] = rows.map((row) => {
        return normalized.map((col) => {
            const mapEntry = mapping[col.key];
            let value: any;
            if (typeof mapEntry === 'function') {
                value = (mapEntry as MappingFunction<RowType>)(row);
            } else if (typeof mapEntry === 'string') {
                value = getValueByPath(row as any, mapEntry);
            } else {
                // default to direct key access
                value = (row as any)[col.key];
            }
            if (col.formatter) {
                try {
                    return col.formatter(value, row);
                } catch {
                    return value;
                }
            }
            return value;
        });
    });

    const aoa: any[][] = [];
    if (includeHeader) {
        aoa.push(normalized.map((c) => c.header));
    }
    aoa.push(...bodyRows);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Auto width
    if (autoWidth) {
        const widths = computeAutoWidths(aoa);
        (worksheet as any)['!cols'] = widths.map((wch) => ({ wch }));
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const buffer = wbout as Buffer;
    const result: ExportResult = {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: buffer.byteLength,
        ...(options.fileName ? { fileName: options.fileName } : {}),
    };
    return result;
}

export default exportToExcel;


