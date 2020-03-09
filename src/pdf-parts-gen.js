import marked from 'marked';
import { rowLinesTableLayout } from '@/table-layouts';
import { getMarkDownDef } from '@/markdown';
import {
  getTypeInfo,
  schemaInObjectNotation,
  objectToTree,
  objectToTableTree,
} from '@/object-tree-gen';

// Info Def
export function getInfoDef(spec, bookTitle, localize) {
  let content;
  if (spec.info) {
    let contactDef = [];
    let contactName;
    let contactEmail;
    let contactUrl;
    let termsOfService;

    if (spec.info.contact) {
      if (spec.info.contact.name) {
        contactName = { text: [{ text: `\n${localize.name}: `, style: ['b', 'small'] }, { text: spec.info.contact.name, style: ['small'] }] };
      }
      if (spec.info.contact.email) {
        contactEmail = { text: [{ text: `\n${localize.email}: `, style: ['b', 'small'] }, { text: spec.info.contact.email, style: ['small'] }] };
      }
      if (spec.info.contact.url) {
        contactUrl = { text: [{ text: `\n${localize.url}: `, style: ['b', 'small'] }, { text: spec.info.contact.url, style: ['small', 'blue'], link: spec.info.contact.url }] };
      }
      if (spec.info.termsOfService) {
        termsOfService = { text: [{ text: `\n${localize.termsOfService}: `, style: ['b', 'small'] }, { text: spec.info.termsOfService, style: ['small', 'blue'], link: spec.info.termsOfService }] };
      }
      contactDef = [
        { text: localize.contact, style: ['p', 'b', 'topMargin3'] },
        {
          text: [
            contactName,
            contactEmail,
            contactUrl,
            termsOfService,
          ],
        },
      ];
    }

    let specInfDescrMarkDef;
    if (spec.info.description) {
      const tokens = marked.lexer(spec.info.description);
      specInfDescrMarkDef = {
        stack: getMarkDownDef(tokens),
        style: ['topMargin3'],
      };
    } else {
      specInfDescrMarkDef = '';
    }

    content = [
      { image: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAABJ0AAADqCAIAAACHuqN6AAAACXBIWXMAAC4jAAAuIwF4pT92AAAUhmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwZGY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGRmLzEuMy8iIHhtbG5zOkZBMT0iaHR0cDovL25zLkluc2lkZXJTb2Z0d2FyZS5jb20vZm9udGxpc3QvMS4wLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNS0xMS0xOFQxNTowNTozNSswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wNS0xOFQxMzoxNTo0MiswMjowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMDUtMThUMTM6MTU6NDIrMDI6MDAiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgSW5EZXNpZ24gQ0MgMjAxNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4NTRlZmQ2ZS01YWYzLTQ2ZWYtOWZhNC0wN2Y3MmQxMmQ3NjQiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo5MzlCM0U5RTJEMjA2ODExODIyQTk0ODgzQkE5QTI5OSIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjgwZDE1OGJhLTVmMmEtMzA0Ni1hOTRiLWIxZmIwMDg4MmQ0NiIgeG1wTU06UmVuZGl0aW9uQ2xhc3M9InByb29mOnBkZiIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBkZjpQcm9kdWNlcj0iQWRvYmUgUERGIExpYnJhcnkgMTUuMCIgcGRmOlRyYXBwZWQ9IkZhbHNlIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gYXBwbGljYXRpb24veC1pbmRlc2lnbiB0byBhcHBsaWNhdGlvbi9wZGYiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIEluRGVzaWduIENDIDIwMTUgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iIHN0RXZ0OndoZW49IjIwMTUtMTEtMThUMTU6MDU6MzUrMDE6MDAiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi9wZGYgdG8gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZGU4ZjBhZGEtZWVjNC00YWMwLWI0MTItNTg5ZTBlZTIzZGQzIiBzdEV2dDp3aGVuPSIyMDE4LTA1LTE4VDEzOjE1OjQyKzAyOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3BkZiB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImRlcml2ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImNvbnZlcnRlZCBmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo4NTRlZmQ2ZS01YWYzLTQ2ZWYtOWZhNC0wN2Y3MmQxMmQ3NjQiIHN0RXZ0OndoZW49IjIwMTgtMDUtMThUMTM6MTU6NDIrMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpkZThmMGFkYS1lZWM0LTRhYzAtYjQxMi01ODllMGVlMjNkZDMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ZGU4ZjBhZGEtZWVjNC00YWMwLWI0MTItNTg5ZTBlZTIzZGQzIiBzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6OTM5QjNFOUUyRDIwNjgxMTgyMkE5NDg4M0JBOUEyOTkiIHN0UmVmOnJlbmRpdGlvbkNsYXNzPSJwcm9vZjpwZGYiLz4gPEZBMTpQb3N0c2NyaXB0TmFtZT4gPHJkZjpCYWc+IDxyZGY6bGk+TWluaW9uUHJvLVJlZ3VsYXI8L3JkZjpsaT4gPC9yZGY6QmFnPiA8L0ZBMTpQb3N0c2NyaXB0TmFtZT4gPEZBMTpQcm9maWxlQmxvYj4gPHJkZjpCYWc+IDxyZGY6bGk+UEQ5NGJXd2dkbVZ5YzJsdmJqMGlNUzR3SWlCbGJtTnZaR2x1WnowaVZWUkdMVGdpUHo0S1BDRkVUME5VV1ZCRklIQnNhWE4wSUZCVlFreEpReUFpTFM4dlFYQndiR1V2TDBSVVJDQlFURWxUVkNBeExqQXZMMFZPSWlBaWFIUjBjRG92TDNkM2R5NWhjSEJzWlM1amIyMHZSRlJFY3k5UWNtOXdaWEowZVV4cGMzUXRNUzR3TG1SMFpDSStDanh3YkdsemRDQjJaWEp6YVc5dVBTSXhMakFpUGdvOFpHbGpkRDRLQ1R4clpYaytRMVJHYjI1MFEyOXdlWEpwWjJoMFRtRnRaVHd2YTJWNVBnb0pQSE4wY21sdVp6N0NxU0F4T1Rrd0xDQXhPVGt4TENBeE9Ua3lMQ0F4T1RrMExDQXhPVGszTENBeE9UazRMQ0F5TURBd0xDQXlNREF5TENBeU1EQTBJRUZrYjJKbElGTjVjM1JsYlhNZ1NXNWpiM0p3YjNKaGRHVmtMaUJCYkd3Z2NtbG5hSFJ6SUhKbGMyVnlkbVZrTGp3dmMzUnlhVzVuUGdvSlBHdGxlVDVEVkVadmJuUkVaWE5wWjI1bGNrNWhiV1U4TDJ0bGVUNEtDVHh6ZEhKcGJtYytVbTlpWlhKMElGTnNhVzFpWVdOb1BDOXpkSEpwYm1jK0NnazhhMlY1UGtOVVJtOXVkRVpoYldsc2VVNWhiV1U4TDJ0bGVUNEtDVHh6ZEhKcGJtYytUV2x1YVc5dUlGQnliend2YzNSeWFXNW5QZ29KUEd0bGVUNURWRVp2Ym5SR2RXeHNUbUZ0WlR3dmEyVjVQZ29KUEhOMGNtbHVaejVOYVc1cGIyNGdVSEp2UEM5emRISnBibWMrQ2drOGEyVjVQa05VUm05dWRFZGxkRWRzZVhCb1EyOTFiblE4TDJ0bGVUNEtDVHhwYm5SbFoyVnlQakUyT0RJOEwybHVkR1ZuWlhJK0NnazhhMlY1UGtOVVJtOXVkRXhwWTJWdWMyVlZVa3hPWVcxbFBDOXJaWGsrQ2drOGMzUnlhVzVuUG1oMGRIQTZMeTkzZDNjdVlXUnZZbVV1WTI5dEwzUjVjR1V2YkdWbllXd3VhSFJ0YkR3dmMzUnlhVzVuUGdvSlBHdGxlVDVEVkVadmJuUk5ZVzUxWm1GamRIVnlaWEpPWVcxbFBDOXJaWGsrQ2drOGMzUnlhVzVuUGtGa2IySmxJRk41YzNSbGJYTWdTVzVqYjNKd2IzSmhkR1ZrUEM5emRISnBibWMrQ2drOGEyVjVQa05VUm05dWRGQnZjM1JUWTNKcGNIUk9ZVzFsUEM5clpYaytDZ2s4YzNSeWFXNW5QazFwYm1sdmJsQnlieTFTWldkMWJHRnlQQzl6ZEhKcGJtYytDZ2s4YTJWNVBrTlVSbTl1ZEZOMVlrWmhiV2xzZVU1aGJXVThMMnRsZVQ0S0NUeHpkSEpwYm1jK1VtVm5kV3hoY2p3dmMzUnlhVzVuUGdvSlBHdGxlVDVEVkVadmJuUlVjbUZrWlcxaGNtdE9ZVzFsUEM5clpYaytDZ2s4YzNSeWFXNW5QazFwYm1sdmJpQnBjeUJsYVhSb1pYSWdZU0J5WldkcGMzUmxjbVZrSUhSeVlXUmxiV0Z5YXlCdmNpQmhJSFJ5WVdSbGJXRnlheUJ2WmlCQlpHOWlaU0JUZVhOMFpXMXpJRWx1WTI5eWNHOXlZWFJsWkNCcGJpQjBhR1VnVlc1cGRHVmtJRk4wWVhSbGN5QmhibVF2YjNJZ2IzUm9aWElnWTI5MWJuUnlhV1Z6TGp3dmMzUnlhVzVuUGdvSlBHdGxlVDVEVkVadmJuUlZibWx4ZFdWT1lXMWxQQzlyWlhrK0NnazhjM1J5YVc1blBqSXVNVEE0TzBGRVFrVTdUV2x1YVc5dVVISnZMVkpsWjNWc1lYSTdRVVJQUWtVOEwzTjBjbWx1Wno0S0NUeHJaWGsrUTFSR2IyNTBWbVZ1Wkc5eVZWSk1UbUZ0WlR3dmEyVjVQZ29KUEhOMGNtbHVaejVvZEhSd09pOHZkM2QzTG1Ga2IySmxMbU52YlM5MGVYQmxQQzl6ZEhKcGJtYytDZ2s4YTJWNVBrTlVSbTl1ZEZabGNuTnBiMjVPWVcxbFBDOXJaWGsrQ2drOGMzUnlhVzVuUGxabGNuTnBiMjRnTWk0eE1EZzdVRk1nTWk0d01EQTdhRzkwWTI5dWRpQXhMakF1TmpjN2JXRnJaVzkwWmk1c2FXSXlMalV1TXpNeE5qZzhMM04wY21sdVp6NEtDVHhyWlhrK1ltOXNaQ0IwY21GcGREd3ZhMlY1UGdvSlBHWmhiSE5sTHo0S0NUeHJaWGsrWTI5dVpHVnVjMlZrSUhSeVlXbDBQQzlyWlhrK0NnazhabUZzYzJVdlBnb0pQR3RsZVQ1bGVIUmxibVJsWkNCMGNtRnBkRHd2YTJWNVBnb0pQR1poYkhObEx6NEtDVHhyWlhrK1puVnNiQ0J1WVcxbFBDOXJaWGsrQ2drOGMzUnlhVzVuUGsxcGJtbHZiaUJRY204OEwzTjBjbWx1Wno0S0NUeHJaWGsrYVhSaGJHbGpJSFJ5WVdsMFBDOXJaWGsrQ2drOFptRnNjMlV2UGdvSlBHdGxlVDV0YjI1dmMzQmhZMlZrSUhSeVlXbDBQQzlyWlhrK0NnazhabUZzYzJVdlBnb0pQR3RsZVQ1d2IzTjBjMk55YVhCMFRtRnRaVHd2YTJWNVBnb0pQSE4wY21sdVp6NU5hVzVwYjI1UWNtOHRVbVZuZFd4aGNqd3ZjM1J5YVc1blBnb0pQR3RsZVQ1d2NtOXdiM0owYVc5dUlIUnlZV2wwUEM5clpYaytDZ2s4Y21WaGJENHdMakE4TDNKbFlXdytDZ2s4YTJWNVBuTnNZVzUwSUhSeVlXbDBQQzlyWlhrK0NnazhjbVZoYkQ0d0xqQThMM0psWVd3K0NnazhhMlY1UG5abGNuTnBiMjQ4TDJ0bGVUNEtDVHh6ZEhKcGJtYytWbVZ5YzJsdmJpQXlMakV3T0R0UVV5QXlMakF3TUR0b2IzUmpiMjUySURFdU1DNDJOenR0WVd0bGIzUm1MbXhwWWpJdU5TNHpNekUyT0R3dmMzUnlhVzVuUGdvSlBHdGxlVDUyWlhKMGFXTmhiQ0IwY21GcGREd3ZhMlY1UGdvSlBHWmhiSE5sTHo0S0NUeHJaWGsrZDJWcFoyaDBJSFJ5WVdsMFBDOXJaWGsrQ2drOGNtVmhiRDR3TGpBOEwzSmxZV3crQ2p3dlpHbGpkRDRLUEM5d2JHbHpkRDRLPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9GQTE6UHJvZmlsZUJsb2I+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8++cgdYgAAMNFJREFUeJzt3WdcU2f/x/ETNgiCgDKU4QL3oK6696hat7Z11rqtXdatdVurdY/Wtu69rXvvvXCLCCqKgAiyNyT/B/bvba1yDiMnOcnn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', width: 200 },
      { text: bookTitle || localize.apiReference, style: ['h2', 'primary', 'right', 'b', 'topMargin1'] },
      (spec.info.title ? { text: spec.info.title, style: ['title', 'right'] } : ''),
      (spec.info.version ? { text: `${localize.apiVersion}: ${spec.info.version}`, style: ['p', 'b', 'right', 'alternate'] } : ''),
      specInfDescrMarkDef,
      ...contactDef,
      { text: '', pageBreak: 'after' },
    ];
  } else {
    content = [
      { text: bookTitle || localize.apiReference, style: ['h1', 'bold', 'primary', 'right', 'topMargin1'] },
      { text: '', pageBreak: 'after' },
    ];
  }
  return content;
}

// Security Def
export function getSecurityDef(spec, localize) {
  const content = [];
  if (spec.securitySchemes) {
    content.push({ text: localize.securityAndAuthentication, style: ['h3', 'b', 'primary', 'right', 'topMargin3'] });
    content.push({ text: localize.securitySchemes, style: ['b', 'tableMargin'] });
    const tableContent = [
      [{ text: localize.key, style: ['small', 'b'] }, { text: localize.type, style: ['small', 'b'] }, { text: localize.description, style: ['small', 'b'] }],
    ];
    for (const key in spec.securitySchemes) {
      tableContent.push([
        key,
        spec.securitySchemes[key].type + (spec.securitySchemes[key].scheme ? (`, ${spec.securitySchemes[key].scheme}`) : '') + (spec.securitySchemes[key].bearerFormat ? (`, ${spec.securitySchemes[key].bearerFormat}`) : ''),
        spec.securitySchemes[key].description ? spec.securitySchemes[key].description : '',
      ]);
    }

    content.push({
      table: {
        headerRows: 1,
        body: tableContent,
      },
      layout: rowLinesTableLayout,
      style: 'tableMargin',
      pageBreak: 'after',
    });
  }
  return content;
}

// Parameter Table
function getParameterTableDef(parameters, paramType, localize, includeExample = false) {
  // let filteredParams= parameters ? parameters.filter(param => param.in === paramType):[];
  if (parameters === undefined || parameters.length === 0) {
    return;
  }
  const tableContent = [
    [
      { text: localize.name, style: ['sub', 'b', 'alternate'] },
      { text: localize.type, style: ['sub', 'b', 'alternate'] },
      { text: includeExample ? localize.example : '', style: ['sub', 'b', 'alternate'] },
      { text: localize.description, style: ['sub', 'b', 'alternate'] },
    ],
  ];
  if (paramType === 'FORM DATA') {
    for (const paramName in parameters) {
      const param = parameters[paramName];
      let { type } = param;
      const format = param.format === 'binary' ? '(binary)' : '';
      if (type === 'array') {
        type = `array of ${param.items.type}`;
      }
      tableContent.push([
        { text: paramName, style: ['small', 'mono'] },
        { text: type + format, style: ['small', 'mono'] },
        { text: includeExample ? (param.example ? param.example : (param.examples && param.examples[0] ? param.examples[0] : '')) : '', style: ['small'], margin: [0, 2, 0, 0] },
        { text: param.description, style: ['small'], margin: [0, 2, 0, 0] },
      ]);
    }
  } else {
    parameters.map((param) => {
      const paramSchema = getTypeInfo(param.schema);
      tableContent.push([
        {
          text: [
            { text: param.required ? '*' : '', style: ['small', 'b', 'red', 'mono'] },
            { text: param.name, style: ['small', 'mono'] },
            (paramSchema.deprecated ? { text: `\n${localize.deprecated}`, style: ['small', 'red', 'b'] } : ''),
          ],
        },
        {
          stack: [
            { text: `${paramSchema.type === 'array' ? paramSchema.arrayType : (paramSchema.format ? paramSchema.format : paramSchema.type)}`, style: ['small', 'mono'] },
            (paramSchema.constrain ? { text: paramSchema.constrain, style: ['small', 'gray'] } : ''),
            (paramSchema.allowedValues ? {
              text: [
                { text: `${localize.allowed}: `, style: ['b', 'sub'] },
                { text: paramSchema.allowedValues, style: ['small', 'lightGray'] },
              ],
            } : ''
            ),
            (paramSchema.pattern ? { text: `${localize.pattern}: ${paramSchema.pattern}`, style: ['small', 'gray'] } : ''),
          ],
        },
        { text: includeExample ? (param.example ? param.example : (param.examples && param.examples[0] ? param.examples[0] : '')) : '', style: ['small'], margin: [0, 2, 0, 0] },
        { text: param.description, style: ['small'], margin: [0, 2, 0, 0] },
      ]);
    });
  }

  return [
    { text: `${paramType} ${localize.parameters}`.toUpperCase(), style: ['small', 'b'], margin: [0, 10, 0, 0] },
    {
      table: {
        headerRows: 1,
        dontBreakRows: true,
        widths: ['auto', 'auto', includeExample ? 'auto' : 0, '*'],
        body: tableContent,
      },
      layout: rowLinesTableLayout,
      style: 'tableMargin',
    },
  ];
}

// Request Body Def
function getRequestBodyDef(requestBody, schemaStyle, localize) {
  if (!requestBody) {
    return;
  }
  const content = [];
  let formParamDef;
  for (const contentType in requestBody.content) {
    const contentTypeObj = requestBody.content[contentType];
    const requestBodyDef = [
      { text: `${localize.requestBody} - ${contentType}`, margin: [0, 10, 0, 0], style: ['small', 'b'] },
    ];

    if ((contentType.includes('form') || contentType.includes('multipart-form')) && contentTypeObj.schema) {
      formParamDef = getParameterTableDef(contentTypeObj.schema.properties, 'FORM DATA', localize);
      content.push(formParamDef);
    } else if (contentType.includes('json') || contentType.includes('xml')) {
      let origSchema = requestBody.content[contentType].schema;
      if (origSchema) {
        origSchema = JSON.parse(JSON.stringify(origSchema));
        const schemaInObjectNotaion = schemaInObjectNotation(origSchema);

        if (schemaStyle === 'object') {
          let treeDef;
          if (schemaInObjectNotaion['::type'] && schemaInObjectNotaion['::type'] === 'array') {
            treeDef = objectToTree(schemaInObjectNotaion['::props'], localize, 'array');
          } else {
            treeDef = objectToTree(schemaInObjectNotaion, localize);
          }
          requestBodyDef.push(treeDef);
        } else {
          // if Schema Style is Tree
          let schemaTableTreeDef;
          if (schemaInObjectNotaion['::type'] && schemaInObjectNotaion['::type'] === 'array') {
            schemaTableTreeDef = objectToTableTree(schemaInObjectNotaion['::prop'], localize, 'array');
          } else {
            schemaTableTreeDef = objectToTableTree(schemaInObjectNotaion, localize);
          }
          if (schemaTableTreeDef && schemaTableTreeDef.length > 0 && Array.isArray(schemaTableTreeDef[0]) && schemaTableTreeDef[0].length > 0) {
            schemaTableTreeDef.unshift([
              { text: localize.name, style: ['sub', 'b', 'alternate'] },
              { text: localize.type, style: ['sub', 'b', 'alternate'] },
              { text: localize.description, style: ['sub', 'b', 'alternate'] },
            ]);

            requestBodyDef.push({
              table: {
                headerRows: 1,
                body: schemaTableTreeDef,
              },
              layout: rowLinesTableLayout,
              margin: [0, 3, 0, 0],
            });
          }
        }
      }
      content.push(requestBodyDef);
    }
  }
  return content;
}

// Response Def
function getResponseDef(responses, schemaStyle, localize) {
  const respDef = [];
  for (const statusCode in responses) {
    const allResponseDefs = [];
    for (const contentType in responses[statusCode].content) {
      const responseDef = [
        { text: `${localize.responseModel} - ${contentType}`, margin: [10, 10, 0, 0], style: ['small', 'b'] },
      ];

      let origSchema = responses[statusCode].content[contentType].schema;
      if (origSchema) {
        origSchema = JSON.parse(JSON.stringify(origSchema));
        const schemaInObjectNotaion = schemaInObjectNotation(origSchema);
        if (schemaStyle === 'object') {
          let schemaTreeDef;
          if (schemaInObjectNotaion['::type'] && schemaInObjectNotaion['::type'] === 'array') {
            schemaTreeDef = objectToTree(schemaInObjectNotaion['::props'], localize, 'array');
          } else {
            schemaTreeDef = objectToTree(schemaInObjectNotaion, localize);
          }
          if (Array.isArray(schemaTreeDef) && schemaTreeDef.length > 0) {
            schemaTreeDef[0].margin = [10, 5, 0, 0];
            responseDef.push(schemaTreeDef);
          }
        } else {
          // If Schema style is Table-Tree
          let schemaTableTreeDef;
          let rootObjectType;
          if (schemaInObjectNotaion['::type'] && schemaInObjectNotaion['::type'] === 'array') {
            schemaTableTreeDef = objectToTableTree(schemaInObjectNotaion['::props'], localize);
            rootObjectType = [{ text: 'ARRAY OF OBJECT WITH BELOW STRUCTURE', style: ['sub', 'b', 'alternate'], colSpan: 3 }];
          } else {
            schemaTableTreeDef = objectToTableTree(schemaInObjectNotaion, localize);
            rootObjectType = [{ text: 'OBJECT WITH BELOW STRUCTURE', style: ['sub', 'b', 'alternate'], colSpan: 3 }];
          }
          if (schemaTableTreeDef && schemaTableTreeDef.length > 0 && Array.isArray(schemaTableTreeDef[0]) && schemaTableTreeDef[0].length > 0) {
            schemaTableTreeDef.unshift(rootObjectType);
            schemaTableTreeDef.unshift([
              { text: localize.name, style: ['sub', 'b', 'alternate'] },
              { text: localize.type, style: ['sub', 'b', 'alternate'] },
              { text: localize.description, style: ['sub', 'b', 'alternate'] },
            ]);

            responseDef.push({
              table: {
                headerRows: 1,
                body: schemaTableTreeDef,
                dontBreakRows: true,
              },
              layout: rowLinesTableLayout,
              margin: [10, 3, 0, 0],
            });
          }
        }
      }
      allResponseDefs.push(responseDef);
    }
    respDef.push({
      text: [
        { text: `${localize.statusCode} - ${statusCode}: `, style: ['small', 'b'] },
        { text: responses[statusCode].description, style: ['small'] },
      ],
      margin: [0, 10, 0, 0],
    });
    if (allResponseDefs.length > 0) {
      respDef.push(allResponseDefs);
    }
  }
  return respDef;
}

// API details def
export function getApiDef(spec, filterPath, schemaStyle, localize, includeExample) {
  const content = [{ text: localize.api, style: ['h2', 'b'] }];
  let tagSeq = 0;

  spec.tags.map((tag) => {
    const operationContent = [];
    let pathSeq = 0;

    for (let j = 0; j < tag.paths.length; j++) {
      const path = tag.paths[j];
      if (filterPath.trim() !== '') {
        if (path.path.includes(filterPath) === false) {
          continue;
        }
      }
      pathSeq += 1;
      operationContent.push({
        text: `${tagSeq + 1}.${pathSeq} ${path.method.toUpperCase()} ${path.path}`,
        style: ['topMargin3', 'mono', 'p', 'primary', 'b'],
        tocItem: true,
        tocStyle: ['small', 'blue', 'mono'],
        tocNumberStyle: ['small', 'blue', 'mono'],
      });
      operationContent.push({ text: '', style: ['topMarginRegular'] });

      let pathSummaryMarkDef; let pathDescrMarkDef; let
        tokens;
      if (path.summary) {
        tokens = marked.lexer(path.summary);
        pathSummaryMarkDef = {
          stack: getMarkDownDef(tokens),
          style: ['primary', 'b'],
        };
        operationContent.push(pathSummaryMarkDef);
      }
      if (path.description && path.description.trim() !== path.summary.trim()) {
        tokens = marked.lexer(path.description);
        pathDescrMarkDef = {
          stack: getMarkDownDef(tokens),
        };
        operationContent.push(pathDescrMarkDef);
      }

      // Generate Request Defs
      const requestSetDef = [];
      const pathParams = path.parameters ? path.parameters.filter((param) => param.in === 'path') : null;
      const queryParams = path.parameters ? path.parameters.filter((param) => param.in === 'query') : null;
      const headerParams = path.parameters ? path.parameters.filter((param) => param.in === 'header') : null;
      const cookieParams = path.parameters ? path.parameters.filter((param) => param.in === 'cookie') : null;

      const pathParamTableDef = getParameterTableDef(pathParams, 'path', localize, includeExample);
      const queryParamTableDef = getParameterTableDef(queryParams, 'query', localize, includeExample);
      const requestBodyTableDefs = getRequestBodyDef(path.requestBody, schemaStyle, localize, includeExample);
      const headerParamTableDef = getParameterTableDef(headerParams, 'header', localize, includeExample);
      const cookieParamTableDef = getParameterTableDef(cookieParams, 'cookie', localize, includeExample);
      operationContent.push({ text: localize.request, style: ['p', 'b', 'alternate'], margin: [0, 10, 0, 0] });
      if (pathParamTableDef || queryParamTableDef || headerParamTableDef || cookieParamTableDef || requestBodyTableDefs) {
        if (pathParamTableDef) {
          requestSetDef.push(pathParamTableDef);
        }
        if (queryParamTableDef) {
          requestSetDef.push(queryParamTableDef);
        }
        if (requestBodyTableDefs) {
          requestBodyTableDefs.map((v) => {
            requestSetDef.push(v);
          });
        }
        if (headerParamTableDef) {
          requestSetDef.push(headerParamTableDef);
        }
        if (cookieParamTableDef) {
          requestSetDef.push(cookieParamTableDef);
        }
      } else {
        requestSetDef.push({ text: localize.noRequestParameters, style: ['small', 'gray'], margin: [0, 5, 0, 0] });
      }
      if (requestSetDef && requestSetDef.length > 0) {
        operationContent.push({
          stack: requestSetDef,
          margin: [10, 0, 0, 0],
        });
      }

      // Generate Response Defs
      operationContent.push({ text: localize.response, style: ['p', 'b', 'alternate'], margin: [0, 10, 0, 0] });
      const respDef = getResponseDef(path.responses, schemaStyle, localize);
      if (respDef && respDef.length > 0) {
        operationContent.push({
          stack: respDef,
          margin: [10, 5, 0, 5],
        });
      }

      // End of Operation - Line
      operationContent.push({
        canvas: [{
          type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 35, y2: 5, lineWidth: 0.5, lineColor: '#cccccc',
        }],
      });
    }

    if (pathSeq > 0) {
      tagSeq += 1;
      let tagDescrMarkDef; let
        tokens;
      if (tag.description) {
        tokens = marked.lexer(tag.description);
        tagDescrMarkDef = {
          stack: getMarkDownDef(tokens),
          style: ['topMarginRegular'],
        };
      } else {
        tagDescrMarkDef = { text: '' };
      }

      content.push(
        {
          text: `${tagSeq}. ${tag.name.toUpperCase()}`,
          style: ['h2', 'b', 'primary', 'tableMargin'],
          tocItem: true,
          tocStyle: ['small', 'b'],
          tocMargin: [0, 10, 0, 0],
        },
        tagDescrMarkDef,
        operationContent,
        { text: '', pageBreak: 'after' },
      );
    }
  });
  return content;
}


// API List Def
export function getApiListDef(spec, sectionHeading, localize) {
  const content = [{ text: sectionHeading, style: ['h3', 'b'], pageBreak: 'none' }];
  spec.tags.map((tag, i) => {
    const tableContent = [
      [{ text: localize.method, style: ['small', 'b'] }, { text: localize.api, style: ['small', 'b'] }],
    ];

    tag.paths.map((path) => {
      tableContent.push([
        { text: path.method, style: ['small', 'mono', 'right'] },
        {
          margin: [0, 0, 0, 2],
          stack: [
            { text: path.path, style: ['small', 'mono'] },
            { text: path.summary, style: ['small', 'gray'] },
          ],

        },
      ]);
    });

    content.push(
      { text: tag.name, style: ['h6', 'b', 'primary', 'tableMargin'], pageBreak: i === 0 ? 'none' : 'after' },
      { text: tag.description, style: ['p'] },
      {
        table: {
          headerRows: 1,
          dontBreakRows: true,
          widths: ['auto', '*'],
          body: tableContent,
        },
        layout: rowLinesTableLayout,
        style: 'tableMargin',
      },
    );
  });

  return content;
}
