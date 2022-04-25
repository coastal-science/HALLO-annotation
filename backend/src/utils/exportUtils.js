import { cloneElement } from 'react';

export async function exportToCsv(
    gridElement,
    fileName
) {
    const { head, body, foot } = await getGridContent(gridElement);
    const content = [...head, ...body, ...foot]
        .map((cells) => cells.map(serialiseCellValue).slice(1).join(','))
        .join('\n');

    downloadFile(fileName, new Blob([content], { type: 'text/csv;charset=utf-8;' }));
}



async function getGridContent(gridElement) {
    const { renderToStaticMarkup } = await import('react-dom/server');
    const grid = document.createElement('div');
    grid.innerHTML = renderToStaticMarkup(
        cloneElement(gridElement, {
            enableVirtualization: false
        })
    );

    return {
        head: getRows('.rdg-header-row'),
        body: getRows('.rdg-row:not(.rdg-summary-row)'),
        foot: getRows('.rdg-summary-row')
    };

    function getRows(selector) {
        return Array.from(grid.querySelectorAll(selector)).map((gridRow) => {
            return Array.from(gridRow.querySelectorAll('.rdg-cell')).map(
                (gridCell) => gridCell.innerText
            );
        });
    }
}

function serialiseCellValue(value) {
    if (typeof value === 'string') {
        const formattedValue = value.replace(/"/g, '""');
        return formattedValue.includes(',') ? `"${formattedValue}"` : formattedValue;
    }
    return value;
}

function downloadFile(fileName, data) {
    const downloadLink = document.createElement('a');
    downloadLink.download = fileName;
    const url = URL.createObjectURL(data);
    downloadLink.href = url;
    downloadLink.click();
    URL.revokeObjectURL(url);
}
