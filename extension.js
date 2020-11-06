/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals getParameterByName, $, sendMessageToHost, isWeb, isFirefox */

sendMessageToHost({ command: 'loadDefaultTextContent' });

$(document).ready(init);
function init() {
  const filePath = getParameterByName('file');
  const extensionID = 'viewerBrowser'; // ID should be equal to the directory name where the ext. is located
  // const extensionType = 'viewer';
  console.log('Loading ' + extensionID);

  // const TSCORE = require('tscore');
  let containerElID;
  let $containerElement;

  console.log('Initalization Text Viewer...');
  containerElID = containerElementID;
  $containerElement = $('#' + containerElID);

  let filePathURI;
  if (isCordova || isWeb) {
    filePathURI = filePath;
  } else {
    filePathURI = 'file:///' + filePath;
  }

  const fileExt = filePath
    .split('.')
    .pop()
    .toLowerCase();

  $containerElement.empty();
  $containerElement.css('background-color', 'white');

  if (
    (fileExt.indexOf('htm') === 0 ||
      fileExt.indexOf('xhtm') === 0 ||
      fileExt.indexOf('txt') === 0) &&
    !isFirefox
  ) {
    $containerElement.append(
      $('<iframe>', {
        sandbox: 'allow-same-origin allow-scripts',
        id: 'iframeViewer',
        nwdisable: '',
        nwfaketop: ''
      })
    );
  } else {
    $containerElement.append(
      $('<iframe>', {
        // sandbox: "allow-same-origin allow-scripts", // comment out due not loading pdfs in chrome ext
        id: 'iframeViewer',
        src: filePathURI,
        nwdisable: '',
        nwfaketop: ''
      })
    );
  }
}

// fixing embedding of local images
function fixingEmbeddingOfLocalImages($htmlContent, fileDirectory) {
  const hasURLProtocol = url =>
    url.indexOf('http://') === 0 ||
    url.indexOf('https://') === 0 ||
    url.indexOf('file://') === 0 ||
    url.indexOf('data:') === 0;

  $htmlContent.find('img[src]').each((index, link) => {
    const currentSrc = $(link).attr('src');
    if (!hasURLProtocol(currentSrc)) {
      const path = (isWeb ? '' : 'file://') + fileDirectory + '/' + currentSrc;
      $(link).attr('src', path);
    }
  });

  $htmlContent.find('a[href]').each((index, link) => {
    let currentSrc = $(link).attr('href');
    let path;

    if (currentSrc.indexOf('#') === 0) {
      // Leave the default link behaviour by internal links
    } else {
      if (!hasURLProtocol(currentSrc)) {
        path = (isWeb ? '' : 'file://') + fileDirectory + '/' + currentSrc;
        $(link).attr('href', path);
      }

      $(link).off();
      $(link).on('click', e => {
        e.preventDefault();
        if (path) {
          currentSrc = encodeURIComponent(path);
        }
        sendMessageToHost({ command: 'openLinkExternally', link: currentSrc });
      });
    }
  });
}

function setContent(content, fileDirectory) {
  // removing the script tags from the content
  const cleanedContent = content.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );
  const viewerIframe = $('#iframeViewer').get(0);

  if (viewerIframe !== undefined) {
    viewerIframe.contentWindow.document.write(cleanedContent);

    // making all links open in the user default browser
    $(viewerIframe.contentWindow.document)
      .find('a')
      .off('click')
      .on('click', e => {
        e.preventDefault();
      });
  }

  fixingEmbeddingOfLocalImages(viewerIframe, fileDirectory);
}
