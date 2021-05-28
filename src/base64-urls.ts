

/*async function fetchResource(url) {
  const headers = new Headers();
  const response = await fetch(url, { headers });
  if (!response.ok) {
      throw new Error(response.statusText);
  }
  const blob = await response.blob();
  return blob;
}

async function blobToDataURL(blob: Blob) {
  const reader = new FileReader();
  await new Promise((resolve, reject) => {
      reader.addEventListener('error', () => reject(new Error('Error loading resource with FileLoader')));
      reader.addEventListener('load', () => resolve(null));
      reader.readAsDataURL(blob);
  });
  return new URL(reader.result as string);
}*/

/*const blob = await fetchResource('https://fonts.cdnfonts.com/s/12183/SourceSansPro-Regular.woff');
        const url = await blobToDataURL(blob);

        console.log('URL: ', url);

        svgDocument.getElementsByTagName("style")[0].innerHTML = `@font-face {
          font-family: 'JetBrains Mono';
          src: url('${url.href}') format('woff');
          font-weight: normal;
          font-style: normal;
      }`;*/