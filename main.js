/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

(() => {
  // const locale = getParameterByName('locale');
  const filePath = getParameterByName('file');

  console.log(filePath);

  document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
      const pdfViewer = document.getElementById('plainviewer');
      pdfViewer.setAttribute('src', filePath);
    }
  };
})();
