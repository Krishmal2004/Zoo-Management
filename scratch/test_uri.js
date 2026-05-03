
function getServerOriginUrl() {
  return "http://192.168.1.10:5000";
}

function resolveUploadsFileUri(relativeOrAbsolutePath) {
  const raw = String(relativeOrAbsolutePath || '').trim();
  if (!raw) return null;
  if (raw.startsWith('file://')) return raw;
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    // Simplified simulation of the logic
    return raw;
  }
  const pathPart = raw.startsWith('/') ? raw : `/${raw}`;
  const origin = getServerOriginUrl().replace(/\/+$/, '');
  return `${origin}${pathPart}`;
}

console.log("Cloudinary:", resolveUploadsFileUri("https://res.cloudinary.com/demo/image/upload/sample.jpg"));
console.log("Local path:", resolveUploadsFileUri("/uploads/feedback/123.jpg"));
console.log("Local path no slash:", resolveUploadsFileUri("uploads/feedback/123.jpg"));
console.log("Empty:", resolveUploadsFileUri(""));
console.log("Null:", resolveUploadsFileUri(null));
