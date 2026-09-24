// extension -> accepted mime types
const MIME_BY_EXT = {
  mp4: ['video/mp4'],
  mov: ['video/quicktime'],
  pdf: ['application/pdf'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
};

const mimeTypesFor = (exts) => [...new Set(exts.flatMap((e) => MIME_BY_EXT[e] || []))];

module.exports = { MIME_BY_EXT, mimeTypesFor };
