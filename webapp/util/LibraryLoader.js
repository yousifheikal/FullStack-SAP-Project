sap.ui.define([], function () {
  'use strict';
  return {
    loadJsPDF: function () {
      function loadScript(src) {
        return new Promise(function (resolve, reject) {
          var script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      return loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      )
        .then(() =>
          loadScript(
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js'
          )
        )
        .then(() => {
          console.log('jsPDF Loaded');
        });
    },
  };
});