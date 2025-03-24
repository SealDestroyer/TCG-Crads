// $(document).ready(function () {
//     const qrScanner = new Html5Qrcode("reader");
  
//     const config = {
//       fps: 10,
//     };
  
//     function onScanSuccess(decodedText, decodedResult) {
//       console.log("Scanned QR:", decodedText);
  
//       // Auto-show question modal (for now just preview the scanned value)
//       $("#questionModal").fadeIn();
//       $("#question-text").text("Scanned QR: " + decodedText);
  
//       // Stop scanner after scan
//       qrScanner.stop().then(() => {
//         console.log("Scanner stopped after successful scan.");
//       });
//     }
  
//     qrScanner.start(
//       { facingMode: "environment" },
//       config,
//       onScanSuccess,
//       (errMsg) => {
//         // console.warn("QR scan error", errMsg);
//       }
//     ).catch((err) => {
//       console.error("Scanner error:", err);
//     });
//   });

let qrScanner; // make scanner global so we can stop it on unload

$(document).ready(function () {
  qrScanner = new Html5Qrcode("reader");

  const config = {
    fps: 10
    // Optionally add: qrbox: { width: 300, height: 300 }
  };

  function onScanSuccess(decodedText, decodedResult) {
    console.log("Scanned QR:", decodedText);

    // ✅ Show question modal
    $("#questionModal").fadeIn();
    $("#question-text").text("Scanned QR: " + decodedText);

    // ✅ Stop scanner after successful scan
    qrScanner.stop().then(() => {
      console.log("Scanner stopped after successful scan.");
    }).catch((err) => {
      console.error("Error stopping scanner:", err);
    });
  }

  // ✅ Start scanner
  qrScanner.start(
    { facingMode: "environment" },
    config,
    onScanSuccess,
    (errMsg) => {
      // You can log scan attempt errors here if needed
      // console.warn("QR scan error:", errMsg);
    }
  ).catch((err) => {
    alert("⚠️ Cannot start camera. Please check permission or close other apps.");
    console.error("Scanner start error:", err);
  });
});

// ✅ Stop scanner when tab closes, page reloads, or user leaves
window.addEventListener("beforeunload", function () {
  if (qrScanner) {
    qrScanner.stop().then(() => {
      console.log("Scanner stopped on page unload.");
    }).catch((err) => {
      console.log("Error stopping camera:", err);
    });
  }
});
